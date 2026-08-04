import {
  buildAnalysisCompleteEmailHtml,
  buildAnalysisCompleteEmailSubject,
  type AnalysisCompleteEmailInput,
} from "@/server/email/templates/analysis-complete-email";
import { getEmailFrom, getResendClient } from "@/server/email/resend-client";

type SendAnalysisCompleteEmailInput = AnalysisCompleteEmailInput & {
  toEmail: string;
};

export async function sendAnalysisCompleteEmail(
  input: SendAnalysisCompleteEmailInput,
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured; skipping analysis email");
    return { sent: false, error: "Email not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.toEmail,
      subject: buildAnalysisCompleteEmailSubject(input.accuracy),
      html: buildAnalysisCompleteEmailHtml(input),
    });

    if (error) {
      console.error("[email] Failed to send analysis email:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email] Failed to send analysis email:", message);
    return { sent: false, error: message };
  }
}
