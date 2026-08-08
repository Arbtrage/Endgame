"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/shared/auth/auth-client";
import { BezelCard } from "@/shared/components/bezel-card";
import { PillButton } from "@/shared/components/pill-cta";
import { Field, FieldError, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

function validateEmail(value: string) {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  return null;
}

function validatePassword(value: string) {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    const result = await signIn.email({ email, password, callbackURL: callbackUrl });
    setLoading(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to sign in");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <BezelCard padding="lg">
      <h2 className="font-display text-2xl font-bold">Sign in</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick up where you left off — games and analysis saved.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldError>{errors.password}</FieldError>
        </Field>
        <PillButton type="submit" disabled={loading} className="w-full justify-center">
          {loading ? "Signing in..." : "Sign in"}
        </PillButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </BezelCard>
  );
}
