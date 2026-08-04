import { z } from "zod";

export const saveAnalysisSchema = z.object({
  accuracy: z.number(),
  acpl: z.number(),
  totalMoves: z.number().int().positive(),
  blunderCount: z.number().int().nonnegative(),
  mistakeCount: z.number().int().nonnegative(),
  inaccuracyCount: z.number().int().nonnegative(),
  brilliantCount: z.number().int().nonnegative(),
  moveAnalysis: z.array(z.unknown()),
  evalGraph: z.array(z.unknown()),
  summary: z.string().optional(),
  keyMoments: z.array(z.unknown()).optional(),
  analysisMode: z.enum(["fast", "standard"]).optional(),
  analysisDepth: z.number().int().positive().optional(),
});

export const importPgnSchema = z.object({
  pgn: z.string().min(1),
});

export const explainMoveSchema = z.object({
  gameId: z.string(),
  fen: z.string(),
  moves: z.array(z.string()),
  moveNumber: z.number().int().positive(),
  san: z.string(),
  evalBefore: z.number(),
  evalAfter: z.number(),
  bestMove: z.string().optional(),
  classification: z.string().optional(),
});

export const gameSummarySchema = z.object({
  gameId: z.string(),
});

export const generateLessonSchema = z.object({
  topic: z
    .enum(["TACTICS", "ENDGAME", "OPENING", "POSITIONAL", "CUSTOM"])
    .optional(),
  weakness: z.string().optional(),
});

export const lessonProgressSchema = z.object({
  currentExercise: z.number().int().nonnegative(),
  exerciseCorrect: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const hintRequestSchema = z.object({
  exerciseIndex: z.number().int().nonnegative(),
  hintLevel: z.number().int().min(1).max(3),
});

export const verifyExerciseSchema = z.object({
  exerciseIndex: z.number().int().nonnegative(),
  uci: z.string().min(4).max(5),
});
