import { NextRequest, NextResponse } from "next/server";
import { getVideoSession } from "@/lib/video-store";
import {
  sessionToSwimRecord,
  swimRecordToCsv,
  timingsFromRaceStart,
} from "@/lib/video-analysis";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const session = await getVideoSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const timings = timingsFromRaceStart(session.markers, session.raceStartSec);
  const record = sessionToSwimRecord(session, session.raceStartSec, timings);
  if (!record) {
    return NextResponse.json(
      { error: "Need Start + Finish tags before export" },
      { status: 400 }
    );
  }

  const format = req.nextUrl.searchParams.get("format") || "json";
  if (format === "csv") {
    const csv = swimRecordToCsv(record);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${session.athleteName.replace(/\s+/g, "_")}-${session.raceDistance}.csv"`,
      },
    });
  }

  return NextResponse.json({ record, timings, sessionId: session.id });
}
