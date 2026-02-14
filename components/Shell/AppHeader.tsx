// components/Shell/AppHeader.tsx
"use client";

import { useAuth } from "@/lib/auth/useAuth";

export default function AppHeader() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    // Sign out logic here
    // You may need to implement this based on your auth provider
  };

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        background: "rgba(255,255,255,0.9)",
        borderBottom: "1px solid #e2e8f0",
        backdropFilter: "blur(10px)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 18 }}>🌍</div>
        <div style={{ fontWeight: 800, letterSpacing: -0.2 }}>ezRS Explorer</div>
        <span className="ui-badge">Demo</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="ui-muted" style={{ fontSize: 12 }}>
          {user ? `Signed in: ${user.email}` : "Not signed in"}
        </span>
        {user ? (
          <button className="ui-btn" onClick={handleSignOut}>
            Logout
          </button>
        ) : null}
      </div>
    </div>
  );
}
