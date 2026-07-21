import { prisma } from "@/lib/prisma";
import { SubmissionActions } from "@/components/admin/submission-actions";

export default async function AdminSubmissionsPage() {
  const [submissions, categories] = await Promise.all([
    prisma.toolSubmission.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tool Submissions</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{submissions.length} pending review</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card-surface p-10 text-center text-[var(--color-muted)]">No pending submissions right now.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="card-surface p-5">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{s.tagline}</p>
                </div>
                <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-[var(--color-primary)]">
                  {s.websiteUrl}
                </a>
              </div>
              <p className="mb-4 text-sm text-[var(--color-muted)]">{s.description}</p>
              <p className="mb-4 text-xs text-[var(--color-muted-2)]">Submitted by {s.submitterEmail} · {s.createdAt.toLocaleDateString()}</p>
              <SubmissionActions submissionId={s.id} categories={categories} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
