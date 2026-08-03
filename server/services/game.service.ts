import { ApiError } from "@/server/api/response";
import { gameRepository } from "@/server/repositories/game.repository";
import type { GameMode, GameResult } from "@prisma/client";
import { resolvePlayerColor } from "@/features/game/types";
import { Prisma } from "@prisma/client";
import {
  getParticipantColor,
  isGameParticipant,
} from "@/server/services/game-participant";
import {
  triggerDrawDeclined,
  triggerDrawOffered,
  triggerChatMessage,
  triggerGameOver,
  triggerMoveMade,
} from "@/server/realtime/pusher";
import { gameMessageRepository } from "@/server/repositories/game-message.repository";

function mapGame(game: NonNullable<Awaited<ReturnType<typeof gameRepository.findById>>>) {
  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    result: game.result,
    resultReason: game.resultReason,
    playerColor: game.playerColor,
    stockfishLevel: game.stockfishLevel,
    aiPersonality: game.aiPersonality,
    moveCount: game.moveCount,
    pgn: game.pgn,
    finalFen: game.finalFen,
    timeControlInitial: game.timeControlInitial,
    timeControlIncrement: game.timeControlIncrement,
    whiteUserId: game.whiteUserId,
    blackUserId: game.blackUserId,
    whitePlayer: game.whiteUser
      ? {
          id: game.whiteUser.id,
          name: game.whiteUser.name,
          email: game.whiteUser.email,
          image: game.whiteUser.image,
        }
      : null,
    blackPlayer: game.blackUser
      ? {
          id: game.blackUser.id,
          name: game.blackUser.name,
          email: game.blackUser.email,
          image: game.blackUser.image,
        }
      : null,
    pendingDrawOfferUserId: game.pendingDrawOfferUserId,
    pendingDrawOfferAt: game.pendingDrawOfferAt?.toISOString() ?? null,
    createdAt: game.createdAt.toISOString(),
    completedAt: game.completedAt?.toISOString() ?? null,
    moves: game.moves.map((move) => ({
      moveNumber: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen: move.fen,
      color: move.color,
    })),
  };
}

function mapSpectatorGame(
  game: NonNullable<
    Awaited<ReturnType<typeof gameRepository.findByIdWithUser>>
  >,
) {
  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    result: game.result,
    resultReason: game.resultReason,
    playerColor: game.playerColor,
    stockfishLevel: game.stockfishLevel,
    aiPersonality: game.aiPersonality,
    moveCount: game.moveCount,
    pgn: game.pgn,
    finalFen: game.finalFen,
    timeControlInitial: game.timeControlInitial,
    timeControlIncrement: game.timeControlIncrement,
    createdAt: game.createdAt.toISOString(),
    completedAt: game.completedAt?.toISOString() ?? null,
    player: {
      id: game.user.id,
      name: game.user.name,
      email: game.user.email,
    },
    moves: game.moves.map((move) => ({
      moveNumber: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen: move.fen,
      color: move.color,
    })),
  };
}

