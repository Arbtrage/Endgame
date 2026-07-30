import { describe, expect, it, vi } from "vitest";
import { userService } from "@/server/services/user.service";

vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: {
    findById: vi.fn(),
    updateProfile: vi.fn(),
    ensureSettings: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    updateOnboarding: vi.fn(),
  },
}));

import { userRepository } from "@/server/repositories/user.repository";

describe("userService.updateProfile", () => {
  it("returns updated profile fields", async () => {
    vi.mocked(userRepository.updateProfile).mockResolvedValue({
      id: "user_1",
      name: "Alice",
      email: "alice@example.com",
      image: null,
      skillEstimate: 1200,
      onboardingComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      settings: null,
    });

    const result = await userService.updateProfile("user_1", "Alice");

    expect(result.name).toBe("Alice");
    expect(result.email).toBe("alice@example.com");
  });
});
