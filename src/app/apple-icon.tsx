import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7C3AED",
          color: "white",
          fontSize: 90,
          fontWeight: 700,
        }}
      >
        AI
      </div>
    ),
    { ...size }
  );
}
