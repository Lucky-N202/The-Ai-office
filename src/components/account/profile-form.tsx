"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Name</span>
        <Input value={value} onChange={(e) => setValue(e.target.value)} required maxLength={80} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">Email</span>
        <Input value={email} disabled className="opacity-60" />
        <span className="mt-1 block text-xs text-[var(--color-muted-2)]">
          Your email is tied to how you sign in and can&apos;t be changed here.
        </span>
      </label>
      <Button type="submit" disabled={loading || value === name} className="self-start">
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