export const gameService = {
  async createGame(
    userId: string,
    input:
      | {
          mode: "COMPUTER";
          color: "white" | "black" | "random";
          stockfishLevel: number;
          timeControl?: { initial: number; increment: number };
        }
      | {
          mode: "AI_OPPONENT";
          color: "white" | "black" | "random";
          aiPersonality: string;
          timeControl?: { initial: number; increment: number };
        }
      | {
          mode: "COACH";
          color: "white" | "black" | "random";
          stockfishLevel: number;
          timeControl?: { initial: number; increment: number };
        },
  ) {
    const playerColor = resolvePlayerColor(input.color);

    const game = await gameRepository.create({
      userId,
      mode: input.mode as GameMode,
      playerColor,
      stockfishLevel:
        input.mode === "AI_OPPONENT" ? null : input.stockfishLevel,
      aiPersonality:
        input.mode === "AI_OPPONENT" ? input.aiPersonality : null,
      timeControlInitial: input.timeControl?.initial ?? null,
      timeControlIncrement: input.timeControl?.increment ?? null,
    });

    return {
      id: game.id,
      mode: game.mode,
      status: game.status,
      playerColor: game.playerColor,
      stockfishLevel: game.stockfishLevel,
      aiPersonality: game.aiPersonality,
      timeControlInitial: game.timeControlInitial,
      timeControlIncrement: game.timeControlIncrement,
      createdAt: game.createdAt.toISOString(),
    };
  },

  async listGames(
    userId: string,
    filters: {
      mode?: GameMode;
      status?: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
      page: number;
      pageSize: number;
    },
  ) {
    const [games, total] = await gameRepository.findByUser(userId, filters);

    return {
      data: games.map((game) => ({
        id: game.id,
        mode: game.mode,
        status: game.status,
        result: game.result,
        resultReason: game.resultReason,
        playerColor:
          game.mode === "PVP"
            ? game.whiteUserId === userId
              ? "white"
              : game.blackUserId === userId
                ? "black"
                : game.playerColor
            : game.playerColor,
        stockfishLevel: game.stockfishLevel,
        aiPersonality: game.aiPersonality,
        moveCount: game.moveCount,
        createdAt: game.createdAt.toISOString(),
        completedAt: game.completedAt?.toISOString() ?? null,
      })),
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
      },
    };
  },

  async getGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    return mapGame(game);
  },

  async getGameForSpectator(gameId: string) {
    const game = await gameRepository.findByIdWithUser(gameId);
    if (!game) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    return mapSpectatorGame(game);
  },

  async recordMove(
    userId: string,
    gameId: string,
    input: { san: string; uci: string; fen: string },
  ) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const moveNumber = game.moveCount + 1;
    const color = moveNumber % 2 === 1 ? "white" : "black";

    if (game.mode === "PVP") {
      const playerColor = getParticipantColor(game, userId);
      if (!playerColor || playerColor !== color) {
        throw new ApiError("CONFLICT", "Not your turn", 409);
      }
    }

    const existing = game.moves.find((move) => move.moveNumber === moveNumber);
    if (existing) {
      if (existing.uci === input.uci && existing.fen === input.fen) {
        return { moveNumber, san: existing.san, valid: true };
      }
      throw new ApiError(
        "CONFLICT",
        "A different move is already recorded for this ply",
        409,
      );
    }

    try {
      await gameRepository.addMove({
        gameId,
        moveNumber,
        san: input.san,
        uci: input.uci,
        fen: input.fen,
        color,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const duplicate = await gameRepository.findMoveByNumber(
          gameId,
          moveNumber,
        );
        if (
          duplicate &&
          duplicate.uci === input.uci &&
          duplicate.fen === input.fen
        ) {
          return { moveNumber, san: duplicate.san, valid: true };
        }
      }
      throw error;
    }

    if (game.mode === "PVP") {
      await triggerMoveMade(gameId, {
        moveNumber,
        san: input.san,
        uci: input.uci,
        fen: input.fen,
        color,
      });
    }

    return { moveNumber, san: input.san, valid: true };
  },

  async completeGame(
    userId: string,
    gameId: string,
    input: {
      result: GameResult;
      resultReason: string;
      pgn: string;
      finalFen: string;
    },
  ) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const updated = await gameRepository.complete(gameId, {
      ...input,
      moveCount: game.moveCount,
    });

    if (game.mode === "PVP") {
      await triggerGameOver(gameId, {
        result: input.result,
        resultReason: input.resultReason,
        finalFen: input.finalFen,
      });
    }

    return mapGame({ ...updated, moves: game.moves, whiteUser: game.whiteUser, blackUser: game.blackUser });
  },

  async resignGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    let result: GameResult;
    if (game.mode === "PVP") {
      const resigningColor = getParticipantColor(game, userId);
      if (!resigningColor) {
        throw new ApiError("CONFLICT", "Invalid participant", 409);
      }
      result = resigningColor === "white" ? "BLACK_WIN" : "WHITE_WIN";
    } else {
      result =
        game.playerColor === "white" ? "BLACK_WIN" : "WHITE_WIN";
    }

    const updated = await gameRepository.resign(gameId, {
      result,
      resultReason: "resignation",
    });

    if (game.mode === "PVP") {
      await triggerGameOver(gameId, {
        result,
        resultReason: "resignation",
        finalFen: game.finalFen,
      });
    }

    return mapGame({ ...updated, moves: game.moves, whiteUser: game.whiteUser, blackUser: game.blackUser });
  },

  async offerDraw(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "PVP" || game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Draw offers are only available in live PvP games", 409);
    }

    if (game.pendingDrawOfferUserId === userId) {
      throw new ApiError("CONFLICT", "You already offered a draw", 409);
    }

    const offerer =
      game.whiteUserId === userId ? game.whiteUser : game.blackUser;
    await gameRepository.setDrawOffer(gameId, userId);

    await triggerDrawOffered(gameId, {
      offeredByUserId: userId,
      offeredByName: offerer?.name ?? offerer?.email ?? null,
    });

    return { offered: true };
  },

  async acceptDraw(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "PVP" || game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }
    if (!game.pendingDrawOfferUserId) {
      throw new ApiError("CONFLICT", "No pending draw offer", 409);
    }
    if (game.pendingDrawOfferUserId === userId) {
      throw new ApiError("CONFLICT", "You cannot accept your own draw offer", 409);
    }

    const updated = await gameRepository.complete(gameId, {
      result: "DRAW",
      resultReason: "agreement",
      pgn: game.pgn ?? "",
      finalFen: game.finalFen ?? game.moves.at(-1)?.fen ?? "",
      moveCount: game.moveCount,
    });

    await triggerGameOver(gameId, {
      result: "DRAW",
      resultReason: "agreement",
      finalFen: updated.finalFen,
    });

    return mapGame({ ...updated, moves: game.moves, whiteUser: game.whiteUser, blackUser: game.blackUser });
  },

  async declineDraw(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "PVP" || game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }
    if (!game.pendingDrawOfferUserId) {
      throw new ApiError("CONFLICT", "No pending draw offer", 409);
    }
    if (game.pendingDrawOfferUserId === userId) {
      throw new ApiError("CONFLICT", "You cannot decline your own draw offer", 409);
    }

    await gameRepository.clearDrawOffer(gameId);
    await triggerDrawDeclined(gameId, { declinedByUserId: userId });

    return { declined: true };
  },

  async listMessages(userId: string, gameId: string, limit = 100) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "PVP") {
      throw new ApiError("CONFLICT", "Chat is only available in PvP games", 409);
    }

    const messages = await gameMessageRepository.listByGame(gameId, limit);
    return messages.map((message) => ({
      id: message.id,
      userId: message.userId,
      userName: message.user.name ?? message.user.email,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    }));
  },

  async sendMessage(userId: string, gameId: string, content: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.mode !== "PVP") {
      throw new ApiError("CONFLICT", "Chat is only available in PvP games", 409);
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw new ApiError("BAD_REQUEST", "Message cannot be empty", 400);
    }
    if (trimmed.length > 500) {
      throw new ApiError("BAD_REQUEST", "Message is too long", 400);
    }

    const message = await gameMessageRepository.create({
      gameId,
      userId,
      content: trimmed,
    });

    const payload = {
      id: message.id,
      userId: message.userId,
      userName: message.user.name ?? message.user.email,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };

    await triggerChatMessage(gameId, payload);
    return payload;
  },

  async deleteGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    await gameRepository.delete(gameId);
    return { deleted: true };
  },

  async canAccessPusherChannel(userId: string, gameId: string): Promise<boolean> {
    const game = await gameRepository.findById(gameId);
    if (!game || game.mode !== "PVP") return false;
    return isGameParticipant(game, userId);
  },
};
