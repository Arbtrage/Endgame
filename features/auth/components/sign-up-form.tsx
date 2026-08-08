"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/shared/auth/auth-client";
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

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = {
      name: !name.trim() ? "Display name is required" : undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setLoading(true);
    const result = await signUp.email({ email, password, name, callbackURL: "/dashboard" });
    setLoading(false);

    if (result.error) {
      toast.error(result.error.message ?? "Unable to create account");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <BezelCard padding="lg">
      <h2 className="font-display text-2xl font-bold">Create account</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Free to start. First coach session in under a minute.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Field>
          <FieldLabel htmlFor="name">Display name</FieldLabel>
          <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldError>{errors.password}</FieldError>
        </Field>
        <PillButton type="submit" disabled={loading} className="w-full justify-center">
          {loading ? "Creating account..." : "Create account"}
        </PillButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </BezelCard>
  );
}
