export function buildHintGenerationPrompt(params: {
  fen: string;
  objective: string;
  hintLevel: number;
  previousHints: string[];
}): string {
  return `You are a chess coach giving a progressive hint.
Position (FEN): ${params.fen}
Objective: ${params.objective}
Hint level: ${params.hintLevel} of 3
${params.previousHints.length ? `Previous hints: ${params.previousHints.join(" | ")}` : ""}

Give hint level ${params.hintLevel}. Level 1 is subtle, level 2 more direct, level 3 nearly reveals the move.
Do NOT give the exact move at levels 1-2.

Respond with JSON only:
{ "hint": "your hint text" }`;
}
