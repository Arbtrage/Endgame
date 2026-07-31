import { z } from "zod";

const timeControlSchema = z
  .object({
    initial: z.number().int().min(0),
    increment: z.number().int().min(0),
  })
  .optional();

export const createPvpInviteSchema = z.object({
  inviteeId: z.string().min(1),
  inviterColor: z.enum(["white", "black", "random"]),
  timeControl: timeControlSchema,
});

export const userSearchSchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const sendGameMessageSchema = z.object({
  content: z.string().trim().min(1).max(500),
});
