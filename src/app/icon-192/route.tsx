import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#7C3AED", color: "white", fontSize: 100, fontWeight: 700 }}>
        AI
      </div>
    ),
    { width: 192, height: 192 }
  );
}
