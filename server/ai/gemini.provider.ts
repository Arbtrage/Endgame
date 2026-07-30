import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AIProvider,
  ChatParams,
  ChatResponse,
  ExplainParams,
  ExplanationResponse,
  GenerateMoveParams,
  AIMoveResponse,
} from "./types";
import {
  chatResponseSchema,
  explanationResponseSchema,
  moveResponseSchema,
  parseGeminiResponse,
} from "./parser";
import {
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  resolveGeminiModel,
  type AllowedGeminiModel,
} from "./models";
import { buildMoveGenerationPrompt, buildIllegalMoveRetryPrompt } from "./prompts/move-generation";
import { buildExplainMomentPrompt } from "./prompts/explain-moment";
import { buildCoachChatPrompt } from "./prompts/coach-chat";

const TIMEOUT_MS = 15_000;

type GeminiConfig = {
  temperature: number;
  maxRetries: number;
  allowFallback?: boolean;
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Gemini request timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private primaryModel: AllowedGeminiModel;
  private fallbackModel: AllowedGeminiModel;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.primaryModel = resolveGeminiModel(process.env.GEMINI_MODEL);
    this.fallbackModel = resolveGeminiModel(
      process.env.GEMINI_FALLBACK_MODEL,
      FALLBACK_GEMINI_MODEL,
    );
  }

  private async generateWithModel(
    modelName: AllowedGeminiModel,
    prompt: string,
    config: GeminiConfig,
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: config.temperature },
    });
    const result = await withTimeout(model.generateContent(prompt), TIMEOUT_MS);
    const text = result.response.text();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    return text;
  }

  private async generate(
    prompt: string,
    config: GeminiConfig,
  ): Promise<string> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      const modelName =
        attempt > 0 && config.allowFallback ? this.fallbackModel : this.primaryModel;

      try {
        return await this.generateWithModel(modelName, prompt, config);
      } catch (error) {
        lastError = error;
        const isRetryable =
          error instanceof Error &&
          (error.message.includes("timed out") ||
            error.message.includes("503") ||
            error.message.includes("500"));
        if (!isRetryable || attempt === config.maxRetries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async generateMove(params: GenerateMoveParams): Promise<AIMoveResponse> {
    const prompt = buildMoveGenerationPrompt(params);
    const raw = await this.generate(prompt, {
      temperature: 0.7,
      maxRetries: 1,
      allowFallback: true,
    });
    const parsed = parseGeminiResponse(raw, moveResponseSchema);

    if (!params.legalMoves.includes(parsed.uci)) {
      const retryPrompt = buildIllegalMoveRetryPrompt(parsed.uci, params.legalMoves);
      const retryRaw = await this.generate(retryPrompt, {
        temperature: 0.5,
        maxRetries: 0,
        allowFallback: true,
      });
      const retryParsed = parseGeminiResponse(retryRaw, moveResponseSchema);
      if (params.legalMoves.includes(retryParsed.uci)) {
        return retryParsed;
      }
      const fallback = params.legalMoves[0];
      return { uci: fallback, comment: parsed.comment };
    }

    return parsed;
  }

  async explainPosition(params: ExplainParams): Promise<ExplanationResponse> {
    const prompt = buildExplainMomentPrompt(params);
    const raw = await this.generate(prompt, {
      temperature: 0.3,
      maxRetries: 1,
      allowFallback: true,
    });
    return parseGeminiResponse(raw, explanationResponseSchema);
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const prompt = buildCoachChatPrompt(params);
    const raw = await this.generate(prompt, {
      temperature: 0.5,
      maxRetries: 1,
      allowFallback: true,
    });
    return parseGeminiResponse(raw, chatResponseSchema);
  }
}
