import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getVideoSession, saveVideoSession } from "@/lib/video-store";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

/**
 * Queue AI analysis: writes a job file for the Python worker and marks session analyzing.
 * Worker reads data/video-jobs/{id}.json and writes suggestions back via apply endpoint
 * or drops suggested_tags into the session folder.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jobsDir = path.join(process.cwd(), "data", "video-jobs");
  await fs.mkdir(jobsDir, { recursive: true });

  const job = {
    sessionId: session.id,
    videoPath: session.videoPath,
    lane: session.lane,
    poolType: session.poolType,
    raceDistance: session.raceDistance,
    raceStartSec: session.raceStartSec,
    mirrored: Boolean(session.mirrored),
    laneBand: session.laneBand ?? null,
    calibrationLines: session.calibrationLines,
    markers: session.markers.map((m) => ({
      distanceM: m.distanceM,
      label: m.label,
    })),
    outputPath: path.join(jobsDir, `${session.id}.result.json`),
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(jobsDir, `${session.id}.job.json`),
    JSON.stringify(job, null, 2),
    "utf-8"
  );

  session.status = "analyzing";
  session.aiJob = {
    status: "queued",
    message: "Job queued — run: python -m worker --session " + session.id,
    startedAt: new Date().toISOString(),
  };
  await saveVideoSession(session);

  // Try to run worker inline if available (optional, non-blocking spawn)
  try {
    const { spawn } = await import("child_process");
    const workerCwd = path.join(process.cwd(), "workers", "video-analysis");
    const child = spawn(
      "python",
      ["-m", "worker", "--session", session.id, "--jobs-dir", jobsDir],
      {
        cwd: workerCwd,
        detached: true,
        stdio: "ignore",
        shell: true,
      }
    );
    child.unref();
    session.aiJob = {
      ...session.aiJob,
      status: "running",
      message: "Worker started",
    };
    await saveVideoSession(session);
  } catch {
    // Worker may not be installed; job file is enough for manual run
  }

  return NextResponse.json({ session, job });
}

/** Poll / apply result file written by worker */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resultPath = path.join(
    process.cwd(),
    "data",
    "video-jobs",
    `${id}.result.json`
  );

  try {
    const raw = await fs.readFile(resultPath, "utf-8");
    const result = JSON.parse(raw) as {
      suggestions: { distanceM: number; videoTimeSec: number }[];
      error?: string;
    };

    if (result.error) {
      session.aiJob = {
        status: "error",
        message: result.error,
        finishedAt: new Date().toISOString(),
      };
      session.status = "tagging";
      await saveVideoSession(session);
      return NextResponse.json({ session, result });
    }

    const byDist = new Map(
      result.suggestions.map((s) => [s.distanceM, s.videoTimeSec])
    );
    session.markers = session.markers.map((m) => {
      const suggested = byDist.get(m.distanceM);
      if (suggested === undefined) return m;
      if (m.videoTimeSec !== null) return m;
      return { ...m, videoTimeSec: suggested, source: "ai" as const };
    });
    session.aiJob = {
      status: "done",
      message: `Applied ${result.suggestions.length} AI tags`,
      finishedAt: new Date().toISOString(),
    };
    session.status = "tagging";
    await saveVideoSession(session);

    // consume result so we don't re-apply
    await fs.unlink(resultPath).catch(() => undefined);

    return NextResponse.json({ session, result });
  } catch {
    return NextResponse.json({ session, result: null });
  }
}
