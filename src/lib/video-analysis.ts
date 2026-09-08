import type { Gender, Stroke, SwimRecord } from "./types";

export type PoolType = "LCM" | "SCM";
export type TagSource = "manual" | "ai" | "edited";
export type VideoSessionStatus =
  | "draft"
  | "tagging"
  | "analyzing"
  | "completed"
  | "error";

export interface DistanceMarker {
  id: string;
  /** Race distance in meters, or finish wall */
  distanceM: number;
  label: string;
  isFinish: boolean;
  videoTimeSec: number | null;
  source: TagSource | null;
}

export interface CalibrationLine {
  /** Normalized x position 0–1 across frame width (pool length axis for side view) */
  xNorm: number;
  distanceM: number;
}

/** Vertical band of the selected lane in normalized video coordinates (0–1). */
export interface LaneBand {
  y0Norm: number;
  y1Norm: number;
}

export interface StrokeMetrics {
  /** Manual stroke taps (video timestamps) */
  strokeTimesSec: number[];
  /** Peak times from AI motion (optional) */
  aiStrokeTimesSec?: number[];
  strokeCount: number;
  /** strokes per minute over tagged race window */
  strokeRateSpm: number | null;
  avgCycleSec: number | null;
}

export interface VideoSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: VideoSessionStatus;
  athleteName: string;
  club: string;
  gender: Gender;
  ageGroup: string;
  lane: number;
  poolType: PoolType;
  raceDistance: number;
  stroke: Stroke;
  videoFileName: string;
  /** Public URL path e.g. /uploads/video/... */
  videoUrl: string;
  /** Absolute or cwd-relative path on disk for worker */
  videoPath: string;
  markers: DistanceMarker[];
  calibrationLines: CalibrationLine[];
  /** Video timestamp when coach tapped Start (race clock zero). */
  raceStartSec: number | null;
  /** If true, start wall is on the right side of the frame */
  mirrored?: boolean;
  laneBand?: LaneBand;
  strokeMetrics?: StrokeMetrics;
  aiJob?: {
    status: "idle" | "queued" | "running" | "done" | "error";
    message?: string;
    startedAt?: string;
    finishedAt?: string;
    engine?: "browser" | "python";
    confidence?: number;
  };
  error?: string;
  /** True when video stays in the browser (blob URL) — required on Vercel for large files */
  localOnly?: boolean;
}

export interface MarkerTiming {
  marker: DistanceMarker;
  splitSec: number | null;
  cumulativeSec: number | null;
}

/**
 * Mako-style marks: within each length, points at +15/+25/+35/+45 (LCM)
 * or +10/+15/+20 (SCM), then the wall. e.g. LCM 100 → 15…50, 65…100.
 */
export function buildMarkerDistances(
  poolType: PoolType,
  raceDistance: number
): number[] {
  const length = poolType === "LCM" ? 50 : 25;
  const offsets =
    poolType === "LCM" ? [15, 25, 35, 45, 50] : [10, 15, 20, 25];
  const distances: number[] = [];
  let base = 0;

  while (base < raceDistance) {
    for (const off of offsets) {
      const d = base + off;
      if (d > base && d <= base + length && d <= raceDistance) {
        distances.push(d);
      }
    }
    // Ensure wall / finish is included even if raceDistance is odd
    const wall = Math.min(base + length, raceDistance);
    if (!distances.includes(wall)) distances.push(wall);
    base += length;
  }

  return Array.from(new Set(distances)).sort((a, b) => a - b);
}

export function createMarkers(
  poolType: PoolType,
  raceDistance: number
): DistanceMarker[] {
  const distances = buildMarkerDistances(poolType, raceDistance);
  return distances.map((distanceM, index) => {
    const isFinish = distanceM === raceDistance;
    return {
      id: `m-${distanceM}-${index}`,
      distanceM,
      label: isFinish ? "Finish" : `${distanceM}m`,
      isFinish,
      videoTimeSec: null,
      source: null,
    };
  });
}

/** Default calibration: evenly spaced lines along pool length for one length. */
export function defaultCalibrationLines(
  poolType: PoolType,
  markers: DistanceMarker[]
): CalibrationLine[] {
  const length = poolType === "LCM" ? 50 : 25;
  // Map first-length distances onto xNorm 0 (near start/left) → 1 (far wall)
  const firstLength = markers.filter((m) => m.distanceM <= length);
  return firstLength.map((m) => ({
    distanceM: m.distanceM,
    xNorm: Math.min(1, Math.max(0, m.distanceM / length)),
  }));
}

export function computeMarkerTimings(markers: DistanceMarker[]): MarkerTiming[] {
  return timingsFromRaceStart(markers, markers[0]?.videoTimeSec ?? null);
}

/**
 * Race clock: user taps Start which stamps `raceStartSec` on the session.
 * Cumulative = marker.videoTimeSec - raceStartSec
 * Split = difference from previous tagged marker (or from start for first).
 */
export function timingsFromRaceStart(
  markers: DistanceMarker[],
  raceStartSec: number | null
): MarkerTiming[] {
  let prevCumulative: number | null = null;

  return markers.map((marker) => {
    if (marker.videoTimeSec === null || raceStartSec === null) {
      return { marker, splitSec: null, cumulativeSec: null };
    }
    const cumulativeSec = Math.max(0, marker.videoTimeSec - raceStartSec);
    const splitSec =
      prevCumulative === null
        ? cumulativeSec
        : Math.max(0, cumulativeSec - prevCumulative);
    prevCumulative = cumulativeSec;
    return { marker, splitSec, cumulativeSec };
  });
}

