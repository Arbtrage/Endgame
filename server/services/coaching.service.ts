import { ApiError } from "@/server/api/response";
import { getAIProvider, isAIConfigured } from "@/server/ai/factory";
import { GeminiProvider } from "@/server/ai/gemini.provider";
import {
  getLegalMoves,
  pickRandomLegalMove,
  validateUciMove,
} from "@/server/ai/move-validator";
import { parseGeminiResponse } from "@/server/ai/parser";
import { buildGameSummaryPrompt } from "@/server/ai/prompts/game-summary";
import type { PersonalityId } from "@/server/ai/types";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { chatRepository } from "@/server/repositories/chat.repository";
import { coachMomentRepository } from "@/server/repositories/coach-moment.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import { z } from "zod";

const gameSummaryResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  studyTip: z.string(),
});

function ensureAIConfigured() {
  if (!isAIConfigured()) {
    throw new ApiError(
      "SERVICE_UNAVAILABLE",
      "AI coaching is not configured",
      503,
    );
  }
}

export const coachingService = {
  async requestAiMove(
    userId: string,
    gameId: string,
    input: {
      fen: string;
      moves: string[];
      personality: PersonalityId;
      eval?: number;
    },
  ) {
    ensureAIConfigured();

    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "AI_OPPONENT") {
      throw new ApiError("CONFLICT", "Game is not an AI opponent game", 409);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const legalMoves = getLegalMoves(input.fen, input.moves);
    if (legalMoves.length === 0) {
      throw new ApiError("CONFLICT", "No legal moves available", 409);
    }

    const opponentColor =
      game.playerColor === "white" ? "black" : "white";

    const provider = getAIProvider();
    let response;
    try {
      response = await provider.generateMove({
        fen: input.fen,
        moves: input.moves,
        legalMoves,
        color: opponentColor,
        personality: input.personality,
        eval: input.eval,
      });
    } catch {
      const fallbackUci = pickRandomLegalMove(input.fen, input.moves);
      const validated = validateUciMove(input.fen, input.moves, fallbackUci);
      return {
        uci: fallbackUci,
        san: validated.san,
        comment: undefined,
      };
    }

    let validated = validateUciMove(input.fen, input.moves, response.uci);
    if (!validated.valid) {
      const fallbackUci = pickRandomLegalMove(input.fen, input.moves);
      validated = validateUciMove(input.fen, input.moves, fallbackUci);
      return {
        uci: fallbackUci,
        san: validated.san,
        comment: response.comment,
      };
    }

    return {
      uci: validated.uci!,
      san: validated.san,
      comment: response.comment,
    };
  },

  async explainMoment(
    userId: string,
    input: {
      gameId: string;
      fen: string;
      moves: string[];
      moveNumber: number;
      san: string;
      momentType: string;
      evalBefore: number;
      evalAfter: number;
      bestMove?: string;
      classification?: string;
    },
  ) {
    ensureAIConfigured();

    const game = await gameRepository.findById(input.gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }

    const provider = getAIProvider();
    const result = await provider.explainPosition({
      fen: input.fen,
      moves: input.moves,
      moveNumber: input.moveNumber,
      san: input.san,
      momentType: input.momentType,
      evalBefore: input.evalBefore,
      evalAfter: input.evalAfter,
      bestMove: input.bestMove,
      classification: input.classification,
    });

    await coachMomentRepository.create({
      gameId: input.gameId,
      moveNumber: input.moveNumber,
      momentType: input.momentType,
      evalBefore: input.evalBefore,
      evalAfter: input.evalAfter,
      explanation: result.explanation,
    });

    return result;
  },

  async explainMove(
    userId: string,
    input: {
      gameId: string;
      fen: string;
      moves: string[];
      moveNumber: number;
      san: string;
      evalBefore: number;
      evalAfter: number;
      bestMove?: string;
      classification?: string;
    },
  ) {
    return this.explainMoment(userId, {
      ...input,
      momentType: input.classification ?? "move",
    });
  },

  async generateGameSummary(userId: string, gameId: string) {
    ensureAIConfigured();

    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }

    const analysis = await analysisRepository.findByGameId(gameId);
    if (!analysis) {
      throw new ApiError("NOT_FOUND", "Analysis not found", 404);
    }

    if (analysis.summary) {
      return {
        summary: analysis.summary,
        cached: true,
      };
    }

    const moves = analysis.moveAnalysis as Array<{
      moveNumber: number;
      san: string;
      classification: string;
      isUserMove: boolean;
    }>;

    const keyMoments = moves
      .filter(
        (m) =>
          m.isUserMove &&
          ["blunder", "mistake", "brilliant"].includes(m.classification),
      )
      .slice(0, 5);

    const provider = getAIProvider() as GeminiProvider;
    const prompt = buildGameSummaryPrompt({
      pgn: game.pgn ?? "",
      accuracy: analysis.accuracy,
      acpl: analysis.acpl,
      blunderCount: analysis.blunderCount,
      mistakeCount: analysis.mistakeCount,
      brilliantCount: analysis.brilliantCount,
      playerColor: game.playerColor,
      result: game.result,
      keyMoments,
    });

    const raw = await provider.generateText(prompt, 0.4);
    const parsed = parseGeminiResponse(raw, gameSummaryResponseSchema);

    await analysisRepository.updateSummary(gameId, parsed.summary);

    return {
      ...parsed,
      cached: false,
    };
  },

  async listChatSessions(
    userId: string,
    filters: { page: number; pageSize: number },
  ) {
    const [sessions, total] = await chatRepository.listSessions(
      userId,
      filters,
    );

    return {
      data: sessions
        .filter((session) => session._count.messages > 0)
        .map((session) => {
        const preview = session.messages[0]?.content ?? "";
        return {
          id: session.id,
          preview:
            preview.length > 72 ? `${preview.slice(0, 72).trim()}…` : preview,
          messageCount: session._count.messages,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };
      }),
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
      },
    };
  },

  async createChatSession(
    userId: string,
    context?: {
      fen?: string;
      gameId?: string;
      mode?: string;
    },
  ) {
    const session = await chatRepository.createSession(userId, context);
    return { sessionId: session.id };
  },

  async resolveChatSession(
    userId: string,
    sessionId?: string,
    context?: {
      fen?: string;
      gameId?: string;
      mode?: string;
    },
  ) {
    if (sessionId) {
      const session = await chatRepository.findSession(sessionId, userId);
      if (!session) {
        throw new ApiError("NOT_FOUND", "Chat session not found", 404);
      }
      if (context) {
        await chatRepository.updateSessionContext(session.id, context);
      }
      return session;
    }

    const created = await chatRepository.createSession(userId, context);
    return { ...created, messages: [] };
  },

  async persistChatMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
  ) {
    await chatRepository.addMessage({
      sessionId,
      role,
      content,
    });
  },

  async getChatHistory(userId: string, sessionId?: string) {
    const session = sessionId
      ? await chatRepository.findSession(sessionId, userId)
      : await chatRepository.findLatestSession(userId);

    if (!session) {
      return { sessionId: null, messages: [] };
    }

    return {
      sessionId: session.id,
      messages: session.messages.map((msg: { id: string; role: string; content: string; createdAt: Date }) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
    };
  },
};
