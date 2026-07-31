import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Notifies admins that a change needs manual review. No-ops if RESEND_API_KEY
 * or ADMIN_NOTIFICATION_EMAIL aren't set — the change still lands in
 * /admin/changes either way, this is just the "don't have to go check" layer
 * on top. Never throws; a failed notification shouldn't fail the discovery run.
 */
export async function notifyAdminOfPendingChange(params: {
  toolName: string;
  summary: string;
  changeType: string;
  confidence: number;
  reviewUrl: string;
}): Promise<void> {
  if (!resend || !process.env.ADMIN_NOTIFICATION_EMAIL) return;

  try {
    await resend.emails.send({
      from: "The AI Office <theaioffice12@gmail.com>",
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `Review needed: ${params.toolName} (${params.changeType})`,
      text: `${params.toolName} — ${params.changeType}\n\n${params.summary}\n\nConfidence: ${Math.round(params.confidence * 100)}%\n\nReview: ${params.reviewUrl}`,
    });
  } catch {
    // Swallow — notification failure shouldn't block or fail the cron run.
  }
}
