"use client";

import SearchPanel from "@/components/Search/SearchPanel";
import ResultsPanel from "@/components/Results/ResultsPanel";
import MapView from "@/components/Map/MapView";

import type { Product, SceneSummary, SearchQuery, SearchResponse } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/lib/api/products";
import { searchScenes } from "@/lib/api/scenes";
import { useAuth } from "@/lib/auth/useAuth";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/auth/firebase";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<SearchQuery>({
    product_id: undefined,
    date_start: undefined,
    date_end: undefined,
    roi_bbox: [0, 0, 0, 0],
    page: 1,
    limit: 20
  });

  const [resp, setResp] = useState<SearchResponse>({ total: 0, page: 1, limit: 20, items: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const [roiEditMode, setRoiEditMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { user } = useAuth();

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
      } catch (e: unknown) {
        setErrMsg(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  async function onSearch() {
    try {
      setErrMsg(null);
      setLoading(true);
      setRoiEditMode(false);
      setHasSearched(true);
      setShowResults(true);

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

  async function onLogout() {
    try {
      await signOut(getFirebaseAuth());
    } catch {
      setErrMsg("Failed to logout");
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        className="ui-glass"
        style={{
          height: 56,
          margin: "8px 10px 0",
          padding: "0 14px",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--accent)", boxShadow: "0 0 10px rgba(34,211,238,0.8)" }} />
          <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>ezRS Explorer</div>
          <span className="ui-badge">Demo</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ui-muted" style={{ fontSize: 12 }}>
            {user?.email ?? "Not signed in"}
          </span>
          {user ? (
            <button className="ui-btn" onClick={onLogout} type="button">
              Logout
            </button>
          ) : null}
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, padding: "8px 10px 10px" }}>
        <div
          className="ui-panel ui-shadow"
          style={{
            display: "grid",
            gridTemplateColumns: showResults ? "352px 400px 1fr" : "352px 1fr",
            height: "100%",
            overflow: "hidden"
          }}
        >
          <div className="ui-divider" style={{ overflow: "auto" }}>
            <SearchPanel
              products={products}
              query={query}
              onChange={(patch) => setQuery((q) => ({ ...q, ...patch }))}
              onSearch={onSearch}
            />

            <div style={{ padding: "0 14px 14px", fontSize: 12, lineHeight: 1.4 }}>
              {loading ? <div className="ui-muted">Loading...</div> : null}
              {errMsg ? <div style={{ color: "var(--danger)", marginTop: 8 }}>Error: {errMsg}</div> : null}
              <div className="ui-muted" style={{ marginTop: 10 }}>
                Tip: Turn <b>ROI ON</b> and drag on the map to set a bounding box.
              </div>
              <div className="ui-muted" style={{ marginTop: 10 }}>
                SelectedId: <b>{selectedId ?? "-"}</b>
                <br />
                SelectedScene: <b>{selectedScene?.scene_uid ?? "-"}</b>
              </div>
            </div>
          </div>

          {showResults ? (
            <div className="ui-divider" style={{ overflow: "auto" }}>
              <ResultsPanel
                resp={resp}
                hasSearched={hasSearched}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPage={onPage}
                onHover={setHoveredId}
              />
            </div>
          ) : null}

          <div style={{ overflow: "hidden", position: "relative" }}>
            <MapView
              roiBBox={query.roi_bbox}
              scenes={resp.items}
              selectedId={selectedId}
              selectedScene={selectedScene}
              opacity={opacity}
              onOpacity={setOpacity}
              roiEditMode={roiEditMode}
              onToggleRoiMode={() => setRoiEditMode((v) => !v)}
              onStopRoiMode={() => setRoiEditMode(false)}
              showResultsToggle={hasSearched}
              showResults={showResults}
              onToggleResults={() => setShowResults((v) => !v)}
              onResetRoi={() =>
                setQuery((q) => ({
                  ...q,
                  roi_bbox: [0, 0, 0, 0],
                  page: 1
                }))
              }
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
          </div>
        </div>
      </div>
    </div>
  );
}
