import { getAppUrl } from "@/server/email/resend-client";

export type AnalysisCompleteEmailInput = {
  toName: string;
  gameId: string;
  gameMode: string;
  opponentName: string;
  resultLabel: string;
  completedAt: Date | null;
  analysisMode: string;
  accuracy: number;
  acpl: number;
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  brilliantCount: number;
  totalMoves: number;
};

function accuracyColor(accuracy: number): string {
  if (accuracy >= 90) return "#16a34a";
  if (accuracy >= 75) return "#d97706";
  return "#dc2626";
}

function formatDate(date: Date | null): string {
  if (!date) return "Recently";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildAnalysisCompleteEmailHtml(
  input: AnalysisCompleteEmailInput,
): string {
  const appUrl = getAppUrl();
  const analysisUrl = `${appUrl}/analyze/${input.gameId}`;
  const accent = accuracyColor(input.accuracy);
  const accuracyDisplay = input.accuracy.toFixed(1);

  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
      <tr>
        <td style="background:#111827;border-radius:16px 16px 0 0;padding:24px 28px;">
          <div style="color:#a3e635;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Endgame</div>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">Your game analysis is ready</h1>
          <p style="margin:8px 0 0;color:#9ca3af;font-size:14px;line-height:1.5;">
            Hi ${input.toName}, we finished reviewing your ${input.gameMode.toLowerCase()} game against ${input.opponentName}.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;padding:28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
          <div style="text-align:center;padding:20px 16px;border-radius:14px;background:#f9fafb;border:1px solid #e5e7eb;">
            <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Accuracy</div>
            <div style="margin-top:8px;font-size:48px;line-height:1;font-weight:800;color:${accent};">${accuracyDisplay}%</div>
            <div style="margin-top:10px;display:inline-block;padding:4px 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:12px;font-weight:600;">
              ${input.analysisMode} analysis
            </div>
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
            <tr>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#fafafa;border:1px solid #eee;">
                  <div style="font-size:12px;color:#6b7280;">ACPL</div>
                  <div style="font-size:22px;font-weight:700;color:#111827;">${input.acpl.toFixed(1)}</div>
                </div>
              </td>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#fafafa;border:1px solid #eee;">
                  <div style="font-size:12px;color:#6b7280;">Moves</div>
                  <div style="font-size:22px;font-weight:700;color:#111827;">${input.totalMoves}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;">
                  <div style="font-size:12px;color:#991b1b;">Blunders</div>
                  <div style="font-size:22px;font-weight:700;color:#991b1b;">${input.blunderCount}</div>
                </div>
              </td>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;">
                  <div style="font-size:12px;color:#9a3412;">Mistakes</div>
                  <div style="font-size:22px;font-weight:700;color:#9a3412;">${input.mistakeCount}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;">
                  <div style="font-size:12px;color:#92400e;">Inaccuracies</div>
                  <div style="font-size:22px;font-weight:700;color:#92400e;">${input.inaccuracyCount}</div>
                </div>
              </td>
              <td width="50%" style="padding:6px;">
                <div style="padding:14px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;">
                  <div style="font-size:12px;color:#1d4ed8;">Brilliancies</div>
                  <div style="font-size:22px;font-weight:700;color:#1d4ed8;">${input.brilliantCount}</div>
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top:20px;padding:14px 16px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;color:#374151;font-size:14px;line-height:1.6;">
            <strong style="color:#111827;">${input.resultLabel}</strong> · ${input.gameMode}<br />
            vs ${input.opponentName}<br />
            Completed ${formatDate(input.completedAt)}
          </div>

          <div style="margin-top:24px;text-align:center;">
            <a href="${analysisUrl}" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:10px;">
              View full analysis
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:18px 28px;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;text-align:center;">
            You received this because Endgame finished analyzing one of your games.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function buildAnalysisCompleteEmailSubject(accuracy: number): string {
  return `Analysis ready: ${accuracy.toFixed(0)}% accuracy — Endgame`;
}
