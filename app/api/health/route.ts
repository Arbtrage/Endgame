import { prisma } from "@/shared/db/prisma";
import { apiSuccess, withErrorHandler } from "@/server/api/response";

export async function GET() {
  return withErrorHandler(async () => {
    let database: "ok" | "degraded" = "ok";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "degraded";
    }

    return apiSuccess({
      status: database === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { database },
    });
  });
}
