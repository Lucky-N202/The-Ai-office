import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Chrome } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  // Only ever redirect to a same-site path — never follow an external URL
  // passed in callbackUrl, which would otherwise be an open-redirect risk.
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/welcome";

  const session = await auth();
  if (session?.user) redirect(destination);

  async function loginWithPassword(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", { email, password, redirectTo: destination });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=CredentialsSignin&callbackUrl=${encodeURIComponent(destination)}`);
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">Sign in to bookmark tools across devices and leave reviews.</p>

      <div className="flex w-full flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: destination });
          }}
        >
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <Github size={16} /> Continue with GitHub
          </Button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: destination });
          }}
        >
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <Chrome size={16} /> Continue with Google
          </Button>
        </form>
      </div>

      <div className="my-6 flex w-full items-center gap-3 text-xs text-[var(--color-muted-2)]">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        or
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form action={loginWithPassword} className="flex w-full flex-col gap-3 text-left">
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />
        <Link href="/forgot-password" className="-mt-1 self-end text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:underline">
          Forgot password?
        </Link>
        {error === "CredentialsSignin" && (
          <p className="text-sm text-red-500">Invalid email or password.</p>
        )}
        <Button type="submit" size="lg" className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--color-primary)] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
