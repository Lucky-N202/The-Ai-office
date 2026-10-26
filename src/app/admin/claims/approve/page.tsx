import { prisma } from "@/lib/prisma";
import { verifyClaim, registrableHost } from "@/lib/claims";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ApproveClaimPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const claim = verifyClaim(token);
  const tool = claim
    ? await prisma.tool.findUnique({ where: { id: claim.toolId }, select: { name: true, websiteUrl: true } })
    : null;

  if (!claim || !tool) {
    return (
      <div className="max-w-xl">
        <h1 className="mb-2 text-xl font-semibold">Invalid or expired claim</h1>
        <p className="text-sm text-[var(--color-muted)]">Ask the vendor to submit the claim form again.</p>
      </div>
    );
  }

  const match = registrableHost(claim.email) === registrableHost(tool.websiteUrl);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Approve listing claim</h1>
      <div className="card-surface space-y-1 p-5 text-sm">
        <p><span className="text-[var(--color-muted-2)]">Tool:</span> {tool.name} ({tool.websiteUrl})</p>
        <p><span className="text-[var(--color-muted-2)]">Plan:</span> {claim.plan}</p>
        <p><span className="text-[var(--color-muted-2)]">Requested by:</span> {claim.name} &lt;{claim.email}&gt;</p>
        <p className={match ? "text-green-400" : "text-red-400"}>
          {match
            ? "Email domain matches the tool's website."
            : "Email domain does NOT match the tool's website — verify ownership another way before approving."}
        </p>
      </div>
      <form method="post" action="/api/claims/approve">
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Approve &amp; email checkout link</Button>
      </form>
    </div>
  );
}
