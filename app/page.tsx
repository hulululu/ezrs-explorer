"use client";

import SearchPanel from "@/components/Search/SearchPanel";
import ResultsPanel from "@/components/Results/ResultsPanel";
import MapView from "@/components/Map/MapView";

import type { Product, SceneSummary, SearchQuery, SearchResponse } from "@/types";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/lib/api/products";
import { searchScenes } from "@/lib/api/scenes";
import { useAuth } from "@/lib/auth/useAuth";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/auth/firebase";
import { UI_COPY, type AppLanguage } from "@/lib/i18n";

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return "ko";

  const saved = window.localStorage.getItem("ezrs-explorer-lang");
  if (saved === "ko" || saved === "en") return saved;

  return window.navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export default function Page() {
  const [lang, setLang] = useState<AppLanguage>(getInitialLanguage);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<SearchQuery>({
    product_id: undefined,
    date_start: undefined,
    date_end: undefined,
    roi_bbox: undefined,
    page: 1,
    limit: 20
  });

  const [resp, setResp] = useState<SearchResponse>({ total: 0, page: 1, limit: 20, items: [] });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const [roiEditMode, setRoiEditMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(true);

  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { user } = useAuth();
  const authConfigured = isFirebaseConfigured();
  const copy = UI_COPY[lang];
  const gridTemplateColumns = [
    showSearchPanel ? "384px" : null,
    showResults ? "400px" : null,
    "1fr"
  ]
    .filter(Boolean)
    .join(" ");
  const layoutKey = `${showSearchPanel ? "search" : "map"}-${showResults ? "results" : "no-results"}`;

  const selectedScene: SceneSummary | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    return resp.items.find((s) => s.scene_uid === selectedId);
  }, [resp.items, selectedId]);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("ezrs-explorer-lang", lang);
  }, [lang]);

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

  async function onAuthButtonClick() {
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setErrMsg(copy.header.firebaseMissing);
        return;
      }

      if (user) {
        await signOut(auth);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch {
      setErrMsg(user ? copy.header.logoutFailed : copy.header.loginFailed);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        className="ui-glass"
        style={{
          height: 64,
          margin: "8px 10px 0",
          padding: "0 16px",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Image src="/ezrs-logo.png" alt="ezRS" width={118} height={36} priority className="ui-logo" />
          <div style={{ width: 1, height: 24, background: "var(--border)" }} />
          <div style={{ fontWeight: 800, letterSpacing: 0, color: "var(--navy)", whiteSpace: "nowrap" }}>{copy.header.product}</div>
          <span className="ui-badge">{copy.header.badge}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="ui-muted" style={{ fontSize: 12 }}>
            {user?.email ?? copy.header.notSignedIn}
          </span>
          <button
            className="ui-btn ui-auth-btn"
            disabled={!authConfigured}
            onClick={onAuthButtonClick}
            style={{ opacity: authConfigured ? 1 : 0.55 }}
            title={authConfigured ? copy.header.loginTitle : copy.header.authOffTitle}
            type="button"
          >
            {authConfigured ? (user ? copy.header.logout : copy.header.login) : copy.header.authOff}
          </button>
          <button
            aria-label={copy.header.switchLanguage}
            className="ui-lang-toggle"
            onClick={() => setLang((value) => (value === "ko" ? "en" : "ko"))}
            type="button"
          >
            <span className={lang === "ko" ? "ui-lang-toggle__active" : "ui-lang-toggle__inactive"}>KO</span>
            <span style={{ color: "rgba(11, 31, 58, 0.25)" }}>/</span>
            <span className={lang === "en" ? "ui-lang-toggle__active" : "ui-lang-toggle__inactive"}>EN</span>
          </button>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, padding: "8px 10px 10px", position: "relative" }}>
        <div
          className="ui-panel ui-shadow"
          style={{
            display: "grid",
            gridTemplateColumns,
            height: "100%",
            overflow: "hidden",
            position: "relative"
          }}
        >
          {showSearchPanel ? (
            <div className="ui-divider" style={{ overflow: "auto" }}>
              <SearchPanel
                products={products}
                query={query}
                onChange={(patch) => setQuery((q) => ({ ...q, ...patch }))}
                onSearch={onSearch}
                copy={copy.search}
              />

              <div style={{ padding: "0 14px 14px", fontSize: 12, lineHeight: 1.4 }}>
                {loading ? <div className="ui-muted">{copy.status.loading}</div> : null}
                {errMsg ? <div style={{ color: "var(--danger)", marginTop: 8 }}>{copy.status.error}: {errMsg}</div> : null}
                <div className="ui-muted" style={{ marginTop: 10 }}>
                  {copy.helper.tip}
                </div>
                <div className="ui-muted" style={{ marginTop: 10 }}>
                  {copy.helper.selectedId}: <b>{selectedId ?? "-"}</b>
                  <br />
                  {copy.helper.selectedScene}: <b>{selectedScene?.scene_uid ?? "-"}</b>
                </div>
              </div>
            </div>
          ) : null}

          {showResults ? (
            <div className="ui-divider" style={{ overflow: "auto" }}>
              <ResultsPanel
                resp={resp}
                hasSearched={hasSearched}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPage={onPage}
                onHover={setHoveredId}
                copy={copy.results}
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
                  roi_bbox: undefined,
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
              layoutKey={layoutKey}
              copy={copy.map}
            />
          </div>
        </div>

        <button
          className="ui-panel-toggle"
          onClick={() => setShowSearchPanel((value) => !value)}
          style={{
            position: "absolute",
            zIndex: 80,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 12,
            height: 88,
            padding: 0,
            border: "1px solid rgba(11, 31, 58, 0.14)",
            borderLeft: 0,
            borderRadius: "0 7px 7px 0",
            background: "rgba(255, 255, 255, 0.96)",
            color: "var(--navy)",
            boxShadow: "6px 8px 18px rgba(11, 31, 58, 0.1)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 0,
            top: "50%",
            left: showSearchPanel ? "394px" : "10px",
            transform: "translate(0, -50%)"
          }}
          title={showSearchPanel ? copy.search.hidePanel : copy.header.showSearchPanel}
          type="button"
          aria-label={showSearchPanel ? copy.search.hidePanel : copy.header.showSearchPanel}
        >
          <span aria-hidden="true">{showSearchPanel ? "<" : ">"}</span>
        </button>
      </div>
    </div>
  );
}
