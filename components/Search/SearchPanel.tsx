// components/Search/SearchPanel.tsx
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
  const roi = query.roi_bbox ?? [126.5, 36.0, 127.5, 37.0];

  return (
    <div style={{ padding: 14 }}>
      <h3 style={{ margin: "8px 0 12px" }}>Search</h3>

      <label style={labelStyle}>Product</label>
      <select
        value={query.product_id ?? ""}
        onChange={(e) => onChange({ product_id: e.target.value || undefined, page: 1 })}
        style={inputStyle}
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
          <label style={labelStyle}>Date start</label>
          <input
            type="date"
            value={query.date_start ?? ""}
            onChange={(e) => onChange({ date_start: e.target.value || undefined, page: 1 })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Date end</label>
          <input
            type="date"
            value={query.date_end ?? ""}
            onChange={(e) => onChange({ date_end: e.target.value || undefined, page: 1 })}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>ROI BBox (minLon, minLat, maxLon, maxLat)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input
            type="number"
            step="0.0001"
            value={roi[0]}
            onChange={(e) => onChange({ roi_bbox: [Number(e.target.value), roi[1], roi[2], roi[3]], page: 1 })}
            style={inputStyle}
          />
          <input
            type="number"
            step="0.0001"
            value={roi[1]}
            onChange={(e) => onChange({ roi_bbox: [roi[0], Number(e.target.value), roi[2], roi[3]], page: 1 })}
            style={inputStyle}
          />
          <input
            type="number"
            step="0.0001"
            value={roi[2]}
            onChange={(e) => onChange({ roi_bbox: [roi[0], roi[1], Number(e.target.value), roi[3]], page: 1 })}
            style={inputStyle}
          />
          <input
            type="number"
            step="0.0001"
            value={roi[3]}
            onChange={(e) => onChange({ roi_bbox: [roi[0], roi[1], roi[2], Number(e.target.value)], page: 1 })}
            style={inputStyle}
          />
        </div>
      </div>

      <button onClick={onSearch} style={{ ...btnStyle, marginTop: 14 }}>
        Search
      </button>

      <div style={{ marginTop: 12, fontSize: 12, color: "#666", lineHeight: 1.4 }}>
        * Phase 1: mock data filter only<br />
        * Map overlay uses <code>assets.preview_tiles</code>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#555", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  boxSizing: "border-box"
};
const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#111",
  color: "#fff",
  cursor: "pointer"
};
