"use client";

import { Button } from "@/components/ui/button";

export function HeroSearchButton() {
  return (
    <Button
      size="lg"
      onClick={() => window.dispatchEvent(new CustomEvent("command-palette:open"))}
      className="hidden sm:inline-flex"
    >
      Search Tools
    </Button>
  );
}
