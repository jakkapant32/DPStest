import type {
  CalibrationLine,
  LaneBand,
  VideoSession,
} from "./video-analysis";

export interface ClientAiResult {
  suggestions: {
    distanceM: number;
    videoTimeSec: number;
    confidence: number;
  }[];
  strokePeaksSec: number[];
  meanConfidence: number;
  samples: number;
  engine: "browser";
  pathPoints?: { t: number; x: number }[];
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const target = Math.min(
      Math.max(0, time),
      Math.max(0, (video.duration || 0) - 0.04)
    );
    if (Math.abs(video.currentTime - target) < 0.001) {
      resolve();
      return;
    }
    const done = () => {
      video.removeEventListener("seeked", done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, 400);
    video.addEventListener("seeked", done);
    try {
      video.currentTime = target;
    } catch {
      done();
    }
  });
}

function laneBandOf(session: VideoSession): LaneBand {
  return (
    session.laneBand ?? {
      // Broadcast overhead: swimmers usually occupy mid-lower frame
      y0Norm: 0.35,
      y1Norm: 0.72,
    }
  );
}

/** Motion + brightness blob centroid — tuned for compressed race broadcasts / screen recordings */
function estimateXInBand(
  prev: Uint8ClampedArray | null,
  curr: Uint8ClampedArray,
  width: number,
  height: number,
  y0: number,
  y1: number
): { xNorm: number; energy: number } | null {
  let sumX = 0;
  let sumW = 0;
  let energy = 0;
  const motionThresh = 14; // lower for Facebook screen-record compression

  // Column energy for motion
  const colEnergy = new Float32Array(width);

  for (let y = y0; y < y1; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const g1 =
        0.299 * curr[i]! + 0.587 * curr[i + 1]! + 0.114 * curr[i + 2]!;
      let d = 0;
      if (prev) {
        const g0 =
          0.299 * prev[i]! + 0.587 * prev[i + 1]! + 0.114 * prev[i + 2]!;
        d = Math.abs(g1 - g0);
      }
      if (d > motionThresh) {
        colEnergy[x]! += d;
        energy += d;
      }
    }
  }

  // Soft blur columns
  for (let x = 1; x < width - 1; x++) {
    colEnergy[x] =
      (colEnergy[x - 1]! + colEnergy[x]! * 2 + colEnergy[x + 1]!) / 4;
  }

  for (let x = 0; x < width; x++) {
    const w = colEnergy[x]!;
    if (w > 0) {
      sumX += x * w;
      sumW += w;
    }
  }

  // Fallback: brightest moving-ish region vs water (use variance of luminance)
  if (sumW < 25 && prev) {
    sumX = 0;
    sumW = 0;
    for (let y = y0; y < y1; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const g0 =
          0.299 * prev[i]! + 0.587 * prev[i + 1]! + 0.114 * prev[i + 2]!;
        const g1 =
          0.299 * curr[i]! + 0.587 * curr[i + 1]! + 0.114 * curr[i + 2]!;
        const d = Math.abs(g1 - g0);
        if (d > 8) {
          sumX += x * d;
          sumW += d;
          energy += d;
        }
      }
    }
  }

  if (sumW < 20) return null;
  return { xNorm: sumX / sumW / Math.max(1, width - 1), energy };
}

function smoothPath(
  points: { t: number; x: number; e: number }[],
  window = 5
): { t: number; x: number; e: number }[] {
  if (points.length === 0) return [];
  const out: { t: number; x: number; e: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    let sx = 0;
    let se = 0;
    let n = 0;
    for (
      let j = Math.max(0, i - window);
      j <= Math.min(points.length - 1, i + window);
      j++
    ) {
      sx += points[j]!.x;
      se += points[j]!.e;
      n += 1;
    }
    out.push({ t: points[i]!.t, x: sx / n, e: se / n });
  }
  return out;
}

