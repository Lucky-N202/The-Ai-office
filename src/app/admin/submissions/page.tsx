import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_MAP = { pending: "PENDING", approved: "APPROVED", rejected: "REJECTED" } as const;
type Tab = "all" | keyof typeof STATUS_MAP;

const STATUS_STYLES: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
};

// Shown in UTC and labelled as such — the server renders this, so "local
// time" would silently mean the server's timezone, not yours.
function formatDateTime(d: Date) {
  return `${d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildHref(params: { status?: Tab; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/admin/submissions${qs ? `?${qs}` : ""}`;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const [pendingCount, approvedCount, rejectedCount, categories] = await Promise.all([
    prisma.toolSubmission.count({ where: { status: "PENDING" } }),
    prisma.toolSubmission.count({ where: { status: "APPROVED" } }),
    prisma.toolSubmission.count({ where: { status: "REJECTED" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const totalCount = pendingCount + approvedCount + rejectedCount;

  // Land on the review queue when there's something to review; otherwise
  // show the full log, since an empty "pending" tab isn't very informative.
  const requested = sp.status;
  const tab: Tab =
    requested === "all" || requested === "pending" || requested === "approved" || requested === "rejected"
      ? requested
      : pendingCount > 0
        ? "pending"
        : "all";
  const statusFilter = tab === "all" ? undefined : STATUS_MAP[tab];

  const where: Prisma.ToolSubmissionWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { submitterEmail: { contains: q, mode: "insensitive" } },
            { websiteUrl: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const total = await prisma.toolSubmission.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1), totalPages);

  // The review queue shows paid-priority items first; the log is plain
  // newest-first so it reads chronologically.
  const orderBy: Prisma.ToolSubmissionOrderByWithRelationInput[] =
    tab === "pending" ? [{ priorityReview: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }];

  const submissions = await prisma.toolSubmission.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      category: { select: { name: true } },
      approvedTool: { select: { id: true, name: true, slug: true } },
    },
  });

  // Who are these submitters? Submissions are anonymous (no login needed),
  // so match by email against registered users, and count how many times
  // each email has submitted — repeat submitters (or a flood from one
  // address) stand out immediately.
  const emails = [...new Set(submissions.map((s) => s.submitterEmail))];
  const lookupEmails = [...new Set(emails.flatMap((e) => [e, e.toLowerCase()]))];
  const [users, submitterHistory] = await Promise.all([
    prisma.user.findMany({ where: { email: { in: lookupEmails } }, select: { email: true, name: true } }),
    prisma.toolSubmission.findMany({ where: { submitterEmail: { in: lookupEmails } }, select: { submitterEmail: true } }),
  ]);
  const userByEmail = new Map(users.map((u) => [(u.email ?? "").toLowerCase(), u.name]));
  const submissionsByEmail = new Map<string, number>();
  for (const row of submitterHistory) {
    const key = row.submitterEmail.toLowerCase();
    submissionsByEmail.set(key, (submissionsByEmail.get(key) ?? 0) + 1);
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
    { key: "rejected", label: "Rejected", count: rejectedCount },
  ];

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Tool submissions</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">
        {totalCount} received · {pendingCount} pending · {approvedCount} approved · {rejectedCount} rejected
      </p>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={buildHref({ status: t.key, q })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                t.key === tab
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-foreground)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              )}
            >
              {t.label} <span className="text-[var(--color-muted-2)]">{t.count}</span>
            </Link>
          ))}
        </nav>

        <form action="/admin/submissions" className="flex items-center gap-2">
          <input type="hidden" name="status" value={tab} />
          <Input name="q" defaultValue={q} placeholder="Search tool, email, or URL" className="h-9 w-64" />
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
          {q && (
            <Link href={buildHref({ status: tab })} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
              Clear
            </Link>
          )}
        </form>
      </div>

      {submissions.length === 0 ? (
        <p className="text-[var(--color-muted)]">
          {q
            ? `No submissions match "${q}" in this view.`
            : tab === "pending"
              ? "Nothing waiting for review."
              : tab === "all"
                ? "No tools have been submitted yet."
                : `No ${tab} submissions.`}
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-[var(--color-muted-2)]">
            Showing {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="space-y-4">
            {submissions.map((s) => {
              const emailKey = s.submitterEmail.toLowerCase();
              const isRegistered = userByEmail.has(emailKey);
              const registeredName = userByEmail.get(emailKey);
              const fromSameSubmitter = submissionsByEmail.get(emailKey) ?? 1;
              const isPending = s.status === "PENDING";

              return (
                <div key={s.id} className="card-surface p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      {s.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-only list, arbitrary external submitter URLs
                        <img src={s.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{s.name}</p>
                          <Badge className={STATUS_STYLES[s.status]}>{s.status.charAt(0) + s.status.slice(1).toLowerCase()}</Badge>
                          {s.priorityReview && (
                            <span className="rounded-full bg-[var(--color-primary-muted)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-primary)]">
                              Priority
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">{s.tagline}</p>
                      </div>
                    </div>
                    <a
                      href={s.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                    >
                      {hostnameOf(s.websiteUrl)} <ExternalLink size={11} />
                    </a>
                  </div>

                  <p className={cn("mb-4 text-sm text-[var(--color-muted)]", !isPending && "line-clamp-2")}>{s.description}</p>

                  <dl className="mb-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="mb-0.5 text-[var(--color-muted-2)]">Submitted by</dt>
                      <dd className="break-all">
                        <a href={`mailto:${s.submitterEmail}`} className="text-[var(--color-foreground)] hover:text-[var(--color-primary)]">
                          {s.submitterEmail}
                        </a>
                      </dd>
                      <dd className="text-[var(--color-muted-2)]">
                        {isRegistered ? `Registered user${registeredName ? `: ${registeredName}` : ""}` : "Not a registered user"}
                        {fromSameSubmitter > 1 ? ` · ${fromSameSubmitter} submissions total` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-0.5 text-[var(--color-muted-2)]">Category</dt>
                      <dd className="text-[var(--color-foreground)]">{s.category?.name ?? "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="mb-0.5 text-[var(--color-muted-2)]">Submitted</dt>
                      <dd className="text-[var(--color-foreground)]">{formatDateTime(s.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="mb-0.5 text-[var(--color-muted-2)]">{isPending ? "Reviewed" : s.status === "APPROVED" ? "Approved" : "Rejected"}</dt>
                      <dd className="text-[var(--color-foreground)]">{s.reviewedAt ? formatDateTime(s.reviewedAt) : "—"}</dd>
                      {s.reviewedBy && <dd className="break-all text-[var(--color-muted-2)]">by {s.reviewedBy}</dd>}
                    </div>
                  </dl>

                  {isPending && (
                    <SubmissionActions
                      submissionId={s.id}
                      categories={categories}
                      defaultCategoryId={s.categoryId}
                      priorityReview={s.priorityReview}
                    />
                  )}

                  {s.status === "APPROVED" && (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {s.approvedTool ? (
                        <>
                          <Link href={`/browse/tools/${s.approvedTool.slug}`} className="text-[var(--color-primary)] hover:underline">
                            View published listing →
                          </Link>
                          <Link href={`/admin/tools/${s.approvedTool.id}`} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                            Edit in admin
                          </Link>
                        </>
                      ) : (
                        <span className="text-[var(--color-muted-2)]">Published listing not linked (approved before linking was added, or the tool was later deleted).</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              {page > 1 ? (
                <Link href={buildHref({ status: tab, q, page: page - 1 })} className="text-[var(--color-primary)] hover:underline">
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-xs text-[var(--color-muted-2)]">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={buildHref({ status: tab, q, page: page + 1 })} className="text-[var(--color-primary)] hover:underline">
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
