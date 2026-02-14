// lib/api/scenes.ts
import type { SearchQuery, SearchResponse } from "@/types";
import { apiPost } from "./client";

export async function searchScenes(q: SearchQuery): Promise<SearchResponse> {
  return await apiPost<SearchResponse>("/api/scenes-search", q);
}
