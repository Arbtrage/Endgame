import type { ExplainParams } from "../types";

const GLOBAL_SYSTEM = `You are an expert chess coach. Explain positions clearly in plain language.
CRITICAL: NEVER invent evaluation numbers. Use only the provided engine data.
Respond in valid JSON only.`;

export function buildExplainMomentPrompt(params: ExplainParams): string {
  return `${GLOBAL_SYSTEM}

The user just played move ${params.moveNumber}: ${params.san}
Moment type: ${params.momentType}
Engine evaluation before: ${params.evalBefore} cp
Engine evaluation after: ${params.evalAfter} cp
${params.bestMove ? `Best move was: ${params.bestMove}` : ""}
${params.classification ? `Classification: ${params.classification}` : ""}
Position (FEN): ${params.fen}
Recent moves: ${params.moves.slice(-10).join(", ")}

Explain what happened and why it matters in 2-3 sentences. Reference the engine evaluation.

Respond with JSON:
{
  "explanation": "...",
  "concepts": ["concept1", "concept2"],
  "suggestedFollowUp": "optional question"
}`;
}
