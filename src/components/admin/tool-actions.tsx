"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function AdminToolActions({ toolId }: { toolId: string }) {
  const router = useRouter();
  const [generating, setGenerating] = useState<"featured" | "verified" | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this tool? This cannot be undone.")) return;
    const res = await fetch(`/api/tools/${toolId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tool deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete tool");
    }
  }

  async function handleGenerateLink(plan: "featured" | "verified") {
    setGenerating(plan);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, plan }),
    });
    const data = await res.json();
    setGenerating(null);

    if (!res.ok) {
      toast.error(data.error ?? "Failed to generate link");
      return;
    }

    await navigator.clipboard.writeText(data.url).catch(() => null);
    toast.success(`${plan === "featured" ? "Featured" : "Verified"} payment link copied — send it to ${data.toolName}'s team`);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => handleGenerateLink("verified")}
        disabled={generating !== null}
        title="Generate a Verified payment link"
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)] disabled:opacity-40"
      >
        <ShieldCheck size={14} />
      </button>
      <button
        onClick={() => handleGenerateLink("featured")}
        disabled={generating !== null}
        title="Generate a Featured payment link"
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)] disabled:opacity-40"
      >
        <Star size={14} />
      </button>
      <Link href={`/admin/tools/${toolId}`} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]">
        <Pencil size={14} />
      </Link>
      <button onClick={handleDelete} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-red-500/10 hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
