import { describe, expect, it } from "vitest";
import {
  chatResponseSchema,
  explanationResponseSchema,
  moveResponseSchema,
  parseGeminiResponse,
  stripMarkdownFences,
} from "@/server/ai/parser";

describe("stripMarkdownFences", () => {
  it("strips json code fences", () => {
    expect(stripMarkdownFences('```json\n{"uci":"e2e4"}\n```')).toBe(
      '{"uci":"e2e4"}',
    );
  });

  it("returns trimmed plain text", () => {
    expect(stripMarkdownFences('  {"uci":"e2e4"}  ')).toBe('{"uci":"e2e4"}');
  });
});

describe("parseGeminiResponse", () => {
  it("parses valid move JSON", () => {
    const result = parseGeminiResponse(
      '{"uci":"e2e4","comment":"Let\'s go!"}',
      moveResponseSchema,
    );
    expect(result.uci).toBe("e2e4");
    expect(result.comment).toBe("Let's go!");
  });

  it("parses fenced explanation JSON", () => {
    const result = parseGeminiResponse(
      '```json\n{"explanation":"Good move","concepts":["development"]}\n```',
      explanationResponseSchema,
    );
    expect(result.explanation).toBe("Good move");
    expect(result.concepts).toEqual(["development"]);
  });

  it("throws on invalid JSON", () => {
    expect(() =>
      parseGeminiResponse("not json", moveResponseSchema),
    ).toThrow();
  });

  it("parses chat response", () => {
    const result = parseGeminiResponse(
      '{"content":"Hello coach"}',
      chatResponseSchema,
    );
    expect(result.content).toBe("Hello coach");
  });
});
