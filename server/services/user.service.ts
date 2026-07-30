import { ApiError } from "@/server/api/response";
import { userRepository } from "@/server/repositories/user.repository";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }
    await userRepository.ensureSettings(userId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      skillEstimate: user.skillEstimate,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, name: string) {
    const user = await userRepository.updateProfile(userId, { name });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      skillEstimate: user.skillEstimate,
      onboardingComplete: user.onboardingComplete,
    };
  },

  async updateOnboarding(
    userId: string,
    data: { skillEstimate?: number; onboardingComplete?: boolean },
  ) {
    const user = await userRepository.updateOnboarding(userId, data);
    return {
      id: user.id,
      name: user.name,
      skillEstimate: user.skillEstimate,
      onboardingComplete: user.onboardingComplete,
    };
  },

  async getSettings(userId: string) {
    await userRepository.ensureSettings(userId);
    const settings = await userRepository.getSettings(userId);
    if (!settings) {
      throw new ApiError("NOT_FOUND", "Settings not found", 404);
    }
    return settings;
  },

  async updateSettings(
    userId: string,
    data: Parameters<typeof userRepository.updateSettings>[1],
  ) {
    await userRepository.ensureSettings(userId);
    return userRepository.updateSettings(userId, data);
  },
};
