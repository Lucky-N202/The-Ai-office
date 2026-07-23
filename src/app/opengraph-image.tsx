import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "The AI Office — Discover the Best AI Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#7C3AED",
            color: "white",
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          AI
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#FAFAFA", letterSpacing: -1 }}>
          The AI Office
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#A1A1AA", marginTop: 16 }}>
          Discover, compare, and bookmark the best AI tools
        </div>
      </div>
    ),
    { ...size }
  );
}
