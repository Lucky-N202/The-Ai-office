import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">Sign in to bookmark tools across devices and leave reviews.</p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/" });
        }}
      >
        <Button type="submit" size="lg" className="w-full">
          <Github size={16} /> Continue with GitHub
        </Button>
      </form>
    </div>
  );
}
