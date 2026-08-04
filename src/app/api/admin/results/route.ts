import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/auth";
import { generateId, getResults, saveResults } from "@/lib/store";
import type { RaceResult } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  return NextResponse.json(await getResults());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as Omit<RaceResult, "id">;
  const results = await getResults();
  const newResult: RaceResult = { ...body, id: generateId("res") };
  await saveResults([newResult, ...results]);
  return NextResponse.json(newResult, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as RaceResult;
  const results = await getResults();
  const idx = results.findIndex((r) => r.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  results[idx] = body;
  await saveResults(results);
  return NextResponse.json(body);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const results = await getResults();
  await saveResults(results.filter((r) => r.id !== id));
  return NextResponse.json({ success: true });
}
