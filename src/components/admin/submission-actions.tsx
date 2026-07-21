"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Category } from "@prisma/client";

export function SubmissionActions({ submissionId, categories }: { submissionId: string; categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function decide(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "approve" ? { action, categoryId } : { action }),
    });
    setLoading(null);
    if (res.ok) {
      toast.success(action === "approve" ? "Tool published" : "Submission rejected");
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="focus-ring h-9 rounded-[12px] border border-[var(--color-border)] bg-white/[0.02] px-3 text-xs"
      >
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <Button size="sm" onClick={() => decide("approve")} disabled={loading !== null}>
        {loading === "approve" ? "Publishing…" : "Approve & Publish"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => decide("reject")} disabled={loading !== null}>
        {loading === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}
