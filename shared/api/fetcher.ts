async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message ?? "Request failed");
  }

  return body.data as T;
}

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  skillEstimate: number | null;
  onboardingComplete: boolean;
  createdAt: string;
};

export type UserSettings = {
  id: string;
  userId: string;
  boardTheme: string;
  pieceSet: string;
  soundEnabled: boolean;
  defaultStockfishLevel: number;
  defaultAiPersonality: string;
  coachAutoExplain: boolean;
};

export function getProfile() {
  return fetchJson<UserProfile>("/api/user/profile");
}

export function updateProfile(name: string) {
  return fetchJson<UserProfile>("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function getSettings() {
  return fetchJson<UserSettings>("/api/user/settings");
}

export function updateSettings(data: Partial<UserSettings>) {
  return fetchJson<UserSettings>("/api/user/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function completeOnboarding(data: {
  skillEstimate?: number;
  onboardingComplete?: boolean;
}) {
  return fetchJson<UserProfile>("/api/user/onboarding", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export type GameSummary = {
  id: string;
  mode: string;
  status: string;
  result: string | null;
  resultReason: string | null;
  playerColor: string;
  stockfishLevel: number | null;
  aiPersonality: string | null;
  moveCount: number;
  createdAt: string;
  completedAt: string | null;
};

export type GameMove = {
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  color: string;
};

export type GameDetail = GameSummary & {
  pgn: string | null;
  finalFen: string | null;
  timeControlInitial: number | null;
  timeControlIncrement: number | null;
  moves: GameMove[];
};

export type CreateGameInput =
  | {
      mode: "COMPUTER";
      color: "white" | "black" | "random";
      stockfishLevel: number;
      timeControl?: { initial: number; increment: number };
    }
  | {
      mode: "AI_OPPONENT";
      color: "white" | "black" | "random";
      aiPersonality: string;
      timeControl?: { initial: number; increment: number };
    }
  | {
      mode: "COACH";
      color: "white" | "black" | "random";
      stockfishLevel: number;
      timeControl?: { initial: number; increment: number };
    };

export async function listGames(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  const query = search.toString();
  const response = await fetch(`/api/games${query ? `?${query}` : ""}`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message ?? "Request failed");
  }
  return body.data as GameSummary[];
}

export function createGame(input: CreateGameInput) {
  return fetchJson<GameSummary>("/api/games", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getGame(gameId: string) {
  return fetchJson<GameDetail>(`/api/games/${gameId}`);
}

export function recordMove(
  gameId: string,
  move: { san: string; uci: string; fen: string },
) {
  return fetchJson<{ moveNumber: number; san: string; valid: boolean }>(
    `/api/games/${gameId}/moves`,
    {
      method: "POST",
      body: JSON.stringify(move),
    },
  );
}

export function completeGame(
  gameId: string,
  data: {
    result: string;
    resultReason: string;
    pgn: string;
    finalFen: string;
  },
) {
  return fetchJson<GameDetail>(`/api/games/${gameId}/complete`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resignGame(gameId: string) {
  return fetchJson<GameDetail>(`/api/games/${gameId}/resign`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function requestAiMove(
  gameId: string,
  data: {
    fen: string;
    moves: string[];
    personality: string;
    eval?: number;
  },
) {
  return fetchJson<{ uci: string; san?: string; comment?: string }>(
    `/api/games/${gameId}/ai-move`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function explainMoment(data: {
  gameId: string;
  fen: string;
  moves: string[];
  moveNumber: number;
  san: string;
  momentType: string;
  evalBefore: number;
  evalAfter: number;
  bestMove?: string;
  classification?: string;
}) {
  return fetchJson<{
    explanation: string;
    concepts: string[];
    suggestedFollowUp?: string;
  }>("/api/coach/explain-moment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function sendCoachChat(data: {
  message: string;
  sessionId?: string;
  context?: {
    fen?: string;
    gameId?: string;
    mode?: string;
  };
}) {
  return fetchJson<{ sessionId: string; content: string }>("/api/coach/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCoachChatHistory(sessionId?: string) {
  const query = sessionId ? `?sessionId=${sessionId}` : "";
  return fetchJson<{
    sessionId: string | null;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  }>(`/api/coach/chat/history${query}`);
}
