import { describe, expect, it } from "vitest";
import {
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  GEMINI_3_LITE_MODELS,
  resolveGeminiModel,
} from "@/server/ai/models";

describe("resolveGeminiModel", () => {
  it("only allows Gemini 3 lite models", () => {
    expect(GEMINI_3_LITE_MODELS).toEqual([
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
    ]);
  });

  it("returns allowed models from env", () => {
    expect(resolveGeminiModel("gemini-3.1-flash-lite")).toBe(
      "gemini-3.1-flash-lite",
    );
  });

  it("rejects unknown models including 2.0", () => {
    expect(resolveGeminiModel("gemini-2.0-flash")).toBe(DEFAULT_GEMINI_MODEL);
    expect(resolveGeminiModel("gemini-1.5-pro")).toBe(DEFAULT_GEMINI_MODEL);
    expect(resolveGeminiModel(undefined, FALLBACK_GEMINI_MODEL)).toBe(
      FALLBACK_GEMINI_MODEL,
    );
  });
});