function interpolateCrossings(
  path: { t: number; x: number; e: number }[],
  targets: { distanceM: number; xNorm: number; lengthIndex: number }[],
  maxLengths: number
): Map<number, { t: number; confidence: number }> {
  const crossed = new Map<number, { t: number; confidence: number }>();
  if (path.length < 3) return crossed;

  let lengthsDone = 0;
  let direction = 1; // +x outbound
  let lastX = path[0]!.x;

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]!;
    const cur = path[i]!;
    let x0 = prev.x;
    let x1 = cur.x;

    // Turn detection near walls
    if (direction === 1 && lastX > 0.82 && x1 < x0 - 0.04) {
      direction = -1;
      lengthsDone = Math.min(maxLengths - 1, lengthsDone + 1);
    } else if (direction === -1 && lastX < 0.18 && x1 > x0 + 0.04) {
      direction = 1;
      lengthsDone = Math.min(maxLengths - 1, lengthsDone + 1);
    }

    const along0 = lengthsDone % 2 === 0 ? x0 : 1 - x0;
    const along1 = lengthsDone % 2 === 0 ? x1 : 1 - x1;

    for (const target of targets) {
      if (crossed.has(target.distanceM)) continue;
      if (target.lengthIndex > lengthsDone) continue;

      const a = along0 - target.xNorm;
      const b = along1 - target.xNorm;
      const crossedLine = a === 0 || b === 0 || a * b < 0;
      const near =
        Math.abs(along1 - target.xNorm) < 0.03 &&
        Math.abs(along1 - target.xNorm) <= Math.abs(along0 - target.xNorm);

      if (crossedLine || near) {
        let t = cur.t;
        if (crossedLine && Math.abs(b - a) > 1e-6) {
          const u = Math.abs(a) / Math.abs(b - a);
          t = prev.t + u * (cur.t - prev.t);
        }
        const conf = Math.min(
          1,
          0.4 + Math.min(0.5, cur.e / 5000) + (crossedLine ? 0.15 : 0)
        );
        crossed.set(target.distanceM, {
          t: Math.round(t * 1000) / 1000,
          confidence: conf,
        });
      }
    }

    lastX = x1;
  }

  return crossed;
}

/**
 * Browser motion tracker for race clips (incl. Facebook screen recordings).
 * Builds an X-path over time in the lane band, then interpolates distance-line crossings.
 */
