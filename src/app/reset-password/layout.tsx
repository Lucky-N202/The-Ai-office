import type { Metadata } from "next";

// Utility page — keep it out of the index. (Page itself is a client component,
// which can't export metadata, hence this layout.)
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
