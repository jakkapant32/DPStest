import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/auth";
import { generateId, getEvents, saveEvents } from "@/lib/store";
import type { SwimEvent } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as Omit<SwimEvent, "id">;
  const events = await getEvents();
  const newEvent: SwimEvent = { ...body, id: generateId("evt") };
  await saveEvents([newEvent, ...events]);
  return NextResponse.json(newEvent, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as SwimEvent;
  const events = await getEvents();
  const idx = events.findIndex((e) => e.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  events[idx] = body;
  await saveEvents(events);
  return NextResponse.json(body);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const events = await getEvents();
  await saveEvents(events.filter((e) => e.id !== id));
  return NextResponse.json({ success: true });
}
