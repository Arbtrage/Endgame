"use client";

import { toast } from "sonner";
import { signIn } from "@/shared/auth/auth-client";
import { Button } from "@/shared/ui/button";

export function OAuthButtons({ callbackUrl }: { callbackUrl: string }) {
  async function handleGoogleSignIn() {
    const result = await signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Google sign in failed");
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
      Continue with Google
    </Button>
  );
}
