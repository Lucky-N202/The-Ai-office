import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { DangerZone } from "@/components/account/danger-zone";
import { ReviewRow } from "@/components/account/review-row";
import { Bookmark, Star } from "lucide-react";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const [user, reviews, bookmarkCount, accounts] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: { tool: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bookmark.count({ where: { userId: session.user.id } }),
    prisma.account.findMany({ where: { userId: session.user.id }, select: { provider: true } }),
  ]);

  if (!user) redirect("/login");

  const linkedProviders = accounts.map((a) => a.provider);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">Account Settings</h1>

      <section className="card-surface mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <ProfileForm name={user.name ?? ""} email={user.email ?? ""} />
      </section>

      <section className="card-surface mb-6 p-6">
        <h2 className="mb-1 text-lg font-semibold">{user.password ? "Change password" : "Set a password"}</h2>
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          {user.password
            ? "Update the password you use to log in with email."
            : "You currently sign in via " +
              (linkedProviders.length > 0 ? linkedProviders.join(" and ") : "an external provider") +
              " only. Set a password to also be able to log in with your email directly."}
        </p>
        <PasswordForm hasPassword={!!user.password} />
      </section>

      {linkedProviders.length > 0 && (
        <section className="card-surface mb-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">Sign-in methods</h2>
          <ul className="flex flex-wrap gap-2">
            {linkedProviders.map((p) => (
              <li key={p} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm capitalize text-[var(--color-muted)]">
                {p}
              </li>
            ))}
            {user.password && (
              <li className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-muted)]">
                Email &amp; password
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="card-surface mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved tools</h2>
          <Link href="/bookmarks" className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline">
            <Bookmark size={14} /> View all ({bookmarkCount})
          </Link>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {bookmarkCount === 0 ? "You haven't saved any tools yet." : `You have ${bookmarkCount} tool${bookmarkCount === 1 ? "" : "s"} saved.`}
        </p>
      </section>

      <section className="card-surface mb-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Star size={18} /> Your reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">You haven&apos;t left any reviews yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <DangerZone />
    </div>
  );
}
