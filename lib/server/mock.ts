// lib/server/mock.ts
import mock from "@/data/mock_scenes.json";
import type { Product, SearchQuery, SearchResponse, StacFeatureCollection } from "@/types";
import { normalizeBBox } from "./search-query";
import { getItemEndDate, getItemStartDate, getProductsFromStac, isStacFeatureCollection, stacItemToSceneSummary } from "./stac";

function asStacMock(): StacFeatureCollection {
  if (!isStacFeatureCollection(mock)) {
    throw new Error("mock_scenes.json must be a STAC FeatureCollection");
  }
  return mock;
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
  return getProductsFromStac(asStacMock());
}

export function searchMockScenes(q: SearchQuery): SearchResponse {
  const { features } = asStacMock();

  let filtered = features.slice();

  if (q.product_id) {
    filtered = filtered.filter((item) => item.collection === q.product_id);
  }

  if (q.date_start) {
    filtered = filtered.filter((item) => toDateOnlyISO(getItemEndDate(item)) >= q.date_start!);
  }
  if (q.date_end) {
    filtered = filtered.filter((item) => toDateOnlyISO(getItemStartDate(item)) <= q.date_end!);
  }

  const roiBBox = normalizeBBox(q.roi_bbox);
  if (roiBBox) {
    filtered = filtered.filter((item) => intersectsBBox(item.bbox, roiBBox));
  }

  filtered.sort((a, b) => (getItemStartDate(a) < getItemStartDate(b) ? 1 : -1));

  const total = filtered.length;
  const start = (q.page - 1) * q.limit;
  const items = filtered.slice(start, start + q.limit).map(stacItemToSceneSummary);

  return { total, page: q.page, limit: q.limit, items };
}
