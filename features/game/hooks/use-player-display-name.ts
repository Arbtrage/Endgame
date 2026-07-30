"use client";

import { useSession } from "@/shared/auth/auth-client";

export function usePlayerDisplayName(): string {
  const { data: session } = useSession();
  const name = session?.user.name?.trim();
  if (name) return name;
  const email = session?.user.email?.split("@")[0]?.trim();
  if (email) return email;
  return "You";
}
