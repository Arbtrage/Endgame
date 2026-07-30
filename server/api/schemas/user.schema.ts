import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateSettingsSchema = z.object({
  boardTheme: z.string().optional(),
  pieceSet: z.string().optional(),
  soundEnabled: z.boolean().optional(),
  defaultStockfishLevel: z.number().int().min(1).max(20).optional(),
  defaultAiPersonality: z.string().optional(),
  coachAutoExplain: z.boolean().optional(),
});

export const onboardingSchema = z.object({
  skillEstimate: z.number().int().min(800).max(2400).optional(),
  onboardingComplete: z.boolean().optional(),
});
