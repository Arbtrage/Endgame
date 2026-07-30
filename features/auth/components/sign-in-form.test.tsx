import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInForm } from "@/features/auth/components/sign-in-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/shared/auth/auth-client", () => ({
  signIn: { email: vi.fn() },
}));

describe("SignInForm", () => {
  it("renders email and password fields", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
