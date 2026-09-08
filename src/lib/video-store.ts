import { promises as fs } from "fs";
import path from "path";
import { generateId } from "./store";
import {
  createMarkers,
  defaultCalibrationLines,
  defaultLaneBand,
  emptyStrokeMetrics,
  type VideoSession,
  type DistanceMarker,
  type CalibrationLine,
  type PoolType,
} from "./video-analysis";
import type { Gender, Stroke } from "./types";

const SESSIONS_DIR = path.join(process.cwd(), "data", "video-sessions");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "video");

async function ensureDirs() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

function sessionPath(id: string) {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export async function listVideoSessions(): Promise<VideoSession[]> {
  await ensureDirs();
  const files = await fs.readdir(SESSIONS_DIR);
  const sessions: VideoSession[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(SESSIONS_DIR, file), "utf-8");
      sessions.push(JSON.parse(raw) as VideoSession);
    } catch {
      // skip corrupt
    }
  }
  return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getVideoSession(id: string): Promise<VideoSession | null> {
  try {
    const raw = await fs.readFile(sessionPath(id), "utf-8");
    return JSON.parse(raw) as VideoSession;
  } catch {
    return null;
  }
}

export async function saveVideoSession(
  session: VideoSession
): Promise<VideoSession> {
  await ensureDirs();
  session.updatedAt = new Date().toISOString();
  await fs.writeFile(
    sessionPath(session.id),
    JSON.stringify(session, null, 2),
    "utf-8"
  );
  return session;
}

export interface CreateSessionInput {
  athleteName: string;
  club?: string;
  gender?: Gender;
  ageGroup?: string;
  lane?: number;
  poolType: PoolType;
  raceDistance: number;
  stroke: Stroke;
  videoFileName: string;
  videoBuffer: Buffer;
}

export async function createVideoSession(
  input: CreateSessionInput
): Promise<VideoSession> {
  await ensureDirs();
  const id = generateId("vid");
  const safeName = input.videoFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${id}-${safeName}`;
  const diskPath = path.join(UPLOADS_DIR, storedName);
  await fs.writeFile(diskPath, input.videoBuffer);

  const markers = createMarkers(input.poolType, input.raceDistance);
  const now = new Date().toISOString();

  const session: VideoSession = {
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
    videoUrl: `/uploads/video/${storedName}`,
    videoPath: diskPath,
    markers,
    calibrationLines: defaultCalibrationLines(input.poolType, markers),
    raceStartSec: null,
    mirrored: false,
    laneBand: defaultLaneBand(input.lane ?? 4),
    strokeMetrics: emptyStrokeMetrics(),
    aiJob: { status: "idle" },
  };

  await saveVideoSession(session);
  return session;
}

export async function updateSessionMarkers(
  id: string,
  markers: DistanceMarker[],
  status?: VideoSession["status"]
): Promise<VideoSession | null> {
  const session = await getVideoSession(id);
  if (!session) return null;
  session.markers = markers;
  if (status) session.status = status;
  return saveVideoSession(session);
}

export async function updateCalibration(
  id: string,
  lines: CalibrationLine[]
): Promise<VideoSession | null> {
  const session = await getVideoSession(id);
  if (!session) return null;
  session.calibrationLines = lines;
  return saveVideoSession(session);
}

export async function applyAiSuggestions(
  id: string,
  suggestions: { distanceM: number; videoTimeSec: number }[],
  onlyEmpty = true
): Promise<VideoSession | null> {
  const session = await getVideoSession(id);
  if (!session) return null;

  const byDist = new Map(suggestions.map((s) => [s.distanceM, s.videoTimeSec]));
  session.markers = session.markers.map((m) => {
    const suggested = byDist.get(m.distanceM);
    if (suggested === undefined) return m;
    if (onlyEmpty && m.videoTimeSec !== null) return m;
    return {
      ...m,
      videoTimeSec: suggested,
      source: m.videoTimeSec !== null ? "edited" : "ai",
    };
  });
  session.aiJob = {
    status: "done",
    finishedAt: new Date().toISOString(),
    message: `Applied ${suggestions.length} suggestions`,
  };
  session.status = "tagging";
  return saveVideoSession(session);
}

export { SESSIONS_DIR, UPLOADS_DIR };
