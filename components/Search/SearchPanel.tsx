"use client";

import type { Product, SearchQuery } from "@/types";

export default function SearchPanel({
  products,
  query,
  onChange,
  onSearch
}: {
  products: Product[];
  query: SearchQuery;
  onChange: (patch: Partial<SearchQuery>) => void;
  onSearch: () => void;
}) {
  const roi = query.roi_bbox ?? [0, 0, 0, 0];

  return (
    <div style={{ padding: 14 }}>
      <div style={{ margin: "6px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, letterSpacing: -0.1 }}>Search</h3>
        <span className="ui-badge">Filters</span>
      </div>

      <label className="ui-label" htmlFor="product-select">
        Product
      </label>
      <select
        id="product-select"
        className="ui-input"
        value={query.product_id ?? ""}
        onChange={(e) => onChange({ product_id: e.target.value || undefined, page: 1 })}
      >
        <option value="">(All)</option>
        {products.map((p) => (
          <option key={p.product_id} value={p.product_id}>
            {p.name}
          </option>
        ))}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <div>
          <label className="ui-label" htmlFor="date-start">
            Date start
          </label>
          <input
            id="date-start"
            type="date"
            className="ui-input"
            value={query.date_start ?? ""}
            onChange={(e) => onChange({ date_start: e.target.value || undefined, page: 1 })}
          />
        </div>
        <div>
          <label className="ui-label" htmlFor="date-end">
            Date end
          </label>
          <input
            id="date-end"
            type="date"
            className="ui-input"
            value={query.date_end ?? ""}
            onChange={(e) => onChange({ date_end: e.target.value || undefined, page: 1 })}
          />
        </div>
      </div>

      <div className="ui-panel" style={{ marginTop: 12, padding: 10 }}>
        <div className="ui-label" style={{ marginBottom: 8 }}>
          ROI BBox
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="ui-label" style={{ fontSize: 11 }} htmlFor="roi-min-lon">
              Min Lon
            </label>
            <input
              id="roi-min-lon"
              type="number"
              step="0.0001"
              className="ui-input"
              value={roi[0]}
              onChange={(e) => onChange({ roi_bbox: [Number(e.target.value), roi[1], roi[2], roi[3]], page: 1 })}
            />
          </div>
          <div>
            <label className="ui-label" style={{ fontSize: 11 }} htmlFor="roi-min-lat">
              Min Lat
            </label>
            <input
              id="roi-min-lat"
              type="number"
              step="0.0001"
              className="ui-input"
              value={roi[1]}
              onChange={(e) => onChange({ roi_bbox: [roi[0], Number(e.target.value), roi[2], roi[3]], page: 1 })}
            />
          </div>
          <div>
            <label className="ui-label" style={{ fontSize: 11 }} htmlFor="roi-max-lon">
              Max Lon
            </label>
            <input
              id="roi-max-lon"
              type="number"
              step="0.0001"
              className="ui-input"
              value={roi[2]}
              onChange={(e) => onChange({ roi_bbox: [roi[0], roi[1], Number(e.target.value), roi[3]], page: 1 })}
            />
          </div>
          <div>
            <label className="ui-label" style={{ fontSize: 11 }} htmlFor="roi-max-lat">
              Max Lat
            </label>
            <input
              id="roi-max-lat"
              type="number"
              step="0.0001"
              className="ui-input"
              value={roi[3]}
              onChange={(e) => onChange({ roi_bbox: [roi[0], roi[1], roi[2], Number(e.target.value)], page: 1 })}
            />
          </div>
        </div>
      </div>

      <button className="ui-btn ui-btn-primary" onClick={onSearch} style={{ width: "100%", marginTop: 14 }} type="button">
        Search
      </button>

      <div className="ui-muted" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.4 }}>
        * Phase 1: mock data filter only
        <br />* Map overlay uses <code>assets.preview_tiles</code>
      </div>
    </div>
  );
}
