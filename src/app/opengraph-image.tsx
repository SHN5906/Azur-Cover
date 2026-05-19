import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt =
  "Azur Cover. Expert national en étanchéité et performance thermique";

// Fetch Inter from Google Fonts at build time (Satori needs TTF/OTF/WOFF, not WOFF2).
// This network call only happens at build/deploy, never at user runtime.
async function loadInter() {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
    if (!m) return undefined;
    const fontUrl = m[1];
    const ab = await fetch(fontUrl).then((r) => r.arrayBuffer());
    return ab;
  } catch {
    return undefined;
  }
}

export default async function OG() {
  const interFont = await loadInter();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0e0e11",
          color: "#fbfbfd",
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          position: "relative",
        }}
      >
        {/* Subtle teal radial glow top-right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 50% 60% at 80% 0%, rgba(0,166,166,0.18) 0%, rgba(0,166,166,0) 60%)",
            display: "flex",
          }}
        />

        {/* Top: brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "rgba(251,251,253,0.7)",
            zIndex: 1,
          }}
        >
          Azur Cover &nbsp;·&nbsp; Expert national
        </div>

        {/* Body: title + subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 92,
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
              fontWeight: 600,
              maxWidth: 1000,
              color: "#ffffff",
            }}
          >
            Performance thermique et étanchéité, sans compromis.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(251,251,253,0.65)",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            Étanchéité, cool roofing, vernis anti-chaleur Azur Reflect pour
            vitrages.
          </div>
        </div>

        {/* Bottom strip: accent + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                width: 48,
                height: 2,
                background:
                  "linear-gradient(90deg, #008eb9 0%, rgba(0,142,185,0) 100%)",
              }}
            />
            <span
              style={{
                fontSize: 18,
                color: "rgba(251,251,253,0.55)",
                letterSpacing: "0.08em",
              }}
            >
              azurcover.com
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "rgba(251,251,253,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            Étanchéité · Cool Roofing · Azur Reflect
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: interFont
        ? [
            {
              name: "Inter",
              data: interFont,
              style: "normal",
              weight: 600,
            },
          ]
        : undefined,
    }
  );
}
