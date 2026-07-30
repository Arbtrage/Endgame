import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { onboardingSchema } from "@/server/api/schemas/user.schema";
import { userService } from "@/server/services/user.service";

export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = onboardingSchema.parse(body);
    const profile = await userService.updateOnboarding(session.user.id, parsed);
    return apiSuccess(profile);
  });
}