export async function analyzeVideoInBrowser(
  video: HTMLVideoElement,
  session: VideoSession,
  onProgress?: (pct: number) => void
): Promise<ClientAiResult> {
  const wasPaused = video.paused;
  video.pause();

  // Wait briefly if metadata not ready
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    await new Promise<void>((resolve) => {
      const done = () => {
        video.removeEventListener("loadedmetadata", done);
        resolve();
      };
      video.addEventListener("loadedmetadata", done);
      window.setTimeout(done, 1500);
    });
  }

  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("วิดีโอยังโหลดไม่พร้อม — ลองเล่นคลิปสักครู่ก่อนกด AI Suggest");
  }

  const startT = Math.max(0, session.raceStartSec ?? 0);
  const endT = duration;
  // denser sampling for short clips / screen recordings
  const step = Math.max(0.05, Math.min(0.12, duration / 600));
  const band = laneBandOf(session);
  const mirrored = Boolean(session.mirrored);
  const length = session.poolType === "LCM" ? 50 : 25;
  const maxLengths = Math.max(1, Math.ceil(session.raceDistance / length));

  const canvas = document.createElement("canvas");
  const maxW = 640;
  const scale = Math.min(1, maxW / (video.videoWidth || maxW));
  canvas.width = Math.max(240, Math.floor((video.videoWidth || 640) * scale));
  canvas.height = Math.max(135, Math.floor((video.videoHeight || 360) * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not available");

  const y0 = Math.floor(band.y0Norm * canvas.height);
  const y1 = Math.max(y0 + 8, Math.floor(band.y1Norm * canvas.height));

  const cal = [...session.calibrationLines].sort(
    (a, b) => a.distanceM - b.distanceM
  );
  const targets: { distanceM: number; xNorm: number; lengthIndex: number }[] =
    [];
  const seen = new Set<number>();
  for (let li = 0; li < maxLengths; li++) {
    const base = li * length;
    for (const c of cal) {
      if (c.distanceM > length) continue;
      const d = li === 0 ? c.distanceM : base + c.distanceM;
      if (d > session.raceDistance || seen.has(d)) continue;
      seen.add(d);
      targets.push({ distanceM: d, xNorm: c.xNorm, lengthIndex: li });
    }
  }
  if (!seen.has(session.raceDistance)) {
    targets.push({
      distanceM: session.raceDistance,
      xNorm: session.raceDistance % length === 0 ? 1 : 0.5,
      lengthIndex: maxLengths - 1,
    });
  }
  targets.sort((a, b) => a.distanceM - b.distanceM);

  const rawPath: { t: number; x: number; e: number }[] = [];
  let prevData: Uint8ClampedArray | null = null;
  let samples = 0;
  const originalTime = video.currentTime;
  const energySeries: { t: number; e: number }[] = [];

  try {
    for (let t = startT; t < endT; t += step) {
      await seekVideo(video, t);
      // Some browsers need a paint tick after seek
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const curr = frame.data;

      const motion = estimateXInBand(
        prevData,
        curr,
        canvas.width,
        canvas.height,
        y0,
        y1
      );

      if (motion) {
        samples += 1;
        let x = motion.xNorm;
        if (mirrored) x = 1 - x;
        rawPath.push({ t, x, e: motion.energy });
        energySeries.push({ t, e: motion.energy });
      }

      prevData = new Uint8ClampedArray(curr);
      onProgress?.(Math.min(99, ((t - startT) / Math.max(0.01, endT - startT)) * 100));
    }
  } finally {
    await seekVideo(video, originalTime).catch(() => undefined);
    if (!wasPaused) void video.play().catch(() => undefined);
  }

  const path = smoothPath(rawPath, 4);
  const crossed = interpolateCrossings(path, targets, maxLengths);

  // Stroke peaks
  const strokePeaksSec: number[] = [];
  if (energySeries.length > 5) {
    const energies = energySeries.map((p) => p.e);
    const mean =
      energies.reduce((a, b) => a + b, 0) / Math.max(1, energies.length);
    const thresh = mean * 1.25;
    for (let i = 2; i < energySeries.length - 2; i++) {
      const e = energySeries[i]!.e;
      if (
        e > thresh &&
        e >= energySeries[i - 1]!.e &&
        e >= energySeries[i + 1]!.e
      ) {
        const t = energySeries[i]!.t;
        const last = strokePeaksSec[strokePeaksSec.length - 1];
        if (last === undefined || t - last > 0.5) strokePeaksSec.push(t);
      }
    }
  }

  const suggestions = Array.from(crossed.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([distanceM, v]) => ({
      distanceM,
      videoTimeSec: v.t,
      confidence: v.confidence,
    }));

  const meanConfidence =
    suggestions.length === 0
      ? 0
      : suggestions.reduce((a, s) => a + s.confidence, 0) / suggestions.length;

  onProgress?.(100);

  return {
    suggestions,
    strokePeaksSec,
    meanConfidence,
    samples,
    engine: "browser",
    pathPoints: path.map((p) => ({ t: p.t, x: p.x })),
  };
}

export function mergeCalibrationLine(
  lines: CalibrationLine[],
  distanceM: number,
  xNorm: number
): CalibrationLine[] {
  const next = lines.filter((l) => l.distanceM !== distanceM);
  next.push({
    distanceM,
    xNorm: Math.min(1, Math.max(0, xNorm)),
  });
  return next.sort((a, b) => a.distanceM - b.distanceM);
}
