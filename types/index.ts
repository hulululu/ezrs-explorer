// types/index.ts
export type Product = {
  product_id: string;
  name: string;
  legend_url?: string;
  type: "continuous" | "classification" | "other";
};

export type SceneAssets = {
  quicklook?: string;      // 썸네일 이미지 경로/URL
  preview_tiles: string;   // XYZ template: /tiles/.../{z}/{x}/{y}.png
};

export type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type SceneSummary = {
  scene_uid: string;
  product_id: string;
  title: string;
  datetime_start: string; // ISO
  datetime_end: string;   // ISO
  sensors: string[];
  resolution_m?: number;
  bbox: [number, number, number, number];
  footprint?: GeoJSONPolygon;
  assets: SceneAssets;
};

export type SearchQuery = {
  product_id?: string; // MVP: 단일 선택
  date_start?: string; // YYYY-MM-DD
  date_end?: string;   // YYYY-MM-DD
  roi_bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  page: number;
  limit: number;
};

export type SearchResponse = {
  total: number;
  page: number;
  limit: number;
  items: SceneSummary[];
};
