import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { userService } from "@/server/services/user.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const profile = await userService.getProfile(session.user.id);
    return apiSuccess(profile);
  });
}

export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const { updateProfileSchema } = await import(
      "@/server/api/schemas/user.schema"
    );
    const parsed = updateProfileSchema.parse(body);
    const profile = await userService.updateProfile(
      session.user.id,
      parsed.name,
    );
    return apiSuccess(profile);
  });
}
