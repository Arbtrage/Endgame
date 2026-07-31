import { z } from "zod";
import { PERSONALITY_IDS } from "@/shared/ai/personalities";

export const aiPersonalitySchema = z.enum(PERSONALITY_IDS);

export const explainMomentSchema = z.object({
  gameId: z.string().min(1),
  fen: z.string().min(1),
  moves: z.array(z.string()),
  moveNumber: z.number().int().positive(),
  san: z.string().min(1),
  momentType: z.enum([
    "blunder",
    "brilliant",
    "opening_exit",
    "endgame_entry",
    "check",
    "material_change",
  ]),
  evalBefore: z.number(),
  evalAfter: z.number(),
  bestMove: z.string().optional(),
  classification: z.string().optional(),
});

export const aiMoveSchema = z.object({
  fen: z.string().min(1),
  moves: z.array(z.string()),
  personality: aiPersonalitySchema,
  eval: z.number().optional(),
});

export const coachChatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().min(1).optional(),
  context: z
    .object({
      fen: z.string().optional(),
      gameId: z.string().min(1).optional(),
      mode: z.string().optional(),
    })
    .optional(),
});

export const chatHistoryQuerySchema = z.object({
  sessionId: z.string().min(1).optional(),
});

export const listChatSessionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const createChatSessionSchema = z.object({
  context: z
    .object({
      fen: z.string().optional(),
      gameId: z.string().min(1).optional(),
      mode: z.string().optional(),
    })
    .optional(),
});

const uiMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

export const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema),
});

export const coachChatStreamSchema = z.object({
  messages: z.array(uiMessageSchema).min(1),
  sessionId: z.string().min(1).optional(),
  context: createChatSessionSchema.shape.context,
  id: z.string().optional(),
});
