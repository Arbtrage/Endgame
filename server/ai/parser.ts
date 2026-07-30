import { z } from "zod";
import type { ZodSchema } from "zod";

export function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

export function parseGeminiResponse<T>(raw: string, schema: ZodSchema<T>): T {
  const cleaned = stripMarkdownFences(raw);
  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
}

export const moveResponseSchema = z.object({
  uci: z.string().min(4).max(5),
  reasoning: z.string().optional(),
  comment: z.string().optional(),
});

export const explanationResponseSchema = z.object({
  explanation: z.string().min(1),
  concepts: z.array(z.string()).default([]),
  suggestedFollowUp: z.string().optional(),
});

export const chatResponseSchema = z.object({
  content: z.string().min(1),
});
