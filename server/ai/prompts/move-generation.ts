import type { GenerateMoveParams } from "../types";
import { getPersonality } from "./personalities";

const GLOBAL_SYSTEM = `You are an expert chess coach and player. You provide accurate, helpful chess guidance.
CRITICAL RULES:
1. NEVER invent evaluation numbers. Reference provided engine data only.
2. ALWAYS respond in valid JSON matching the requested schema.
3. When selecting moves, ONLY choose from the provided legal moves list.
4. Use Standard Algebraic Notation (SAN) for moves in text when relevant.
5. Be encouraging but honest about mistakes.`;

export function buildMoveGenerationPrompt(params: GenerateMoveParams): string {
  const personality = getPersonality(params.personality);
  const evalText =
    params.eval !== undefined
      ? `${params.eval} centipawns`
      : "not provided";

  return `${GLOBAL_SYSTEM}

PERSONALITY: ${personality.name} — ${personality.description}
Comment style: ${personality.commentStyle}
Mistake rate hint: ${(personality.mistakeRate * 100).toFixed(0)}% suboptimal moves acceptable

You are playing as ${params.color}.
Current position (FEN): ${params.fen}
Move history (SAN): ${params.moves.join(", ") || "none"}
Legal moves (UCI): ${params.legalMoves.join(", ")}
Engine evaluation: ${evalText}

Select a move matching your personality. Respond ONLY with JSON:
{
  "uci": "e2e4",
  "reasoning": "internal reasoning",
  "comment": "optional in-character comment"
}`;
}

export function buildIllegalMoveRetryPrompt(
  illegalUci: string,
  legalMoves: string[],
): string {
  return `Move ${illegalUci} is illegal. Choose ONLY from these legal UCI moves: ${legalMoves.join(", ")}. Respond with JSON: { "uci": "...", "comment": "..." }`;
}
