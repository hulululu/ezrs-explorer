// lib/server/mock.ts
import mock from "@/data/mock_scenes.json";
import type { Product, SceneSummary, SearchQuery, SearchResponse } from "@/types";

type MockShape = { products: Product[]; scenes: SceneSummary[] };

function asMock(): MockShape {
  return mock as unknown as MockShape;
}

function toDateOnlyISO(dt: string) {
  return dt.slice(0, 10);
}

function intersectsBBox(a: [number, number, number, number], b: [number, number, number, number]) {
  const [aminx, aminy, amaxx, amaxy] = a;
  const [bminx, bminy, bmaxx, bmaxy] = b;
  const xOverlap = aminx <= bmaxx && amaxx >= bminx;
  const yOverlap = aminy <= bmaxy && amaxy >= bminy;
  return xOverlap && yOverlap;
}

export function getMockProducts(): Product[] {
  return asMock().products;
}

export function searchMockScenes(q: SearchQuery): SearchResponse {
  const { scenes } = asMock();

  let filtered = scenes.slice();

  if (q.product_id) {
    filtered = filtered.filter((s) => s.product_id === q.product_id);
  }

  if (q.date_start) {
    filtered = filtered.filter((s) => toDateOnlyISO(s.datetime_end) >= q.date_start!);
  }
  if (q.date_end) {
    filtered = filtered.filter((s) => toDateOnlyISO(s.datetime_start) <= q.date_end!);
  }

  if (q.roi_bbox) {
    filtered = filtered.filter((s) => intersectsBBox(s.bbox, q.roi_bbox!));
  }

  filtered.sort((a, b) => (a.datetime_start < b.datetime_start ? 1 : -1));

  const total = filtered.length;
  const start = (q.page - 1) * q.limit;
  const items = filtered.slice(start, start + q.limit);

  return { total, page: q.page, limit: q.limit, items };
}
