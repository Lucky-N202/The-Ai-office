"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } else {
      setLoading(false);
      toast.error("Something went wrong — your account was not deleted");
    }
  }

  return (
    <section className="card-surface border-red-900/40 p-6">
      <h2 className="mb-1 text-lg font-semibold text-red-500">Delete account</h2>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        Permanently deletes your account, bookmarks, and reviews. This can&apos;t be undone.
      </p>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-red-500">Are you sure? This is permanent.</p>
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Yes, delete my account"}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setConfirming(true)} className="border-red-900/40 text-red-500 hover:bg-red-950/30">
          Delete account
        </Button>
      )}
    </section>
  );
}
