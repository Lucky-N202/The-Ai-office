"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminCategoryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      icon: form.get("icon") as string,
      color: form.get("color") as string,
    };
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Category created");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error("Failed to create category");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Input name="name" placeholder="Name" required />
      <Input name="description" placeholder="Description" required className="lg:col-span-2" />
      <Input name="icon" placeholder="Lucide icon name (e.g. Sparkles)" required />
      <div className="flex gap-2">
        <Input name="color" placeholder="#7C3AED" required />
        <Button type="submit" disabled={saving} className="shrink-0">{saving ? "…" : "Add"}</Button>
      </div>
    </form>
  );
}
