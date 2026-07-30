import type { AIProvider } from "./types";
import { GeminiProvider } from "./gemini.provider";

let cachedProvider: AIProvider | null = null;

export function isAIConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getAIProvider(): AIProvider {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const provider = process.env.AI_PROVIDER?.trim() || "gemini";

  if (provider === "gemini") {
    if (!cachedProvider) {
      cachedProvider = new GeminiProvider(apiKey);
    }
    return cachedProvider;
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/** Reset cached provider (for tests) */
export function resetAIProviderCache(): void {
  cachedProvider = null;
}
