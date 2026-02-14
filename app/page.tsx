"use client";

import AppHeader from "@/components/Shell/AppHeader";
import SearchPanel from "@/components/Search/SearchPanel";
import ResultsPanel from "@/components/Results/ResultsPanel";
import MapView from "@/components/Map/MapView";

import type { Product, SceneSummary, SearchQuery, SearchResponse } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/lib/api/products";
import { searchScenes } from "@/lib/api/scenes";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<SearchQuery>({
    product_id: undefined,
    date_start: undefined,
    date_end: undefined,
    roi_bbox: [126.5, 36.0, 127.5, 37.0],
    page: 1,
    limit: 20
  });

  const [resp, setResp] = useState<SearchResponse>({ total: 0, page: 1, limit: 20, items: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const [roiEditMode, setRoiEditMode] = useState(false);

  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const selectedScene: SceneSummary | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    return resp.items.find((s) => s.scene_uid === selectedId);
  }, [resp.items, selectedId]);

  useEffect(() => {
    (async () => {
      try {
        setErrMsg(null);
        const ps = await fetchProducts();
        setProducts(ps);

        setLoading(true);
        const r = await searchScenes(query);
        setResp(r);

        setSelectedId(r.items[0]?.scene_uid);
      } catch (e: unknown) {
        setErrMsg(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch() {
    try {
      setErrMsg(null);
      setLoading(true);
      setRoiEditMode(false);

      const r = await searchScenes({ ...query, page: 1 });
      setResp(r);
      setSelectedId(r.items[0]?.scene_uid);
      setHoveredId(undefined);
      setQuery((q) => ({ ...q, page: 1 }));
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onPage(p: number) {
    try {
      setErrMsg(null);
      setLoading(true);

      const nextQ = { ...query, page: p };
      setQuery(nextQ);

      const r = await searchScenes(nextQ);
      setResp(r);
      setSelectedId(r.items[0]?.scene_uid);
      setHoveredId(undefined);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ height: 56 }}>
        <AppHeader />
      </div>

      <div style={{ height: "calc(100vh - 56px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "360px 420px 1fr", height: "100%" }}>
          <div style={{ borderRight: "1px solid #e5e5e5", overflow: "auto" }}>
            <SearchPanel
              products={products}
              query={query}
              onChange={(patch) => setQuery((q) => ({ ...q, ...patch }))}
              onSearch={onSearch}
            />

            <div style={{ padding: "0 14px 14px", fontSize: 12, color: "#666", lineHeight: 1.35 }}>
              {loading ? "Loading..." : null}
              {errMsg ? <div style={{ color: "crimson", marginTop: 8 }}>Error: {errMsg}</div> : null}
              <div style={{ marginTop: 10 }}>
                Tip: Turn <b>ROI ON</b> and drag on the map to set a bounding box.
              </div>
              <div style={{ marginTop: 10, color: "#64748b" }}>
                SelectedId: <b>{selectedId ?? "-"}</b>
                <br />
                SelectedScene: <b>{selectedScene?.scene_uid ?? "-"}</b>
              </div>
            </div>
          </div>

          <div style={{ borderRight: "1px solid #e5e5e5", overflow: "auto" }}>
            <ResultsPanel
              resp={resp}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onPage={onPage}
              onHover={setHoveredId}
            />
          </div>

          <div style={{ overflow: "hidden", position: "relative" }}>
            <MapView
              roiBBox={query.roi_bbox}
              scenes={resp.items}
              selectedId={selectedId}
              selectedScene={selectedScene}
              opacity={opacity}
              onOpacity={setOpacity}
              roiEditMode={roiEditMode}
              onRoiBBoxChange={(b) =>
                setQuery((q) => ({
                  ...q,
                  roi_bbox: b,
                  page: 1
                }))
              }
              hoveredSceneId={hoveredId}
              onPickScene={setSelectedId}
              onHoverScene={setHoveredId}
            />

            <div style={{ position: "absolute", left: 12, top: 12, zIndex: 30, display: "flex", gap: 8 }}>
              <button
                onClick={() => setRoiEditMode((v) => !v)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: roiEditMode ? "#111" : "#fff",
                  color: roiEditMode ? "#fff" : "#111",
                  cursor: "pointer"
                }}
                title="Toggle ROI edit mode"
              >
                ROI {roiEditMode ? "ON" : "OFF"}
              </button>

              {roiEditMode ? (
                <button
                  onClick={() => setRoiEditMode(false)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer"
                  }}
                  title="Stop ROI edit mode"
                >
                  Done
                </button>
              ) : null}

              <button
                onClick={() =>
                  setQuery((q) => ({
                    ...q,
                    roi_bbox: [126.5, 36.0, 127.5, 37.0],
                    page: 1
                  }))
                }
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer"
                }}
                title="Reset ROI to default"
              >
                Reset ROI
              </button>
            </div>

            {roiEditMode ? (
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 54,
                  zIndex: 30,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid #e5e5e5",
                  background: "rgba(255,255,255,0.92)",
                  fontSize: 12,
                  color: "#333"
                }}
              >
                ROI mode ON: drag on the map to set a ROI box.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
