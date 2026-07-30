export type { PersonalityId } from "@/server/ai/types";
export type { MomentType, KeyMoment } from "@/shared/engine/key-moments";

export type CoachExplanation = {
  id: string;
  momentType: string;
  moveNumber: number;
  san: string;
  explanation: string;
  concepts: string[];
  suggestedFollowUp?: string;
  evalBefore: number;
  evalAfter: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};
