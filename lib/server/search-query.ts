import type { SearchQuery } from "@/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function optionalDateOnly(value: unknown) {
  const text = optionalString(value);
  if (!text) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
}

function numberWithDefault(value: unknown, fallback: number) {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeBBox(value: unknown): [number, number, number, number] | undefined {
  if (!Array.isArray(value) || value.length !== 4) return undefined;

  const [a, b, c, d] = value.map(Number);
  if (![a, b, c, d].every(Number.isFinite)) return undefined;

  if (a === 0 && b === 0 && c === 0 && d === 0) return undefined;

  const west = Math.max(-180, Math.min(a, c));
  const south = Math.max(-90, Math.min(b, d));
  const east = Math.min(180, Math.max(a, c));
  const north = Math.min(90, Math.max(b, d));

  if (west >= east || south >= north) return undefined;
  return [west, south, east, north];
}

export function parseSearchQuery(body: unknown): SearchQuery {
  const raw = isRecord(body) ? body : {};

  let page = Math.trunc(numberWithDefault(raw.page, 1));
  let limit = Math.trunc(numberWithDefault(raw.limit, 20));

  if (page < 1) page = 1;
  if (limit < 1 || limit > 200) limit = 20;

  return {
    product_id: optionalString(raw.product_id),
    date_start: optionalDateOnly(raw.date_start),
    date_end: optionalDateOnly(raw.date_end),
    roi_bbox: normalizeBBox(raw.roi_bbox),
    page,
    limit
  };
}
