"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/markdown-content";
import type { Article } from "@prisma/client";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [content, setContent] = useState(article?.content ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const isEdit = Boolean(article);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title") as string,
      excerpt: form.get("excerpt") as string,
      content,
      coverImage: (form.get("coverImage") as string) || null,
    };

    const res = await fetch(isEdit ? `/api/articles/${article!.id}` : "/api/articles", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? "Draft saved" : "Draft created");
      const data = await res.json();
      router.push(`/admin/articles/${data.id ?? article!.id}`);
      router.refresh();
    } else {
      toast.error("Something went wrong. Check required fields.");
    }
  }

  async function handlePublish() {
    if (!article) return;
    if (!confirm(article.aiGenerated ? "This is an AI-drafted article — have you reviewed it for accuracy? Publishing will also email it to every newsletter subscriber." : "Publish this article and email it to every newsletter subscriber?")) {
      return;
    }
    setPublishing(true);
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    setPublishing(false);
    if (res.ok) {
      const data = await res.json();
      if (data.newsletter?.skipped === "not_configured") {
        toast.success("Published — newsletter sending isn't configured yet (set RESEND_API_KEY), so no emails were sent.");
      } else {
        toast.success(`Published and sent to ${data.newsletter?.sent ?? 0} subscribers.`);
      }
      router.refresh();
    } else {
      toast.error("Failed to publish");
    }
  }

  return (
    <div className="space-y-6">
      {article?.aiGenerated && article.status === "DRAFT" && (
        <div className="card-surface border-yellow-500/30 p-4 text-sm text-yellow-400">
          This article was AI-drafted by the weekly digest cron from verified tool-change data. Review it for
          accuracy before publishing — nothing gets emailed until you explicitly click Publish below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Title</span>
          <Input name="title" defaultValue={article?.title} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Excerpt (used as preview text and meta description)</span>
          <Input name="excerpt" defaultValue={article?.excerpt} required maxLength={300} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Cover image URL (optional)</span>
          <Input name="coverImage" type="url" defaultValue={article?.coverImage ?? ""} />
        </label>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-muted)]">Content (Markdown)</span>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-xs text-[var(--color-primary)]">
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
          {showPreview ? (
            <div className="card-surface min-h-[300px] p-4">
              <MarkdownContent content={content} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={16}
              className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 font-mono text-sm"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving} variant="outline">
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          {isEdit && article!.status === "DRAFT" && (
            <Button type="button" onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish & Send to Subscribers"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
