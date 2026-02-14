// app/api/scenes-search/route.ts
import { NextResponse } from "next/server";
import { searchMockScenes } from "@/lib/server/mock";
import type { SearchQuery } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<SearchQuery>;

  const q: SearchQuery = {
    product_id: body.product_id,
    date_start: body.date_start,
    date_end: body.date_end,
    roi_bbox: body.roi_bbox,
    page: Number(body.page ?? 1),
    limit: Number(body.limit ?? 20)
  };

  // 최소 방어(나중에 zod로 강화 가능)
  if (!Number.isFinite(q.page) || q.page < 1) q.page = 1;
  if (!Number.isFinite(q.limit) || q.limit < 1 || q.limit > 200) q.limit = 20;

  const resp = searchMockScenes(q);
  return NextResponse.json(resp);
}
