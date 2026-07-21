import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Submit a Tool",
  description: "Know an AI tool that should be in the directory? Submit it for review.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Submit a Tool</h1>
      <p className="mb-8 text-[var(--color-muted)]">
        Know an AI tool that deserves a spot in the directory? Tell us about it — our team reviews every
        submission before it goes live.
      </p>
      <SubmitForm />
    </div>
  );
}
