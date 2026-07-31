import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { requireAuth } from "@/server/api/middleware";
import { enforceAIRateLimit } from "@/server/api/rate-limit";
import { apiError, withErrorHandler } from "@/server/api/response";
import { coachChatStreamSchema } from "@/server/api/schemas/coach.schema";
import { buildCoachChatSystemPrompt } from "@/server/ai/prompts/coach-chat-system";
import { isAIConfigured } from "@/server/ai/factory";
import { coachingService } from "@/server/services/coaching.service";
import { getTextFromUIMessage } from "@/features/coaching/utils/chat-messages";

export const maxDuration = 30;

function getModelName(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    process.env.GEMINI_FALLBACK_MODEL?.trim() ||
    "gemini-2.0-flash"
  );
}

function getGoogleModel() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google(getModelName());
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();

    if (!isAIConfigured()) {
      return apiError(
        "SERVICE_UNAVAILABLE",
        "AI coaching is not configured",
        503,
      );
    }

    const rateLimit = enforceAIRateLimit(session.user.id, "chat");
    if (!rateLimit.allowed) {
      return apiError(
        "RATE_LIMITED",
        "Too many chat messages. Please try again later.",
        429,
        { retryAfter: rateLimit.retryAfterSeconds },
      );
    }

    const body = await request.json();
    const parsed = coachChatStreamSchema.parse(body);
    const lastMessage = parsed.messages.at(-1);

    if (!lastMessage || lastMessage.role !== "user") {
      return apiError("BAD_REQUEST", "Last message must be from the user", 400);
    }

    const userText = getTextFromUIMessage(lastMessage as UIMessage);
    if (!userText.trim()) {
      return apiError("BAD_REQUEST", "Message cannot be empty", 400);
    }

    const chatSession = await coachingService.resolveChatSession(
      session.user.id,
      parsed.sessionId,
      parsed.context,
    );

    const existingIds = new Set(
      chatSession.messages.map((msg: { id: string }) => msg.id),
    );
    if (!existingIds.has(lastMessage.id)) {
      await coachingService.persistChatMessage(
        chatSession.id,
        "user",
        userText,
      );
    }

    const system = buildCoachChatSystemPrompt(parsed.context);
    const modelMessages = await convertToModelMessages(
      parsed.messages as UIMessage[],
    );

    const result = streamText({
      model: getGoogleModel(),
      system,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        if (text.trim()) {
          await coachingService.persistChatMessage(
            chatSession.id,
            "assistant",
            text,
          );
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: parsed.messages as UIMessage[],
      }),
      headers: {
        "X-Chat-Session-Id": chatSession.id,
      },
    });
  });
}
