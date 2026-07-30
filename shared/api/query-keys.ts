export const queryKeys = {
  user: {
    profile: ["user", "profile"] as const,
    settings: ["user", "settings"] as const,
  },
  games: {
    list: (filters?: Record<string, string | number | undefined>) =>
      ["games", "list", filters ?? {}] as const,
    detail: (gameId: string) => ["games", "detail", gameId] as const,
  },
  coach: {
    all: ["coach"] as const,
    chat: (sessionId: string) => ["coach", "chat", sessionId] as const,
  },
};
