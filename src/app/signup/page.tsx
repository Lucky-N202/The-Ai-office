import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Chrome } from "lucide-react";
import bcrypt from "bcryptjs";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const destination = callbackUrl?.startsWith("/") ? callbackUrl : "/welcome";

  const session = await auth();
  if (session?.user) redirect(destination);

  async function signup(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password || password.length < 8) {
      redirect(`/signup?error=InvalidInput`);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect(`/signup?error=EmailInUse`);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, password: hashedPassword } });

    // Auto-login right after signup so there's no extra step.
    try {
      await signIn("credentials", { email, password, redirectTo: destination });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login");
      }
      throw err;
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Create an account</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">Sign up to bookmark tools across devices and leave reviews.</p>

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

      <form action={signup} className="flex w-full flex-col gap-3 text-left">
        <Input type="text" name="name" placeholder="Name" required />
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password (min. 8 characters)" minLength={8} required />
        {error === "EmailInUse" && (
          <p className="text-sm text-red-500">An account with this email already exists.</p>
        )}
        {error === "InvalidInput" && (
          <p className="text-sm text-red-500">Please fill in every field (password: 8+ characters).</p>
        )}
        <Button type="submit" size="lg" className="w-full">
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