export function segmentGroups(
  markers: DistanceMarker[],
  poolType: PoolType
): { title: string; markers: DistanceMarker[] }[] {
  const length = poolType === "LCM" ? 50 : 25;
  const groups: { title: string; markers: DistanceMarker[] }[] = [];
  let start = 0;
  let lengthIndex = 0;

  while (start < markers.length) {
    const from = lengthIndex * length;
    const to = (lengthIndex + 1) * length;
    const chunk = markers.filter(
      (m) => m.distanceM > from && m.distanceM <= to
    );
    if (chunk.length === 0) break;
    const title =
      lengthIndex === 0
        ? `FIRST ${length}M`
        : `${from}-${to}M`;
    groups.push({ title, markers: chunk });
    start += chunk.length;
    lengthIndex += 1;
    if (lengthIndex > 20) break;
  }
  return groups;
}

export function nextUntaggedIndex(markers: DistanceMarker[]): number {
  return markers.findIndex((m) => m.videoTimeSec === null);
}

export function taggedCount(markers: DistanceMarker[]): number {
  return markers.filter((m) => m.videoTimeSec !== null).length;
}

export function sessionToSwimRecord(
  session: VideoSession,
  raceStartSec: number | null,
  timings: MarkerTiming[]
): SwimRecord | null {
  if (raceStartSec === null) return null;
  const finish = timings.find((t) => t.marker.isFinish);
  if (!finish?.cumulativeSec) return null;

  const splits: Record<string, number> = {};
  for (const t of timings) {
    if (t.cumulativeSec === null) continue;
    splits[String(t.marker.distanceM)] = t.cumulativeSec;
  }

  return {
    athlete: session.athleteName,
    gender: session.gender,
    ageGroup: session.ageGroup || "Open",
    club: session.club || "—",
    stroke: session.stroke,
    distance: session.raceDistance,
    splits,
    totalTime: finish.cumulativeSec,
  };
}

export function swimRecordToCsv(record: SwimRecord): string {
  const splitKeys = Object.keys(record.splits).sort(
    (a, b) => Number(a) - Number(b)
  );
  const header = [
    "athlete",
    "gender",
    "age_group",
    "club",
    "stroke",
    "distance",
    ...splitKeys.map((k) => `split_${k}`),
    "total_time",
  ];
  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) return `${mins}:${secs.toFixed(2).padStart(5, "0")}`;
    return secs.toFixed(2);
  };
  const row = [
    record.athlete,
    record.gender === "male" ? "M" : "F",
    record.ageGroup,
    record.club,
    record.stroke,
    String(record.distance),
    ...splitKeys.map((k) => formatSec(record.splits[k]!)),
    formatSec(record.totalTime),
  ];
  return `${header.join(",")}\n${row.join(",")}\n`;
}

export function formatSplitDisplay(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  return `+${seconds.toFixed(2)}`;
}

export function formatCumulativeDisplay(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  return seconds.toFixed(2);
}

export function defaultLaneBand(lane: number, totalLanes = 8): LaneBand {
  // Broadcast / overhead race clips: pool lanes sit mid-frame.
  // Still nudge slightly by lane number within the pool band.
  const l = Math.max(1, Math.min(totalLanes, lane));
  const poolTop = 0.32;
  const poolBottom = 0.78;
  const band = (poolBottom - poolTop) / totalLanes;
  const y0Norm = poolTop + (l - 1) * band;
  const y1Norm = poolTop + l * band;
  return {
    y0Norm: Math.max(0.05, y0Norm - 0.01),
    y1Norm: Math.min(0.95, y1Norm + 0.01),
  };
}

export function emptyStrokeMetrics(): StrokeMetrics {
  return {
    strokeTimesSec: [],
    strokeCount: 0,
    strokeRateSpm: null,
    avgCycleSec: null,
  };
}

export function computeStrokeMetrics(
  strokeTimesSec: number[],
  raceStartSec: number | null,
  raceEndSec: number | null
): StrokeMetrics {
  const times = [...strokeTimesSec].sort((a, b) => a - b);
  const count = times.length;
  let strokeRateSpm: number | null = null;
  let avgCycleSec: number | null = null;

  if (count >= 2) {
    const spans: number[] = [];
    for (let i = 1; i < times.length; i++) {
      spans.push(times[i]! - times[i - 1]!);
    }
    avgCycleSec = spans.reduce((a, b) => a + b, 0) / spans.length;
  }

  const start = raceStartSec ?? times[0] ?? null;
  const end = raceEndSec ?? times[times.length - 1] ?? null;
  if (start !== null && end !== null && end > start && count > 0) {
    const minutes = (end - start) / 60;
    strokeRateSpm = count / minutes;
  }

  return {
    strokeTimesSec: times,
    strokeCount: count,
    strokeRateSpm,
    avgCycleSec,
  };
}

export function summarizeSession(session: VideoSession) {
  const timings = timingsFromRaceStart(session.markers, session.raceStartSec);
  const finish = timings.find((t) => t.marker.isFinish);
  const tagged = taggedCount(session.markers);
  const sm = session.strokeMetrics ?? emptyStrokeMetrics();
  return {
    timings,
    finishTime: finish?.cumulativeSec ?? null,
    tagged,
    total: session.markers.length,
    strokeCount: sm.strokeCount,
    strokeRateSpm: sm.strokeRateSpm,
    avgCycleSec: sm.avgCycleSec,
  };
}
