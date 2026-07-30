import type { PersonalityId } from "@/shared/ai/personalities";

export type PersonalityConfig = {
  id: string;
  name: string;
  description: string;
  mistakeRate: number;
  commentStyle: string;
  skillRange: string;
};

export { PERSONALITY_IDS, type PersonalityId } from "@/shared/ai/personalities";

export type GenerateMoveParams = {
  fen: string;
  moves: string[];
  legalMoves: string[];
  color: "white" | "black";
  personality: PersonalityId;
  eval?: number;
  skillLevel?: number;
};

export type AIMoveResponse = {
  uci: string;
  san?: string;
  comment?: string;
  reasoning?: string;
};

export type ExplainParams = {
  fen: string;
  moves: string[];
  moveNumber: number;
  san: string;
  momentType: string;
  evalBefore: number;
  evalAfter: number;
  bestMove?: string;
  classification?: string;
  skillLevel?: number;
};

export type ExplanationResponse = {
  explanation: string;
  concepts: string[];
  suggestedFollowUp?: string;
};

export type ChatMessageInput = {
  role: "user" | "assistant";
  content: string;
};

export type ChatParams = {
  message: string;
  history: ChatMessageInput[];
  context?: {
    fen?: string | null;
    gameId?: string | null;
    mode?: string;
    skillLevel?: number;
  };
};

export type ChatResponse = {
  content: string;
};

export interface AIProvider {
  generateMove(params: GenerateMoveParams): Promise<AIMoveResponse>;
  explainPosition(params: ExplainParams): Promise<ExplanationResponse>;
  chat(params: ChatParams): Promise<ChatResponse>;
}
