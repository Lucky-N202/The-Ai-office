"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@prisma/client";

export function SubmissionActions({
  submissionId,
  categories,
  defaultCategoryId,
  priorityReview,
}: {
  submissionId: string;
  categories: Category[];
  defaultCategoryId?: string | null;
  priorityReview?: boolean;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? categories[0]?.id ?? "");
  const [loading, setLoading] = useState<"approve" | "reject" | "toggle-priority" | null>(null);

  async function decide(action: "approve" | "reject" | "toggle-priority") {
    setLoading(action);
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "approve" ? { action, categoryId } : { action }),
    });
    setLoading(null);
    if (res.ok) {
      if (action === "approve") toast.success("Tool published");
      else if (action === "reject") toast.success("Submission rejected");
      else toast.success(priorityReview ? "Priority removed" : "Marked as priority");
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
      {/* Only mark this after confirming a real payment for the paid "Verified"
          plan on /advertise — this isn't self-service for submitters. */}
      <Button size="sm" variant="outline" onClick={() => decide("toggle-priority")} disabled={loading !== null}>
        <Star size={13} className={priorityReview ? "fill-current" : ""} />
        {loading === "toggle-priority" ? "…" : priorityReview ? "Unmark priority" : "Mark priority (paid)"}
      </Button>
    </div>
  );
}
