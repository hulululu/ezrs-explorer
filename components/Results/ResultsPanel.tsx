"use client";

import type { SceneSummary, SearchResponse } from "@/types";

export default function ResultsPanel({
  resp,
  selectedId,
  onSelect,
  onPage,
  onHover
}: {
  resp: SearchResponse;
  selectedId?: string;
  onSelect: (scene_uid: string) => void;
  onPage: (p: number) => void;
  onHover?: (id?: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(resp.total / resp.limit));

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ margin: "8px 0 6px", letterSpacing: -0.2 }}>Results</h3>
        <span className="ui-badge">{resp.total} items</span>
      </div>

      <div className="ui-muted" style={{ fontSize: 12 }}>
        Page <b>{resp.page}</b> / {totalPages}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {resp.items.map((s) => (
          <SceneCard
            key={s.scene_uid}
            scene={s}
            selected={s.scene_uid === selectedId}
            onClick={() => onSelect(s.scene_uid)}
            onHover={onHover}
          />
        ))}
        {resp.items.length === 0 && (
          <div className="ui-muted" style={{ marginTop: 10 }}>
            No results
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          className="ui-btn"
          disabled={resp.page <= 1}
          onClick={() => onPage(resp.page - 1)}
          style={{ opacity: resp.page <= 1 ? 0.4 : 1 }}
        >
          Prev
        </button>
        <button
          className="ui-btn"
          disabled={resp.page >= totalPages}
          onClick={() => onPage(resp.page + 1)}
          style={{ opacity: resp.page >= totalPages ? 0.4 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SceneCard({
  scene,
  selected,
  onClick,
  onHover
}: {
  scene: SceneSummary;
  selected: boolean;
  onClick: () => void;
  onHover?: (id?: string) => void;
}) {
  return (
    <div
      className={`ui-card ${selected ? "ui-card--selected" : ""}`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(scene.scene_uid)}
      onMouseLeave={() => onHover?.(undefined)}
      style={{
        padding: 12,
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "92px 1fr",
        gap: 12
      }}
    >
      <div
        style={{
          width: 92,
          height: 62,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          background: "#f1f5f9"
        }}
      >
        {scene.assets.quicklook ? (
          <img
            src={scene.assets.quicklook}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: -0.1
            }}
          >
            {scene.title}
          </div>
          <span className="ui-badge">{scene.product_id}</span>
        </div>

        <div className="ui-muted" style={{ fontSize: 12, marginTop: 6 }}>
          {scene.datetime_start.slice(0, 10)} to {scene.datetime_end.slice(0, 10)}
        </div>

        <div className="ui-muted" style={{ fontSize: 12, marginTop: 3 }}>
          {scene.sensors.join(", ")}
          {scene.resolution_m ? ` | ${scene.resolution_m}m` : ""}
        </div>
      </div>
    </div>
  );
}
