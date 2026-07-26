"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ChangeActions({ changeId }: { changeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function decide(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/changes/${changeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    if (res.ok) {
      toast.success(action === "approve" ? "Change applied" : "Change rejected");
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => decide("approve")} disabled={loading !== null}>
        {loading === "approve" ? "Applying…" : "Approve & Apply"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => decide("reject")} disabled={loading !== null}>
        {loading === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}
