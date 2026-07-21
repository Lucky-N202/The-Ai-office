"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category, Tool } from "@prisma/client";

const pricingModels = ["FREE", "FREEMIUM", "PAID", "ENTERPRISE", "OPEN_SOURCE"] as const;

function listToText(list: string[]) {
  return list.join("\n");
}
function textToList(text: string) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function ToolForm({ tool, categories }: { tool?: Tool; categories: Category[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(tool);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      tagline: form.get("tagline") as string,
      description: form.get("description") as string,
      websiteUrl: form.get("websiteUrl") as string,
      logoUrl: form.get("logoUrl") as string,
      categoryId: form.get("categoryId") as string,
      pricingModel: form.get("pricingModel") as string,
      startingPrice: form.get("startingPrice") ? Number(form.get("startingPrice")) : null,
      features: textToList(form.get("features") as string),
      pros: textToList(form.get("pros") as string),
      cons: textToList(form.get("cons") as string),
      tags: textToList(form.get("tags") as string),
      featured: form.get("featured") === "on",
    };

    const res = await fetch(isEdit ? `/api/tools/${tool!.id}` : "/api/tools", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(isEdit ? "Tool updated" : "Tool created");
      router.push("/admin/tools");
      router.refresh();
    } else {
      toast.error("Something went wrong. Check required fields.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name"><Input name="name" defaultValue={tool?.name} required /></Field>
        <Field label="Tagline"><Input name="tagline" defaultValue={tool?.tagline} required /></Field>
        <Field label="Website URL"><Input name="websiteUrl" type="url" defaultValue={tool?.websiteUrl} required /></Field>
        <Field label="Logo URL"><Input name="logoUrl" type="url" defaultValue={tool?.logoUrl} required /></Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={tool?.categoryId} required className="focus-ring h-10 w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] px-3.5 text-sm">
            <option value="" disabled>Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Pricing Model">
          <select name="pricingModel" defaultValue={tool?.pricingModel ?? "FREEMIUM"} className="focus-ring h-10 w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] px-3.5 text-sm">
            {pricingModels.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Starting Price (USD/mo, blank = custom)">
          <Input name="startingPrice" type="number" step="0.01" defaultValue={tool?.startingPrice ?? undefined} />
        </Field>
        <Field label="Featured">
          <input type="checkbox" name="featured" defaultChecked={tool?.featured} className="h-5 w-5 accent-[var(--color-primary)]" />
        </Field>
      </div>

      <Field label="Description">
        <textarea name="description" defaultValue={tool?.description} required rows={4} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Features (one per line)">
          <textarea name="features" defaultValue={tool ? listToText(tool.features) : ""} rows={5} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
        </Field>
        <Field label="Tags (one per line)">
          <textarea name="tags" defaultValue={tool ? listToText(tool.tags) : ""} rows={5} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
        </Field>
        <Field label="Pros (one per line)">
          <textarea name="pros" defaultValue={tool ? listToText(tool.pros) : ""} rows={5} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
        </Field>
        <Field label="Cons (one per line)">
          <textarea name="cons" defaultValue={tool ? listToText(tool.cons) : ""} rows={5} className="focus-ring w-full rounded-[14px] border border-[var(--color-border)] bg-white/[0.02] p-3.5 text-sm" />
        </Field>
      </div>

      <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Tool"}</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
