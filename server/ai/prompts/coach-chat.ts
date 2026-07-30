import type { ChatParams } from "../types";

export function buildCoachChatPrompt(params: ChatParams): string {
  const contextLines: string[] = [];
  if (params.context?.skillLevel) {
    contextLines.push(`User skill estimate: ${params.context.skillLevel}`);
  }
  if (params.context?.fen) {
    contextLines.push(`Current position FEN: ${params.context.fen}`);
  }
  if (params.context?.mode) {
    contextLines.push(`Context mode: ${params.context.mode}`);
  }
  if (params.context?.gameId) {
    contextLines.push(`Active game: ${params.context.gameId}`);
  }

  const history = params.history
    .slice(-20)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  return `You are a friendly, expert chess coach. Answer clearly and concisely.
${contextLines.length ? `\nContext:\n${contextLines.join("\n")}` : ""}

Conversation history:
${history || "none"}

User: ${params.message}

Respond with JSON: { "content": "your reply" }`;
}
