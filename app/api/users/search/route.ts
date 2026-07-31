import { requireAuth } from "@/server/api/middleware";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { checkRateLimit } from "@/server/api/rate-limit";
import { userSearchSchema } from "@/server/api/schemas/pvp.schema";
import { userRepository } from "@/server/repositories/user.repository";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const parsed = userSearchSchema.safeParse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? 10,
    });

    if (!parsed.success) {
      return apiError("BAD_REQUEST", "Invalid search query", 400);
    }

    const rate = checkRateLimit({
      key: `user-search:${session.user.id}`,
      limit: 30,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return apiError("RATE_LIMITED", "Too many search requests", 429);
    }

    const users = await userRepository.searchUsers(
      parsed.data.q,
      session.user.id,
      parsed.data.limit,
    );

    return apiSuccess(users);
  });
}
