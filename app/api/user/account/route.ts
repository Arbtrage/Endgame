import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { deleteUserAccount } from "@/server/services/report.service";

export async function DELETE() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const result = await deleteUserAccount(session.user.id);
    return apiSuccess(result);
  });
}
