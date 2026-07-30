import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { updateSettingsSchema } from "@/server/api/schemas/user.schema";
import { userService } from "@/server/services/user.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const settings = await userService.getSettings(session.user.id);
    return apiSuccess(settings);
  });
}

export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = updateSettingsSchema.parse(body);
    const settings = await userService.updateSettings(session.user.id, parsed);
    return apiSuccess(settings);
  });
}
