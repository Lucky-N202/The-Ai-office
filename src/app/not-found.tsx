import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl font-bold text-[var(--color-primary)]">404</p>
      <h1 className="mb-2 text-xl font-semibold">Page not found</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">The tool or page you&rsquo;re looking for doesn&rsquo;t exist or was moved.</p>
      <Link href="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
