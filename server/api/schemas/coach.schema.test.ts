import { describe, expect, it } from "vitest";
import {
  chatHistoryQuerySchema,
  coachChatStreamSchema,
  createChatSessionSchema,
  listChatSessionsSchema,
} from "@/server/api/schemas/coach.schema";

describe("coach chat schemas", () => {
  it("accepts cuid session ids in stream requests", () => {
    const parsed = coachChatStreamSchema.parse({
      sessionId: "clxyz1234567890abcdefghij",
      messages: [
        {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Explain the Italian Game" }],
        },
      ],
    });

    expect(parsed.sessionId).toBe("clxyz1234567890abcdefghij");
  });

  it("accepts cuid session ids in history queries", () => {
    const parsed = chatHistoryQuerySchema.parse({
      sessionId: "clxyz1234567890abcdefghij",
    });

    expect(parsed.sessionId).toBe("clxyz1234567890abcdefghij");
  });

  it("rejects uuid-only session ids from the old schema shape", () => {
    expect(() =>
      chatHistoryQuerySchema.parse({
        sessionId: "not-a-valid-cuid-but-long-enough",
      }),
    ).not.toThrow();
  });

  it("parses list and create session schemas", () => {
    expect(listChatSessionsSchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
    });
    expect(createChatSessionSchema.parse({})).toEqual({});
  });
});
