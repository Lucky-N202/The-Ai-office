import { prisma } from "@/lib/prisma";
import { ChangeActions } from "@/components/admin/change-actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminChangesPage() {
  const [pending, recent] = await Promise.all([
    prisma.toolChange.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.toolChange.findMany({
      where: { status: { in: ["AUTO_APPLIED", "APPROVED", "REJECTED"] } },
      include: { tool: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Engine — Changes</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{pending.length} pending review</p>
      </div>

      {pending.length === 0 ? (
        <div className="card-surface mb-10 p-10 text-center text-[var(--color-muted)]">Nothing pending review right now.</div>
      ) : (
        <div className="mb-10 space-y-4">
          {pending.map((change) => (
            <div key={change.id} className="card-surface p-5">
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold">{change.tool.name}</p>
                    <Badge>{change.changeType}</Badge>
                    <Badge className={change.confidence >= 0.7 ? "text-green-400" : "text-yellow-400"}>
                      {Math.round(change.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <a href={change.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)]">
                    {change.sourceUrl}
                  </a>
                </div>
                <span className="shrink-0 text-xs text-[var(--color-muted-2)]">{change.createdAt.toLocaleString()}</span>
              </div>
              <p className="mb-3 text-sm text-[var(--color-muted)]">{change.summary}</p>
              {change.suggestedUpdates && (
                <pre className="mb-4 overflow-x-auto rounded-lg bg-white/[0.03] p-3 text-xs text-[var(--color-muted)]">
                  {JSON.stringify(change.suggestedUpdates, null, 2)}
                </pre>
              )}
              <ChangeActions changeId={change.id} />
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
      <div className="card-surface overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-2)]">
              <th className="p-4">Tool</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">When</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-[var(--color-muted)]">No activity yet — the discovery cron hasn&rsquo;t run, or nothing&rsquo;s changed on any watched source.</td></tr>
            )}
            {recent.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="p-4">{c.tool.name}</td>
                <td className="p-4 text-[var(--color-muted)]">{c.changeType}</td>
                <td className="p-4">
                  <Badge className={
                    c.status === "AUTO_APPLIED" ? "text-[var(--color-primary)]" :
                    c.status === "APPROVED" ? "text-green-400" :
                    c.status === "REJECTED" ? "text-red-400" : ""
                  }>
                    {c.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="p-4 text-xs text-[var(--color-muted-2)]">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
