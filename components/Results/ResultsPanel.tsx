"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { SceneSummary, SearchResponse } from "@/types";
import type { AppCopy } from "@/lib/i18n";

export default function ResultsPanel({
  resp,
  hasSearched = false,
  selectedId,
  onSelect,
  onPage,
  onHover,
  copy
}: {
  resp: SearchResponse;
  hasSearched?: boolean;
  selectedId?: string;
  onSelect: (scene_uid: string) => void;
  onPage: (p: number) => void;
  onHover?: (id?: string) => void;
  copy: AppCopy["results"];
}) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(resp.total / resp.limit)), [resp.total, resp.limit]);

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h3 style={{ margin: "8px 0 6px", letterSpacing: 0 }}>{copy.title}</h3>
        <span className="ui-badge">{resp.total} {copy.items}</span>
      </div>

      <div className="ui-muted" style={{ fontSize: 12 }}>
        {copy.page} <b>{resp.page}</b> / {totalPages}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {resp.items.map((s) => (
          <SceneCard
            key={s.scene_uid}
            scene={s}
            selected={s.scene_uid === selectedId}
            onClick={() => onSelect(s.scene_uid)}
            onHover={onHover}
            copy={copy}
          />
        ))}
        {resp.items.length === 0 && !hasSearched && (
          <div className="ui-muted" style={{ marginTop: 10, lineHeight: 1.45 }}>
            {copy.emptyBefore}
          </div>
        )}
        {resp.items.length === 0 && hasSearched && (
          <div className="ui-muted" style={{ marginTop: 10 }}>
            {copy.emptyAfter}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          className="ui-btn"
          disabled={resp.page <= 1}
          onClick={() => onPage(resp.page - 1)}
          style={{ opacity: resp.page <= 1 ? 0.4 : 1, flex: 1 }}
          type="button"
        >
          {copy.prev}
        </button>
        <button
          className="ui-btn"
          disabled={resp.page >= totalPages}
          onClick={() => onPage(resp.page + 1)}
          style={{ opacity: resp.page >= totalPages ? 0.4 : 1, flex: 1 }}
          type="button"
        >
          {copy.next}
        </button>
      </div>
    </div>
  );
}

function SceneCard({
  scene,
  selected,
  onClick,
  onHover,
  copy
}: {
  scene: SceneSummary;
  selected: boolean;
  onClick: () => void;
  onHover?: (id?: string) => void;
  copy: AppCopy["results"];
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const quicklook = scene.assets.quicklook;
  const showImage = typeof quicklook === "string" && quicklook.length > 0 && !imgFailed;

  return (
    <div
      className={`ui-card ${selected ? "ui-card--selected" : ""}`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(scene.scene_uid)}
      onMouseLeave={() => onHover?.(undefined)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        padding: 12,
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "96px 1fr",
        gap: 12,
        position: "relative"
      }}
    >
      <span className="ui-badge" style={{ position: "absolute", top: 10, right: 10 }}>
        {scene.product_id}
      </span>

      <div
        style={{
          width: 96,
          height: 66,
          borderRadius: 12,
          border: "1px solid var(--border)",
          overflow: "hidden",
          background: "#101b25",
          position: "relative"
        }}
      >
        {showImage ? (
          <Image
            src={quicklook}
            alt={`${scene.title} quicklook`}
            width={96}
            height={66}
            unoptimized
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="ui-skeleton"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: 11,
              letterSpacing: 0.2
            }}
          >
            {copy.noPreview}
          </div>
        )}
      </div>

      <div style={{ minWidth: 0, paddingRight: 72 }}>
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

        <div className="ui-muted" style={{ fontSize: 12, marginTop: 6 }}>
          {scene.datetime_start.slice(0, 10)} {copy.dateTo} {scene.datetime_end.slice(0, 10)}
        </div>

        <div className="ui-muted" style={{ fontSize: 12, marginTop: 3 }}>
          {scene.sensors.join(", ")}
          {scene.resolution_m ? ` | ${scene.resolution_m}m` : ""}
        </div>
      </div>
    </div>
  );
}
