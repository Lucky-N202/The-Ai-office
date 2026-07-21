"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AdminToolActions({ toolId }: { toolId: string }) {
  const router = useRouter();

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

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/tools/${toolId}`} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)]">
        <Pencil size={14} />
      </Link>
      <button onClick={handleDelete} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-red-500/10 hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
