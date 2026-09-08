import {
  computeStrokeMetrics,
  defaultCalibrationLines,
  defaultLaneBand,
  emptyStrokeMetrics,
  createMarkers,
  type DistanceMarker,
  type PoolType,
  type TagSource,
  type VideoSession,
} from "./video-analysis";
import type { Gender, Stroke } from "./types";

const LOCAL_KEY = "bluehub.video.localSessions";

export interface LocalSessionInput {
  athleteName: string;
  club?: string;
  gender?: Gender;
  ageGroup?: string;
  lane?: number;
  poolType: PoolType;
  raceDistance: number;
  stroke: Stroke;
  videoFileName: string;
  /** Object URL from URL.createObjectURL(file) */
  videoUrl: string;
}

export function createLocalVideoSession(input: LocalSessionInput): VideoSession {
  const id = `vid-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const markers = createMarkers(input.poolType, input.raceDistance);
  const now = new Date().toISOString();

  return {
    id,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    athleteName: input.athleteName.trim() || "Athlete",
    club: input.club?.trim() || "",
    gender: input.gender ?? "male",
    ageGroup: input.ageGroup?.trim() || "Open",
    lane: input.lane ?? 4,
    poolType: input.poolType,
    raceDistance: input.raceDistance,
    stroke: input.stroke,
    videoFileName: input.videoFileName,
    videoUrl: input.videoUrl,
    videoPath: "",
    markers,
    calibrationLines: defaultCalibrationLines(input.poolType, markers),
    raceStartSec: null,
    mirrored: false,
    laneBand: defaultLaneBand(input.lane ?? 4),
    strokeMetrics: emptyStrokeMetrics(),
    aiJob: { status: "idle" },
    localOnly: true,
  };
}

export function isLocalSession(session: VideoSession | null | undefined): boolean {
  if (!session) return false;
  return Boolean(session.localOnly) || session.videoUrl.startsWith("blob:");
}

/** Vercel serverless body limit is ~4.5MB — larger files must stay in-browser. */
export const SERVER_UPLOAD_SAFE_BYTES = 4 * 1024 * 1024;

export function shouldUseLocalUpload(fileSize: number): boolean {
  if (typeof window === "undefined") return fileSize > SERVER_UPLOAD_SAFE_BYTES;
  const host = window.location.hostname;
  const onVercel =
    host.includes("vercel.app") || host.includes("vercel.sh");
  return onVercel || fileSize > SERVER_UPLOAD_SAFE_BYTES;
}

export async function readResponseJsonSafe(res: Response): Promise<{
  ok: boolean;
  data: Record<string, unknown>;
  raw: string;
}> {
  const raw = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(raw) as Record<string, unknown>, raw };
  } catch {
    const snippet = raw.slice(0, 80).replace(/\s+/g, " ");
    let message = `เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON (${res.status})`;
    if (/request entity too large/i.test(raw) || raw.startsWith("Request En")) {
      message =
        "ไฟล์ใหญ่เกินขีดจำกัดของเซิร์ฟเวอร์ (Vercel ~4.5MB) — จะใช้โหมดวิเคราะห์ในเบราว์เซอร์แทน";
    } else if (snippet) {
      message = `${message}: ${snippet}`;
    }
    return {
      ok: false,
      data: { error: message, _nonJson: true },
      raw,
    };
  }
}

export function saveLocalSessionMeta(session: VideoSession): void {
  if (typeof window === "undefined") return;
  try {
    const list = listLocalSessionMeta();
    const meta = {
      id: session.id,
      athleteName: session.athleteName,
      raceDistance: session.raceDistance,
      poolType: session.poolType,
      stroke: session.stroke,
      status: session.status,
      updatedAt: session.updatedAt,
      tagged: session.markers.filter((m) => m.videoTimeSec !== null).length,
      total: session.markers.length,
      localOnly: true,
    };
    const next = [meta, ...list.filter((s) => s.id !== session.id)].slice(0, 20);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    localStorage.setItem(`${LOCAL_KEY}.${session.id}`, JSON.stringify(session));
  } catch {
    // quota / private mode — ignore
  }
}

export function listLocalSessionMeta(): {
  id: string;
  athleteName: string;
  raceDistance: number;
  poolType: string;
  stroke: string;
  status: string;
  updatedAt: string;
  tagged: number;
  total: number;
  localOnly?: boolean;
}[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReturnType<typeof listLocalSessionMeta>;
  } catch {
    return [];
  }
}

export function loadLocalSession(id: string): VideoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY}.${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as VideoSession;
  } catch {
    return null;
  }
}

/** Apply the same tag actions as the API, but purely in memory (for blob/local sessions). */
export function applyLocalTagAction(
  session: VideoSession,
  body: Record<string, unknown>
): VideoSession {
  const next: VideoSession = {
    ...session,
    markers: session.markers.map((m) => ({ ...m })),
    updatedAt: new Date().toISOString(),
  };
  const action = String(body.action || "");

  if (action === "tag") {
    const markerId = String(body.markerId);
    const videoTimeSec = Number(body.videoTimeSec);
    const source = (body.source as TagSource) || "manual";
    next.markers = next.markers.map((m) =>
      m.id === markerId
        ? {
            ...m,
            videoTimeSec,
            source:
              m.videoTimeSec !== null && m.source === "ai" ? "edited" : source,
          }
        : m
    );
    next.status = "tagging";
  } else if (action === "tagNext") {
    const videoTimeSec = Number(body.videoTimeSec);
    const source = (body.source as TagSource) || "manual";
    const idx = next.markers.findIndex((m) => m.videoTimeSec === null);
    if (idx >= 0) {
      next.markers = next.markers.map((m, i) =>
        i === idx ? { ...m, videoTimeSec, source } : m
      );
      next.status = "tagging";
    }
  } else if (action === "clear") {
    const markerId = String(body.markerId);
    next.markers = next.markers.map((m) =>
      m.id === markerId ? { ...m, videoTimeSec: null, source: null } : m
    );
  } else if (action === "replace" && Array.isArray(body.markers)) {
    next.markers = body.markers as DistanceMarker[];
  } else if (action === "setRaceStart") {
    next.raceStartSec =
      body.raceStartSec === null || body.raceStartSec === undefined
        ? null
        : Number(body.raceStartSec);
    next.status = "tagging";
  } else if (action === "addStroke") {
    const t = Number(body.videoTimeSec);
    const prev = next.strokeMetrics ?? emptyStrokeMetrics();
    const finish = next.markers.find((m) => m.isFinish)?.videoTimeSec ?? null;
    next.strokeMetrics = computeStrokeMetrics(
      [...prev.strokeTimesSec, t],
      next.raceStartSec,
      finish
    );
  } else if (action === "clearStrokes") {
    next.strokeMetrics = emptyStrokeMetrics();
  } else if (action === "applyAi") {
    const suggestions = body.suggestions as
      | { distanceM: number; videoTimeSec: number }[]
      | undefined;
    if (Array.isArray(suggestions)) {
      const onlyEmpty = body.onlyEmpty !== false;
      const byDist = new Map(
        suggestions.map((s) => [s.distanceM, s.videoTimeSec])
      );
      next.markers = next.markers.map((m) => {
        const suggested = byDist.get(m.distanceM);
        if (suggested === undefined) return m;
        if (onlyEmpty && m.videoTimeSec !== null) return m;
        return {
          ...m,
          videoTimeSec: suggested,
          source: m.videoTimeSec !== null ? "edited" : "ai",
        };
      });
    }
    if (Array.isArray(body.strokePeaksSec)) {
      const peaks = body.strokePeaksSec as number[];
      const prev = next.strokeMetrics ?? emptyStrokeMetrics();
      const finish = next.markers.find((m) => m.isFinish)?.videoTimeSec ?? null;
      if (prev.strokeCount === 0 && peaks.length > 0) {
        next.strokeMetrics = {
          ...computeStrokeMetrics(peaks, next.raceStartSec, finish),
          aiStrokeTimesSec: peaks,
        };
      } else {
        next.strokeMetrics = {
          ...prev,
          aiStrokeTimesSec: peaks,
        };
      }
    }
    next.aiJob = {
      status: "done",
      message: String(body.message || "Applied AI tags"),
      finishedAt: new Date().toISOString(),
      engine: body.engine === "python" ? "python" : "browser",
      confidence:
        typeof body.confidence === "number" ? body.confidence : undefined,
    };
    next.status = "tagging";
  }

  next.localOnly = true;
  saveLocalSessionMeta(next);
  return next;
}

