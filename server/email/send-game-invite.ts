import { getAppUrl, getEmailFrom, getResendClient } from "@/server/email/resend-client";

type SendGameInviteInput = {
  toEmail: string;
  inviterName: string;
  inviteeName: string;
  token: string;
  timeControlLabel: string;
  expiresAt: Date;
};

function buildGameInviteHtml(input: SendGameInviteInput): string {
  const appUrl = getAppUrl();
  const acceptUrl = `${appUrl}/pvp/invite/${input.token}`;
  const invitesUrl = `${appUrl}/pvp/invites`;
  const expiry = input.expiresAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
      <h1 style="font-size: 20px; margin-bottom: 8px;">Chess challenge from ${input.inviterName}</h1>
      <p style="color: #555; line-height: 1.5;">
        Hi ${input.inviteeName}, ${input.inviterName} invited you to a ${input.timeControlLabel} game on Endgame.
      </p>
      <p style="margin: 24px 0;">
        <a href="${acceptUrl}" style="background: #22c55e; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Accept challenge
        </a>
      </p>
      <p style="color: #555; font-size: 14px;">
        Or open <a href="${invitesUrl}">your pending invites</a> in the app.
      </p>
      <p style="color: #888; font-size: 12px; margin-top: 32px;">
        This invite expires ${expiry}.
      </p>
    </div>
  `;
}

export async function sendGameInviteEmail(
  input: SendGameInviteInput,
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured; skipping invite email");
    return { sent: false, error: "Email not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: input.toEmail,
      subject: `${input.inviterName} challenged you to a chess game`,
      html: buildGameInviteHtml(input),
    });

    if (error) {
      console.error("[email] Failed to send game invite:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email] Failed to send game invite:", message);
    return { sent: false, error: message };
  }
}
