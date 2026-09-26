"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ExistingReview = { id: string; rating: number; title: string; body: string } | null;

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? "fill-[var(--color-primary)] text-[var(--color-primary)]"
                : "text-[var(--color-border-hover)]"
            }
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ toolId, toolSlug }: { toolId: string; toolSlug: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existing, setExisting] = useState<ExistingReview>(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoadingExisting(false);
      return;
    }
    fetch(`/api/reviews?toolId=${toolId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.review) {
          setExisting(data.review);
          setRating(data.review.rating);
          setTitle(data.review.title);
          setBody(data.review.body);
        }
      })
      .finally(() => setLoadingExisting(false));
  }, [status, toolId]);

  if (status === "loading" || loadingExisting) return null;

  if (status !== "authenticated") {
    return (
      <div className="card-surface p-4 text-sm text-[var(--color-muted)]">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/browse/tools/${toolSlug}`)}`}
          className="text-[var(--color-primary)] hover:underline"
        >
          Sign in
        </Link>{" "}
        to leave a review.
      </div>
    );
  }

  // Existing reviewer, form collapsed by default — avoids every tool page
  // opening with a full form already expanded for the (common, once your
  // review base grows) case of someone who's already reviewed this tool.
  if (existing && !open) {
    return (
      <div className="card-surface flex items-center justify-between gap-4 p-4">
        <p className="text-sm text-[var(--color-muted)]">You&apos;ve already reviewed this tool.</p>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Edit your review
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating < 1) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, rating, title, body }),
    });
    const data = await res.json().catch(() => null);
    setSubmitting(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success(existing ? "Review updated" : "Review posted");
    setExisting({ id: data.id, rating, title, body });
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold">{existing ? "Edit your review" : "Write a review"}</h3>
      <StarPicker value={rating} onChange={setRating} />
      <Input placeholder="Review title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      <textarea
        placeholder="What did you think?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={4}
        required
        className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving..." : existing ? "Update review" : "Post review"}
        </Button>
        {existing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
