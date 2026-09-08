import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getVideoSession, saveVideoSession } from "@/lib/video-store";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  if (typeof body.athleteName === "string") session.athleteName = body.athleteName;
  if (typeof body.club === "string") session.club = body.club;
  if (typeof body.lane === "number") session.lane = body.lane;
  if (body.status) session.status = body.status;
  if (body.calibrationLines) session.calibrationLines = body.calibrationLines;
  if (body.markers) session.markers = body.markers;
  if (body.laneBand) session.laneBand = body.laneBand;
  if (typeof body.mirrored === "boolean") session.mirrored = body.mirrored;
  if (body.strokeMetrics) session.strokeMetrics = body.strokeMetrics;
  if (body.raceStartSec !== undefined) {
    session.raceStartSec =
      body.raceStartSec === null ? null : Number(body.raceStartSec);
  }
  if (body.aiJob) session.aiJob = { ...session.aiJob, ...body.aiJob };

  const updated = await saveVideoSession(session);
  return NextResponse.json({ session: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sessionFile = path.join(
    process.cwd(),
    "data",
    "video-sessions",
    `${id}.json`
  );
  try {
    await fs.unlink(sessionFile);
  } catch {
    // ignore
  }
  try {
    await fs.unlink(session.videoPath);
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
