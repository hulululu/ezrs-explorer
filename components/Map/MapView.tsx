"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SceneSummary } from "@/types";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, Polygon } from "geojson";

const ROI_SOURCE = "roi-source";
const ROI_LAYER = "roi-layer";

const FOOT_SOURCE = "foot-source";
const FOOT_LAYER = "foot-layer";
const FOOT_SEL_LAYER = "foot-sel-layer";
const FOOT_HOVER_LAYER = "foot-hover-layer";

const RASTER_SOURCE = "raster-source";
const RASTER_LAYER = "raster-layer";

const NONE_UID = "__none__";

type Props = {
  roiBBox?: [number, number, number, number];
  scenes: SceneSummary[];
  selectedId?: string;
  selectedScene?: SceneSummary;
  opacity: number;
  onOpacity: (v: number) => void;
  onRoiBBoxChange?: (b: [number, number, number, number]) => void;
  roiEditMode?: boolean;
  hoveredSceneId?: string;
  onPickScene?: (id: string) => void;
  onHoverScene?: (id?: string) => void;
  onToggleRoiMode?: () => void;
  onStopRoiMode?: () => void;
  showResultsToggle?: boolean;
  showResults?: boolean;
  onToggleResults?: () => void;
  onResetRoi?: () => void;
};

export default function MapView({
  roiBBox,
  scenes,
  selectedId,
  selectedScene,
  opacity,
  onOpacity,
  onRoiBBoxChange,
  roiEditMode,
  hoveredSceneId,
  onPickScene,
  onHoverScene,
  onToggleRoiMode,
  onStopRoiMode,
  showResultsToggle,
  showResults,
  onToggleResults,
  onResetRoi
}: Props) {
  const mapRef = useRef<Map | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const roiEditModeRef = useRef(!!roiEditMode);
  const onRoiBBoxChangeRef = useRef(onRoiBBoxChange);
  const onPickSceneRef = useRef(onPickScene);
  const onHoverSceneRef = useRef(onHoverScene);

  const drawBoxRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const overFootRef = useRef(false);

  const roiFeature = useMemo(() => (roiBBox ? bboxToFeature(roiBBox) : emptyFC()), [roiBBox]);
  const footprints = useMemo(() => scenesToFeatureCollection(scenes), [scenes]);

  useEffect(() => {
    roiEditModeRef.current = !!roiEditMode;
  }, [roiEditMode]);

  useEffect(() => {
    onRoiBBoxChangeRef.current = onRoiBBoxChange;
  }, [onRoiBBoxChange]);

  useEffect(() => {
    onPickSceneRef.current = onPickScene;
  }, [onPickScene]);

  useEffect(() => {
    onHoverSceneRef.current = onHoverScene;
  }, [onHoverScene]);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: divRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: {
              "raster-brightness-max": 0.65,
              "raster-brightness-min": 0.12,
              "raster-saturation": -0.45,
              "raster-contrast": 0.28
            }
          }
        ]
      },
      center: [127.0, 36.5],
      zoom: 5.5
    });

    map.boxZoom.disable();

    mapRef.current = map;

    const setCanvasCursor = () => {
      const canvas = map.getCanvas();
      if (roiEditModeRef.current) {
        canvas.style.cursor = "crosshair";
        return;
      }
      canvas.style.cursor = overFootRef.current ? "pointer" : "";
    };

    const onMapMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (!roiEditModeRef.current) return;

      const original = e.originalEvent as MouseEvent;
      if (original.button !== 0) return;

      original.preventDefault();
      original.stopPropagation();

      drawingRef.current = true;
      drawStartRef.current = { x: e.point.x, y: e.point.y };

      const box = drawBoxRef.current;
      if (box) {
        box.style.display = "block";
        box.style.left = `${e.point.x}px`;
        box.style.top = `${e.point.y}px`;
        box.style.width = "0px";
        box.style.height = "0px";
      }

      if (map.dragPan.isEnabled()) {
        map.dragPan.disable();
      }
    };

    const onMapMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!drawingRef.current) return;
      const start = drawStartRef.current;
      const box = drawBoxRef.current;
      if (!start || !box) return;

      const minX = Math.min(start.x, e.point.x);
      const minY = Math.min(start.y, e.point.y);
      const maxX = Math.max(start.x, e.point.x);
      const maxY = Math.max(start.y, e.point.y);

      box.style.left = `${minX}px`;
      box.style.top = `${minY}px`;
      box.style.width = `${maxX - minX}px`;
      box.style.height = `${maxY - minY}px`;
    };

    const onMapMouseUp = (e: maplibregl.MapMouseEvent) => {
      if (!drawingRef.current) return;

      drawingRef.current = false;
      const start = drawStartRef.current;
      drawStartRef.current = null;

      const box = drawBoxRef.current;
      if (box) box.style.display = "none";

      if (!map.dragPan.isEnabled()) {
        map.dragPan.enable();
      }

      if (!start) return;

      if (Math.abs(e.point.x - start.x) < 5 || Math.abs(e.point.y - start.y) < 5) return;

      const minX = Math.min(start.x, e.point.x);
      const minY = Math.min(start.y, e.point.y);
      const maxX = Math.max(start.x, e.point.x);
      const maxY = Math.max(start.y, e.point.y);

      const sw = map.unproject([minX, maxY]);
      const ne = map.unproject([maxX, minY]);

      onRoiBBoxChangeRef.current?.([round6(sw.lng), round6(sw.lat), round6(ne.lng), round6(ne.lat)]);
    };

    const onFootEnter = () => {
      overFootRef.current = true;
      setCanvasCursor();
    };

    const onFootLeave = () => {
      overFootRef.current = false;
      onHoverSceneRef.current?.(undefined);
      setCanvasCursor();
    };

    const onFootMove = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      const id = typeof f?.properties?.scene_uid === "string" ? (f.properties.scene_uid as string) : undefined;
      onHoverSceneRef.current?.(id);
    };

    const onFootClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      const id = typeof f?.properties?.scene_uid === "string" ? (f.properties.scene_uid as string) : undefined;
      if (id) onPickSceneRef.current?.(id);
    };

    const onLoad = () => {
      map.addSource(ROI_SOURCE, { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: ROI_LAYER,
        type: "line",
        source: ROI_SOURCE,
        paint: { "line-width": 2, "line-color": "#d3e6ff", "line-opacity": 0.92 }
      });

      map.addSource(FOOT_SOURCE, { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: FOOT_LAYER,
        type: "line",
        source: FOOT_SOURCE,
        paint: { "line-width": 2, "line-color": "#2bd9ff", "line-opacity": 0.52 }
      });
      map.addLayer({
        id: FOOT_HOVER_LAYER,
        type: "line",
        source: FOOT_SOURCE,
        paint: { "line-width": 2.6, "line-color": "#ffd166", "line-opacity": 0.96 },
        filter: ["==", ["get", "scene_uid"], NONE_UID]
      });
      map.addLayer({
        id: FOOT_SEL_LAYER,
        type: "line",
        source: FOOT_SOURCE,
        paint: { "line-width": 3.4, "line-color": "#31f5ff", "line-opacity": 1 },
        filter: ["==", ["get", "scene_uid"], NONE_UID]
      });

      const container = map.getContainer();
      container.style.position = "relative";

      const box = document.createElement("div");
      box.style.position = "absolute";
      box.style.border = "2px solid #9cd8ff";
      box.style.background = "rgba(44, 219, 255, 0.14)";
      box.style.pointerEvents = "none";
      box.style.display = "none";
      box.style.zIndex = "10";
      container.appendChild(box);
      drawBoxRef.current = box;

      map.on("mousedown", onMapMouseDown);
      map.on("mousemove", onMapMouseMove);
      map.on("mouseup", onMapMouseUp);

      map.on("mouseenter", FOOT_LAYER, onFootEnter);
      map.on("mouseleave", FOOT_LAYER, onFootLeave);
      map.on("mousemove", FOOT_LAYER, onFootMove);
      map.on("click", FOOT_LAYER, onFootClick);

      setCanvasCursor();
      setReady(true);
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      map.off("mousedown", onMapMouseDown);
      map.off("mousemove", onMapMouseMove);
      map.off("mouseup", onMapMouseUp);
      map.off("mouseenter", FOOT_LAYER, onFootEnter);
      map.off("mouseleave", FOOT_LAYER, onFootLeave);
      map.off("mousemove", FOOT_LAYER, onFootMove);
      map.off("click", FOOT_LAYER, onFootClick);
      drawBoxRef.current?.remove();
      drawBoxRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (!roiEditMode && drawingRef.current) {
      drawingRef.current = false;
      drawStartRef.current = null;
      if (drawBoxRef.current) drawBoxRef.current.style.display = "none";
      if (!map.dragPan.isEnabled()) map.dragPan.enable();
    }

    const canvas = map.getCanvas();
    if (roiEditMode) {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = overFootRef.current ? "pointer" : "";
      if (!map.dragPan.isEnabled()) map.dragPan.enable();
    }
  }, [ready, roiEditMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(ROI_SOURCE) as maplibregl.GeoJSONSource | undefined;
    src?.setData(roiFeature);
  }, [ready, roiFeature]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(FOOT_SOURCE) as maplibregl.GeoJSONSource | undefined;
    src?.setData(footprints);
  }, [ready, footprints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(FOOT_SEL_LAYER)) return;
    map.setFilter(FOOT_SEL_LAYER, selectedId ? ["==", ["get", "scene_uid"], selectedId] : ["==", ["get", "scene_uid"], NONE_UID]);
  }, [ready, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer(FOOT_HOVER_LAYER)) return;
    map.setFilter(
      FOOT_HOVER_LAYER,
      hoveredSceneId ? ["==", ["get", "scene_uid"], hoveredSceneId] : ["==", ["get", "scene_uid"], NONE_UID]
    );
  }, [ready, hoveredSceneId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (map.getLayer(RASTER_LAYER)) map.removeLayer(RASTER_LAYER);
    if (map.getSource(RASTER_SOURCE)) map.removeSource(RASTER_SOURCE);

    const previewTiles = selectedScene?.assets?.preview_tiles;
    if (!previewTiles) return;

    map.addSource(RASTER_SOURCE, {
      type: "raster",
      tiles: [previewTiles],
      tileSize: 256
    });

    map.addLayer(
      {
        id: RASTER_LAYER,
        type: "raster",
        source: RASTER_SOURCE,
        paint: { "raster-opacity": opacity }
      },
      FOOT_LAYER
    );
  }, [ready, selectedScene, opacity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (map.getLayer(RASTER_LAYER)) {
      map.setPaintProperty(RASTER_LAYER, "raster-opacity", opacity);
    }
  }, [ready, opacity]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={divRef} style={{ width: "100%", height: "100%" }} />

      <div className="ui-glass" style={{ position: "absolute", left: 12, top: 12, zIndex: 30, display: "flex", gap: 8, padding: 8 }}>
        <button
          onClick={onToggleRoiMode}
          className={roiEditMode ? "ui-btn ui-btn-primary" : "ui-btn"}
          type="button"
          title="Toggle ROI edit mode"
        >
          ROI {roiEditMode ? "ON" : "OFF"}
        </button>
        {roiEditMode ? (
          <button onClick={onStopRoiMode} className="ui-btn" type="button" title="Stop ROI edit mode">
            Done
          </button>
        ) : null}
        <button onClick={onResetRoi} className="ui-btn" type="button" title="Reset ROI to default">
          Reset ROI
        </button>
      </div>

      {roiEditMode ? (
        <div className="ui-glass ui-muted" style={{ position: "absolute", left: 12, top: 62, zIndex: 30, padding: "7px 10px", fontSize: 12 }}>
          ROI mode ON: drag on map to set bbox.
        </div>
      ) : null}
      {showResultsToggle ? (
        <div className="ui-glass" style={{ position: "absolute", left: 12, top: roiEditMode ? 120 : 80, zIndex: 30, padding: 8 }}>
          <button className="ui-btn" type="button" onClick={onToggleResults}>
            {showResults ? "Hide Results" : "Show Results"}
          </button>
        </div>
      ) : null}

      <div
        className="ui-glass"
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          padding: "10px 12px",
          fontSize: 12,
          minWidth: 220,
          zIndex: 30
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6, letterSpacing: -0.1 }}>Overlay</div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(e) => onOpacity(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent2)" }}
        />
        <div className="ui-muted" style={{ marginTop: 6 }}>
          Selected: {selectedId ?? "None"}
        </div>
        <div className="ui-muted" style={{ marginTop: 4 }}>
          ROI mode: <b style={{ color: "var(--text)" }}>{roiEditMode ? "ON" : "OFF"}</b>
        </div>
      </div>
    </div>
  );
}

