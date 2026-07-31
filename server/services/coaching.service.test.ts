import { beforeEach, describe, expect, it, vi } from "vitest";
import { coachingService } from "@/server/services/coaching.service";
import { gameRepository } from "@/server/repositories/game.repository";
import { chatRepository } from "@/server/repositories/chat.repository";

vi.mock("@/server/repositories/game.repository", () => ({
  gameRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@/server/repositories/coach-moment.repository", () => ({
  coachMomentRepository: {
    create: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/server/repositories/chat.repository", () => ({
  chatRepository: {
    findSession: vi.fn(),
    findLatestSession: vi.fn(),
    createSession: vi.fn(),
    addMessage: vi.fn(),
    updateSessionContext: vi.fn(),
    listSessions: vi.fn(),
  },
}));

const mockGenerateMove = vi.fn();
const mockExplain = vi.fn();
const mockChat = vi.fn();

vi.mock("@/server/ai/factory", () => ({
  isAIConfigured: vi.fn(() => true),
  getAIProvider: vi.fn(() => ({
    generateMove: mockGenerateMove,
    explainPosition: mockExplain,
    chat: mockChat,
  })),
}));

describe("coachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
  });

  it("requestAiMove validates and returns legal move", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-1",
      mode: "AI_OPPONENT",
      status: "IN_PROGRESS",
      playerColor: "white",
      moves: [],
    } as never);

    mockGenerateMove.mockResolvedValue({
      uci: "e7e5",
      comment: "Solid!",
    });

    const result = await coachingService.requestAiMove("user-1", "game-1", {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: ["e4"],
      personality: "intermediate",
    });

    expect(result.uci).toBe("e7e5");
    expect(result.san).toBe("e5");
  });

  it("returns 503 when AI not configured", async () => {
    const { isAIConfigured } = await import("@/server/ai/factory");
    vi.mocked(isAIConfigured).mockReturnValue(false);

    await expect(
      coachingService.requestAiMove("user-1", "game-1", {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: [],
        personality: "intermediate",
      }),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  it("lists chat sessions with preview metadata", async () => {
    vi.mocked(chatRepository.listSessions).mockResolvedValue([
      [
        {
          id: "session-1",
          createdAt: new Date("2026-01-01T12:00:00Z"),
          updatedAt: new Date("2026-01-02T12:00:00Z"),
          messages: [{ content: "Explain the Italian Game in simple terms" }],
          _count: { messages: 4 },
        },
      ],
      1,
    ] as never);

    const result = await coachingService.listChatSessions("user-1", {
      page: 1,
      pageSize: 20,
    });

    expect(result.data[0]?.preview).toContain("Italian Game");
    expect(result.meta.total).toBe(1);
  });

  it("creates empty chat sessions", async () => {
    vi.mocked(chatRepository.createSession).mockResolvedValue({
      id: "session-new",
    } as never);

    const result = await coachingService.createChatSession("user-1");
    expect(result.sessionId).toBe("session-new");
  });

  it("resolves an existing chat session by id", async () => {
    vi.mocked(chatRepository.findSession).mockResolvedValue({
      id: "session-1",
      messages: [],
    } as never);

    const result = await coachingService.resolveChatSession(
      "user-1",
      "session-1",
    );

    expect(result.id).toBe("session-1");
  });
});
