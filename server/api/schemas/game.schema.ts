import { z } from "zod";
import { aiPersonalitySchema } from "@/server/api/schemas/coach.schema";

const timeControlSchema = z
  .object({
    initial: z.number().int().min(0),
    increment: z.number().int().min(0),
  })
  .optional();

const baseGameSchema = z.object({
  color: z.enum(["white", "black", "random"]),
  timeControl: timeControlSchema,
});

export const createGameSchema = z.discriminatedUnion("mode", [
  baseGameSchema.extend({
    mode: z.literal("COMPUTER"),
    stockfishLevel: z.number().int().min(1).max(20),
  }),
  baseGameSchema.extend({
    mode: z.literal("AI_OPPONENT"),
    aiPersonality: aiPersonalitySchema,
  }),
  baseGameSchema.extend({
    mode: z.literal("COACH"),
    stockfishLevel: z.number().int().min(1).max(20),
  }),
]);

export const listGamesSchema = z.object({
  mode: z.enum(["COMPUTER", "AI_OPPONENT", "COACH", "PVP"]).optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABANDONED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const recordMoveSchema = z.object({
  san: z.string().min(1),
  uci: z.string().min(4).max(5),
  fen: z.string().min(1),
});

export const completeGameSchema = z.object({
  result: z.enum(["WHITE_WIN", "BLACK_WIN", "DRAW", "ABANDONED"]),
  resultReason: z.string().min(1),
  pgn: z.string().min(1),
  finalFen: z.string().min(1),
});

export const resignGameSchema = z.object({
  resultReason: z.literal("resignation").default("resignation"),
});
