import { auth } from "@/shared/auth/auth";
import { headers } from "next/headers";
import { ApiError } from "./response";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  return session;
}
