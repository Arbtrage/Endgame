import { Suspense } from "react";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { Skeleton } from "@/shared/ui/skeleton";

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SignInForm />
    </Suspense>
  );
}
