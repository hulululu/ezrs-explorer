// types/index.ts
export type Product = {
  product_id: string;
  name: string;
  legend_url?: string;
  type: "continuous" | "classification" | "other";
};

export type BBox = [number, number, number, number];

export type SceneAssets = {
  quicklook?: string;      // 썸네일 이미지 경로/URL
  preview_tiles?: string;  // XYZ template: /tiles/.../{z}/{x}/{y}.png
  source_ref?: string;     // 내부 처리 요청용 원본 참조 ID/URI
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
  bbox: BBox;
  footprint?: GeoJSONPolygon;
  assets: SceneAssets;
};

export type SearchQuery = {
  product_id?: string; // MVP: 단일 선택
  date_start?: string; // YYYY-MM-DD
  date_end?: string;   // YYYY-MM-DD
  roi_bbox?: BBox; // [minLon, minLat, maxLon, maxLat]
  page: number;
  limit: number;
};

export type SearchResponse = {
  total: number;
  page: number;
  limit: number;
  items: SceneSummary[];
};

export type StacAsset = {
  href: string;
  type?: string;
  title?: string;
  roles?: string[];
  [key: string]: unknown;
};

export type StacItemProperties = {
  datetime?: string | null;
  start_datetime?: string;
  end_datetime?: string;
  title?: string;
  platform?: string;
  instruments?: string[];
  constellation?: string;
  gsd?: number;
  "eo:cloud_cover"?: number;
  "ezrs:sensors"?: string[];
  "ezrs:source_ref"?: string;
  [key: string]: unknown;
};

export type StacItem = {
  stac_version: string;
  type: "Feature";
  id: string;
  collection?: string;
  bbox: BBox;
  geometry: GeoJSONPolygon;
  properties: StacItemProperties;
  assets?: Record<string, StacAsset>;
  links?: Array<Record<string, unknown>>;
};

export type StacCollection = {
  stac_version: string;
  type: "Collection";
  id: string;
  title?: string;
  description?: string;
  license?: string;
  extent?: {
    spatial?: { bbox?: BBox[] };
    temporal?: { interval?: Array<[string | null, string | null]> };
  };
  summaries?: Record<string, unknown>;
  assets?: Record<string, StacAsset>;
  links?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type StacFeatureCollection = {
  stac_version?: string;
  type: "FeatureCollection";
  collections?: StacCollection[];
  features: StacItem[];
  links?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};
