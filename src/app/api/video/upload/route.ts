import { NextRequest, NextResponse } from "next/server";
import { createVideoSession, listVideoSessions } from "@/lib/video-store";
import type { PoolType } from "@/lib/video-analysis";
import type { Gender, Stroke } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024; // 200MB

export async function GET() {
  const sessions = await listVideoSessions();
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      athleteName: s.athleteName,
      raceDistance: s.raceDistance,
      poolType: s.poolType,
      stroke: s.stroke,
      status: s.status,
      updatedAt: s.updatedAt,
      tagged: s.markers.filter((m) => m.videoTimeSec !== null).length,
      total: s.markers.length,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const entry = form.get("video");
    // Avoid `instanceof File` — File global may be missing in Node runtime
    if (!entry || typeof entry === "string") {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }

    const blob = entry as Blob & { name?: string };
    if (typeof blob.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (blob.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Video too large (max 200MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const poolType = (String(form.get("poolType") || "LCM") as PoolType) || "LCM";
    const raceDistance = Number(form.get("raceDistance") || 100);
    const stroke = (String(form.get("stroke") || "freestyle") as Stroke) || "freestyle";
    const gender = (String(form.get("gender") || "male") as Gender) || "male";

    const session = await createVideoSession({
      athleteName: String(form.get("athleteName") || "Athlete"),
      club: String(form.get("club") || ""),
      gender,
      ageGroup: String(form.get("ageGroup") || "Open"),
      lane: Number(form.get("lane") || 4),
      poolType: poolType === "SCM" ? "SCM" : "LCM",
      raceDistance: [50, 100, 200, 400, 800, 1500].includes(raceDistance)
        ? raceDistance
        : 100,
      stroke,
      videoFileName: blob.name || "race.mp4",
      videoBuffer: buffer,
    });

    return NextResponse.json({ session });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
