// components/Shell/ThreePaneLayout.tsx
import React from "react";

export default function ThreePaneLayout({
  left,
  middle,
  right
}: {
  left: React.ReactNode;
  middle: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gridTemplateRows: "56px 1fr", height: "100vh" }}>
      {/* Header row is rendered outside; this layout is for body */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 420px 1fr", height: "calc(100vh - 56px)" }}>
        <div style={{ borderRight: "1px solid #e5e5e5", overflow: "auto" }}>{left}</div>
        <div style={{ borderRight: "1px solid #e5e5e5", overflow: "auto" }}>{middle}</div>
        <div style={{ overflow: "hidden" }}>{right}</div>
      </div>
    </div>
  );
}
