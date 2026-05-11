// app/api/scenes-search/route.ts
import { NextResponse } from "next/server";
import { searchMockScenes } from "@/lib/server/mock";
import { parseSearchQuery } from "@/lib/server/search-query";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = parseSearchQuery(body);
  const resp = searchMockScenes(q);
  return NextResponse.json(resp);
}
