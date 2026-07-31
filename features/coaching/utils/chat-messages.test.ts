import { describe, expect, it } from "vitest";
import {
  dbMessageToUIMessage,
  getTextFromUIMessage,
} from "@/features/coaching/utils/chat-messages";

describe("chat message utils", () => {
  it("extracts text from ui message parts", () => {
    const text = getTextFromUIMessage({
      parts: [
        { type: "text", text: "Hello" },
        { type: "text", text: " coach" },
      ],
    });

    expect(text).toBe("Hello coach");
  });

  it("maps db messages to ui messages", () => {
    const message = dbMessageToUIMessage({
      id: "msg-1",
      role: "assistant",
      content: "Play Nf3.",
    });

    expect(message).toEqual({
      id: "msg-1",
      role: "assistant",
      parts: [{ type: "text", text: "Play Nf3." }],
    });
  });
});
