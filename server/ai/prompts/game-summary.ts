export type GameSummaryParams = {
  pgn: string;
  accuracy: number;
  acpl: number;
  blunderCount: number;
  mistakeCount: number;
  brilliantCount: number;
  playerColor: string;
  result: string | null;
  keyMoments?: Array<{
    moveNumber: number;
    classification: string;
    san: string;
  }>;
};

export function buildGameSummaryPrompt(params: GameSummaryParams): string {
  const moments = params.keyMoments?.length
    ? params.keyMoments
        .map((m) => `Move ${m.moveNumber} (${m.san}): ${m.classification}`)
        .join("\n")
    : "None highlighted";

  return `You are an expert chess coach summarizing a completed game for the player.
Player color: ${params.playerColor}
Result: ${params.result ?? "unknown"}
Accuracy: ${params.accuracy}%
ACPL: ${params.acpl}
Blunders: ${params.blunderCount}, Mistakes: ${params.mistakeCount}, Brilliant moves: ${params.brilliantCount}

Key moments:
${moments}

Write a 3-4 sentence narrative summary highlighting what went well, what to improve, and one concrete study tip.
Use only the stats provided — do not invent evaluation numbers.

Respond with JSON only:
{
  "summary": "narrative text",
  "strengths": ["strength1"],
  "improvements": ["area1"],
  "studyTip": "one actionable tip"
}`;
}
