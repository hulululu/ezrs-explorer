import type { Product, SceneSummary, StacAsset, StacCollection, StacFeatureCollection, StacItem } from "@/types";

const DEFAULT_PRODUCT_TYPE: Product["type"] = "other";

export function isStacFeatureCollection(value: unknown): value is StacFeatureCollection {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.type === "FeatureCollection" && Array.isArray(record.features);
}

export function getProductsFromStac(catalog: StacFeatureCollection): Product[] {
  if (catalog.collections?.length) {
    return catalog.collections.map(collectionToProduct);
  }

  const ids = new Set<string>();
  for (const item of catalog.features) {
    if (item.collection) ids.add(item.collection);
  }

  return [...ids].sort().map((id) => ({
    product_id: id,
    name: toTitle(id),
    type: DEFAULT_PRODUCT_TYPE
  }));
}

export function collectionToProduct(collection: StacCollection): Product {
  return {
    product_id: collection.id,
    name: collection.title ?? toTitle(collection.id),
    legend_url: collection.assets?.legend?.href,
    type: getCollectionProductType(collection)
  };
}

export function stacItemToSceneSummary(item: StacItem): SceneSummary {
  const start = getItemStartDate(item);
  const end = getItemEndDate(item);
  const thumbnail = findAssetHref(item.assets, ["thumbnail", "overview"], ["thumbnail", "quicklook", "preview"]);
  const tiles = findAssetHref(item.assets, ["tiles"], ["tiles", "preview_tiles"]);
  const sourceRef = getString(item.properties["ezrs:source_ref"]) ?? findAssetHref(item.assets, ["data"], ["data", "source"]);
  const sensors = getSensors(item);

  return {
    scene_uid: item.id,
    product_id: item.collection ?? "unknown",
    title: getString(item.properties.title) ?? item.id,
    datetime_start: start,
    datetime_end: end,
    sensors,
    resolution_m: getNumber(item.properties.gsd),
    bbox: item.bbox,
    footprint: item.geometry,
    assets: {
      quicklook: thumbnail,
      preview_tiles: tiles,
      source_ref: sourceRef
    }
  };
}

export function getItemStartDate(item: StacItem) {
  return getString(item.properties.start_datetime) ?? getString(item.properties.datetime) ?? "";
}

export function getItemEndDate(item: StacItem) {
  return getString(item.properties.end_datetime) ?? getString(item.properties.datetime) ?? getItemStartDate(item);
}

function getCollectionProductType(collection: StacCollection): Product["type"] {
  const raw = collection.summaries?.["ezrs:product_type"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "continuous" || value === "classification" || value === "other" ? value : DEFAULT_PRODUCT_TYPE;
}

function getSensors(item: StacItem): string[] {
  const ezrsSensors = item.properties["ezrs:sensors"];
  if (Array.isArray(ezrsSensors) && ezrsSensors.every((value) => typeof value === "string")) {
    return ezrsSensors;
  }

  if (Array.isArray(item.properties.instruments) && item.properties.instruments.length) {
    return item.properties.instruments;
  }

  const platform = getString(item.properties.platform);
  return platform ? [platform] : [];
}

function findAssetHref(assets: Record<string, StacAsset> | undefined, roles: string[], keys: string[]) {
  if (!assets) return undefined;

  for (const key of keys) {
    const href = assets[key]?.href;
    if (typeof href === "string" && href.length) return href;
  }

  for (const asset of Object.values(assets)) {
    if (!asset.roles?.some((role) => roles.includes(role))) continue;
    if (typeof asset.href === "string" && asset.href.length) return asset.href;
  }

  return undefined;
}

function getString(value: unknown) {
  return typeof value === "string" && value.length ? value : undefined;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toTitle(id: string) {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
