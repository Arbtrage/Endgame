type CoachChatContext = {
  fen?: string;
  gameId?: string;
  mode?: string;
  skillLevel?: number;
};

export function buildCoachChatSystemPrompt(context?: CoachChatContext): string {
  const contextLines: string[] = [];
  if (context?.skillLevel) {
    contextLines.push(`User skill estimate: ${context.skillLevel}`);
  }
  if (context?.fen) {
    contextLines.push(`Current position FEN: ${context.fen}`);
  }
  if (context?.mode) {
    contextLines.push(`Context mode: ${context.mode}`);
  }
  if (context?.gameId) {
    contextLines.push(`Active game: ${context.gameId}`);
  }

  return `You are Endgame Coach — a friendly, expert chess coach. Answer clearly and concisely.
Use Markdown for formatting: **bold** for key ideas, bullet lists for steps, and \`inline code\` for moves or squares when helpful. Do not wrap replies in JSON.
${contextLines.length ? `\nContext:\n${contextLines.join("\n")}` : ""}`.trim();
}
