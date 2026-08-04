import { NextResponse } from "next/server";
import { getEvents, getProducts, getResults } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "events";

  switch (type) {
    case "events":
      return NextResponse.json(await getEvents());
    case "results":
      return NextResponse.json(await getResults());
    case "products":
      return NextResponse.json(await getProducts());
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
}