function round6(v: number) {
  return Math.round(v * 1e6) / 1e6;
}

function emptyFC(): FeatureCollection<Geometry, GeoJsonProperties> {
  return { type: "FeatureCollection", features: [] };
}

function bboxToFeature(b: [number, number, number, number]): FeatureCollection<Polygon, GeoJsonProperties> {
  const [minLon, minLat, maxLon, maxLat] = b;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [[[minLon, minLat], [maxLon, minLat], [maxLon, maxLat], [minLon, maxLat], [minLon, minLat]]]
        }
      }
    ]
  };
}

function scenesToFeatureCollection(scenes: SceneSummary[]): FeatureCollection<Geometry, GeoJsonProperties> {
  const features: Feature<Geometry, GeoJsonProperties>[] = scenes.map((s) => ({
    type: "Feature",
    properties: { scene_uid: s.scene_uid },
    geometry:
      s.footprint ?? {
        type: "Polygon",
        coordinates: [
          [
            [s.bbox[0], s.bbox[1]],
            [s.bbox[2], s.bbox[1]],
            [s.bbox[2], s.bbox[3]],
            [s.bbox[0], s.bbox[3]],
            [s.bbox[0], s.bbox[1]]
          ]
        ]
      }
  }));

  return {
    type: "FeatureCollection",
    features
  };
}
