type DemoTheme = {
  label: string;
  bg: string;
  accent: string;
  soft: string;
  text: string;
};

const THEMES: Record<string, DemoTheme> = {
  flood: {
    label: "Flood Mask",
    bg: "#082f49",
    accent: "#38bdf8",
    soft: "#bae6fd",
    text: "#f0f9ff"
  },
  ndvi: {
    label: "NDVI",
    bg: "#123524",
    accent: "#65a30d",
    soft: "#bef264",
    text: "#f7fee7"
  },
  generic: {
    label: "Scene",
    bg: "#1f2937",
    accent: "#22d3ee",
    soft: "#a5f3fc",
    text: "#f8fafc"
  }
};

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (ch) => {
    switch (ch) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return ch;
    }
  });
}

function themeFor(parts: string[]) {
  const path = parts.join("/").toLowerCase();
  if (path.includes("flood")) return THEMES.flood;
  if (path.includes("ndvi")) return THEMES.ndvi;
  return THEMES.generic;
}

function cleanName(parts: string[]) {
  const last = parts.at(-1) ?? "scene";
  return decodeURIComponent(last)
    .replace(/\.(png|jpg|jpeg|webp|svg)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function svgResponse(svg: string) {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}

export function quicklookResponse(parts: string[]) {
  const theme = themeFor(parts);
  const title = escapeXml(cleanName(parts));

  return svgResponse(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="384" height="264" viewBox="0 0 384 264" role="img" aria-label="${title}">
  <rect width="384" height="264" fill="${theme.bg}"/>
  <path d="M0 190 C56 154 104 166 152 138 C203 108 248 116 296 84 C332 60 359 56 384 44 L384 264 L0 264 Z" fill="${theme.accent}" opacity="0.48"/>
  <path d="M0 104 C44 72 88 88 132 62 C185 31 234 55 284 28 C327 4 360 11 384 0" fill="none" stroke="${theme.soft}" stroke-width="5" opacity="0.72"/>
  <g opacity="0.28" stroke="${theme.text}" stroke-width="1">
    <path d="M48 0 V264"/>
    <path d="M96 0 V264"/>
    <path d="M144 0 V264"/>
    <path d="M192 0 V264"/>
    <path d="M240 0 V264"/>
    <path d="M288 0 V264"/>
    <path d="M336 0 V264"/>
    <path d="M0 48 H384"/>
    <path d="M0 96 H384"/>
    <path d="M0 144 H384"/>
    <path d="M0 192 H384"/>
    <path d="M0 240 H384"/>
  </g>
  <rect x="18" y="18" width="132" height="32" rx="6" fill="rgba(15,23,42,0.5)" stroke="${theme.soft}" opacity="0.95"/>
  <text x="32" y="40" fill="${theme.text}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700">${escapeXml(theme.label)}</text>
  <text x="20" y="235" fill="${theme.text}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700">${title}</text>
</svg>`);
}

export function legendResponse(parts: string[]) {
  const theme = themeFor(parts);
  const title = escapeXml(theme.label);

  return svgResponse(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96" role="img" aria-label="${title} legend">
  <rect width="360" height="96" rx="10" fill="#ffffff"/>
  <rect x="16" y="18" width="224" height="18" rx="4" fill="${theme.bg}"/>
  <rect x="72" y="18" width="56" height="18" fill="${theme.accent}" opacity="0.45"/>
  <rect x="128" y="18" width="56" height="18" fill="${theme.accent}" opacity="0.7"/>
  <rect x="184" y="18" width="56" height="18" fill="${theme.soft}"/>
  <text x="16" y="66" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700">${title}</text>
  <text x="16" y="84" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="12">Low</text>
  <text x="214" y="84" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="12">High</text>
</svg>`);
}

export function tileResponse(parts: string[]) {
  const theme = themeFor(parts);

  return svgResponse(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="${theme.accent}" opacity="0.35"/>
  <path d="M-32 210 C21 156 57 185 101 132 C145 80 178 105 218 48 C246 9 270 18 288 2" fill="none" stroke="${theme.soft}" stroke-width="14" opacity="0.28"/>
  <path d="M-24 72 C24 40 54 58 96 32 C135 8 166 19 205 -10" fill="none" stroke="${theme.text}" stroke-width="8" opacity="0.18"/>
  <g stroke="${theme.bg}" stroke-width="1" opacity="0.18">
    <path d="M64 0 V256"/>
    <path d="M128 0 V256"/>
    <path d="M192 0 V256"/>
    <path d="M0 64 H256"/>
    <path d="M0 128 H256"/>
    <path d="M0 192 H256"/>
  </g>
</svg>`);
}
