import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The AI Office",
    short_name: "AI Office",
    description: "Discover, compare, and bookmark the best AI tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#7C3AED",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
