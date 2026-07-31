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
  gameplay: {
    detail: (gameId: string) => ["gameplay", "detail", gameId] as const,
  },
  pvp: {
    invites: ["pvp", "invites"] as const,
    messages: (gameId: string) => ["pvp", "messages", gameId] as const,
  },
  users: {
    search: (q: string) => ["users", "search", q] as const,
  },
  coach: {
    all: ["coach"] as const,
    sessions: (filters?: Record<string, string | number | undefined>) =>
      ["coach", "sessions", filters ?? {}] as const,
    chat: (sessionId: string) => ["coach", "chat", sessionId] as const,
  },
  analysis: {
    detail: (gameId: string) => ["analysis", "detail", gameId] as const,
    list: ["analysis", "list"] as const,
  },
  training: {
    recommendations: ["training", "recommendations"] as const,
    lessons: (topic?: string) => ["training", "lessons", topic ?? "all"] as const,
    lesson: (lessonId: string) => ["training", "lesson", lessonId] as const,
    studyPlan: ["training", "studyPlan"] as const,
  },
  progress: {
    overview: ["progress", "overview"] as const,
    weeklyReport: ["progress", "weeklyReport"] as const,
  },
};
