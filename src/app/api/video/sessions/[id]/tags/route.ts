import { NextRequest, NextResponse } from "next/server";
import { getVideoSession, saveVideoSession } from "@/lib/video-store";
import type { TagSource } from "@/lib/video-analysis";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const action = body.action as string;

  if (action === "tag") {
    const markerId = String(body.markerId);
    const videoTimeSec = Number(body.videoTimeSec);
    const source = (body.source as TagSource) || "manual";
    if (!Number.isFinite(videoTimeSec)) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }
    session.markers = session.markers.map((m) =>
      m.id === markerId
        ? {
            ...m,
            videoTimeSec,
            source:
              m.videoTimeSec !== null && m.source === "ai" ? "edited" : source,
          }
        : m
    );
    session.status = "tagging";
  } else if (action === "tagNext") {
    const videoTimeSec = Number(body.videoTimeSec);
    const source = (body.source as TagSource) || "manual";
    if (!Number.isFinite(videoTimeSec)) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }
    const idx = session.markers.findIndex((m) => m.videoTimeSec === null);
    if (idx === -1) {
      return NextResponse.json(
        { error: "All markers tagged", session },
        { status: 400 }
      );
    }
    session.markers = session.markers.map((m, i) =>
      i === idx ? { ...m, videoTimeSec, source } : m
    );
    session.status = "tagging";
  } else if (action === "clear") {
    const markerId = String(body.markerId);
    session.markers = session.markers.map((m) =>
      m.id === markerId ? { ...m, videoTimeSec: null, source: null } : m
    );
  } else if (action === "replace") {
    if (!Array.isArray(body.markers)) {
      return NextResponse.json({ error: "markers required" }, { status: 400 });
    }
    session.markers = body.markers;
  } else if (action === "setRaceStart") {
    session.raceStartSec =
      body.raceStartSec === null || body.raceStartSec === undefined
        ? null
        : Number(body.raceStartSec);
    session.status = "tagging";
  } else if (action === "addStroke") {
    const t = Number(body.videoTimeSec);
    if (!Number.isFinite(t)) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }
    const { computeStrokeMetrics, emptyStrokeMetrics } = await import(
      "@/lib/video-analysis"
    );
    const prev = session.strokeMetrics ?? emptyStrokeMetrics();
    const times = [...prev.strokeTimesSec, t];
    const finish = session.markers.find((m) => m.isFinish)?.videoTimeSec ?? null;
    session.strokeMetrics = computeStrokeMetrics(
      times,
      session.raceStartSec,
      finish
    );
  } else if (action === "clearStrokes") {
    const { emptyStrokeMetrics } = await import("@/lib/video-analysis");
    session.strokeMetrics = emptyStrokeMetrics();
  } else if (action === "applyAi") {
    const suggestions = body.suggestions as
      | { distanceM: number; videoTimeSec: number }[]
      | undefined;
    if (!Array.isArray(suggestions)) {
      return NextResponse.json({ error: "suggestions required" }, { status: 400 });
    }
    const onlyEmpty = body.onlyEmpty !== false;
    const byDist = new Map(
      suggestions.map((s) => [s.distanceM, s.videoTimeSec])
    );
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
    if (Array.isArray(body.strokePeaksSec)) {
      const { computeStrokeMetrics, emptyStrokeMetrics } = await import(
        "@/lib/video-analysis"
      );
      const prev = session.strokeMetrics ?? emptyStrokeMetrics();
      const finish =
        session.markers.find((m) => m.isFinish)?.videoTimeSec ?? null;
      const merged = computeStrokeMetrics(
        prev.strokeTimesSec,
        session.raceStartSec,
        finish
      );
      merged.aiStrokeTimesSec = body.strokePeaksSec as number[];
      if (merged.strokeCount === 0 && merged.aiStrokeTimesSec.length > 0) {
        const fromAi = computeStrokeMetrics(
          merged.aiStrokeTimesSec,
          session.raceStartSec,
          finish
        );
        session.strokeMetrics = {
          ...fromAi,
          aiStrokeTimesSec: merged.aiStrokeTimesSec,
        };
      } else {
        session.strokeMetrics = merged;
      }
    }
    session.aiJob = {
      status: "done",
      message: body.message || `Applied ${suggestions.length} AI tags`,
      finishedAt: new Date().toISOString(),
      engine: body.engine === "python" ? "python" : "browser",
      confidence:
        typeof body.confidence === "number" ? body.confidence : undefined,
    };
    session.status = "tagging";
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await saveVideoSession(session);
  return NextResponse.json({ session: updated });
}
