import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "The AI Office — Discover the Best AI Tools", template: "%s · The AI Office" },
  description:
    "Browse, compare, and bookmark the best AI tools for writing, coding, design, video, and more. Curated, reviewed, and updated daily.",
  keywords: ["AI tools", "AI directory", "best AI tools", "AI tool comparison", "AI software"],
  openGraph: {
    type: "website",
    siteName: "The AI Office",
    title: "The AI Office — Discover the Best AI Tools",
    description: "Browse, compare, and bookmark the best AI tools for every workflow.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "The AI Office — Discover the Best AI Tools",
    description: "Browse, compare, and bookmark the best AI tools for every workflow.",
  },
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  verification: {
    google: "Zoy5kKqQ-jj40RcDQsahBjHK3Z-i2h_ILVweO6Rxp38",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Header />
          <CommandPalette />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <Toaster theme="dark" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
