import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt =
  "Azur Cover — Expert national en étanchéité et performance thermique";

export default function OG() {
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
          background: "#fbfbfd",
          color: "#0a0a0b",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            fontFamily: "ui-monospace, monospace",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#6e6e73",
          }}
        >
          Azur Cover · Expert national
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              fontWeight: 600,
              maxWidth: 980,
            }}
          >
            Performance thermique et étanchéité, sans compromis.
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#6e6e73",
              maxWidth: 920,
            }}
          >
            Jusqu&apos;à −12 °C en intérieur, sans climatisation.
            <br />
            Solution unique en région PACA.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
