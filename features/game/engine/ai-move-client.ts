import { requestAiMove } from "@/shared/api/fetcher";
import { getPersonality } from "@/features/coaching/types/personalities";
import { requestEngineBestMove } from "@/shared/engine/request-engine-move";

const AI_MOVE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("AI move request timed out")),
      ms,
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

type AiMoveResult = {
  uci: string;
  comment?: string;
};

export async function requestAiMoveWithFallback(input: {
  gameId: string;
  fen: string;
  moves: string[];
  personality: string;
  skillLevel?: number;
}): Promise<AiMoveResult> {
  try {
    const response = await withTimeout(
      requestAiMove(input.gameId, {
        fen: input.fen,
        moves: input.moves,
        personality: input.personality as never,
      }),
      AI_MOVE_TIMEOUT_MS,
    );
    return { uci: response.uci, comment: response.comment };
  } catch {
    const personality = getPersonality(input.personality);
    const skill = input.skillLevel ?? 5;
    const engineSkill = Math.max(
      1,
      Math.min(20, Math.round(skill * (1 - personality.mistakeRate * 0.5))),
    );
    const best = await requestEngineBestMove(input.fen, [], engineSkill, {
      fast: true,
    });
    return { uci: best.uci };
  }
}
