export const GEMINI_3_LITE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
] as const;

export type AllowedGeminiModel = (typeof GEMINI_3_LITE_MODELS)[number];

export const DEFAULT_GEMINI_MODEL: AllowedGeminiModel = "gemini-3.5-flash-lite";
export const FALLBACK_GEMINI_MODEL: AllowedGeminiModel = "gemini-3.1-flash-lite";

export function resolveGeminiModel(
  value: string | undefined,
  fallback: AllowedGeminiModel = DEFAULT_GEMINI_MODEL,
): AllowedGeminiModel {
  const trimmed = value?.trim();
  if (
    trimmed &&
    GEMINI_3_LITE_MODELS.includes(trimmed as AllowedGeminiModel)
  ) {
    return trimmed as AllowedGeminiModel;
  }
  return fallback;
}
