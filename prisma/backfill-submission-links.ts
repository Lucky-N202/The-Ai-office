/**
 * Submissions approved before the log existed have no `approvedToolId`, so
 * /admin/submissions can't link them to their published listing. The
 * approve handler always created the tool with slug = slugify(name), so
 * the link can be recovered by re-deriving that slug.
 *
 * Conservative on purpose: it only links when exactly that slug exists. If
 * the tool was later renamed, re-slugged, or deleted, it's left unlinked
 * (and reported) rather than guessed at. `reviewedBy` can't be recovered —
 * it simply wasn't recorded back then — so older rows show no reviewer.
 *
 * Safe to re-run — only touches APPROVED rows that are still unlinked.
 *
 * Run once, after `npx prisma db push`:
 *   npx tsx prisma/backfill-submission-links.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const unlinked = await prisma.toolSubmission.findMany({
    where: { status: "APPROVED", approvedToolId: null },
    select: { id: true, name: true },
  });

  if (unlinked.length === 0) {
    console.log("Nothing to backfill — every approved submission is already linked.");
    return;
  }

  let linked = 0;
  for (const submission of unlinked) {
    const tool = await prisma.tool.findUnique({ where: { slug: slugify(submission.name) }, select: { id: true } });
    if (!tool) {
      console.warn(`No matching tool for "${submission.name}" (renamed or deleted?) — left unlinked.`);
      continue;
    }
    await prisma.toolSubmission.update({ where: { id: submission.id }, data: { approvedToolId: tool.id } });
    linked++;
  }

  console.log(`Linked ${linked} of ${unlinked.length} approved submissions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
