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
  whiteUserId?: string | null;
  blackUserId?: string | null;
  whitePlayer?: UserSearchResult | null;
  blackPlayer?: UserSearchResult | null;
  pendingDrawOfferUserId?: string | null;
  pendingDrawOfferAt?: string | null;
  moves: GameMove[];
};

export type GameChatMessage = {
  id: string;
  userId: string;
  userName: string | null;
  content: string;
  createdAt: string;
};

export type UserSearchResult = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type PvpInvite = {
  id: string;
  token: string;
  status: string;
  inviterColor: string;
  timeControlInitial: number | null;
  timeControlIncrement: number | null;
  gameId: string | null;
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
  inviter: UserSearchResult;
  invitee: UserSearchResult;
};

export type PvpInviteList = {
  incoming: PvpInvite[];
  outgoing: PvpInvite[];
};

export type SpectatorGame = GameDetail & {
  player: {
    id: string;
    name: string | null;
    email: string;
  };
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
  mode?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params?.mode) search.set("mode", params.mode);
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

export function getGameplayGame(gameId: string) {
  return fetchJson<SpectatorGame>(`/api/gameplay/${gameId}`);
}

export function searchUsers(q: string, limit = 10) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return fetchJson<UserSearchResult[]>(`/api/users/search?${params}`);
}

export function listPvpInvites() {
  return fetchJson<PvpInviteList>("/api/pvp/invites");
}

export function createPvpInvite(input: {
  inviteeId: string;
  inviterColor: "white" | "black" | "random";
  timeControl?: { initial: number; increment: number };
}) {
  return fetchJson<PvpInvite>("/api/pvp/invites", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPvpInviteByToken(token: string) {
  return fetchJson<PvpInvite>(`/api/pvp/invites/token/${token}`);
}

export function acceptPvpInvite(inviteId: string) {
  return fetchJson<{ invite: PvpInvite; game: { id: string } }>(
    `/api/pvp/invites/${inviteId}/accept`,
    { method: "POST" },
  );
}

export function declinePvpInvite(inviteId: string) {
  return fetchJson<PvpInvite>(`/api/pvp/invites/${inviteId}/decline`, {
    method: "POST",
  });
}

export function cancelPvpInvite(inviteId: string) {
  return fetchJson<PvpInvite>(`/api/pvp/invites/${inviteId}`, {
    method: "DELETE",
  });
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

export function offerDraw(gameId: string) {
  return fetchJson<{ offered: boolean }>(`/api/games/${gameId}/draw-offer`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function acceptDraw(gameId: string) {
  return fetchJson<GameDetail>(`/api/games/${gameId}/draw-offer/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function declineDraw(gameId: string) {
  return fetchJson<{ declined: boolean }>(
    `/api/games/${gameId}/draw-offer/decline`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}

export function listGameMessages(gameId: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchJson<GameChatMessage[]>(
    `/api/games/${gameId}/messages?${params}`,
  );
}

export function sendGameMessage(gameId: string, content: string) {
  return fetchJson<GameChatMessage>(`/api/games/${gameId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function createRematchInvite(gameId: string) {
  return fetchJson<PvpInvite>(`/api/games/${gameId}/rematch`, {
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

export type CoachChatSessionSummary = {
  id: string;
  preview: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export async function listCoachChatSessions(params?: {
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  const query = search.toString();
  const response = await fetch(
    `/api/coach/chat/sessions${query ? `?${query}` : ""}`,
  );
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message ?? "Request failed");
  }
  return {
    data: body.data as CoachChatSessionSummary[],
    meta: body.meta as { page: number; pageSize: number; total: number },
  };
}

export function createCoachChatSession(context?: {
  fen?: string;
  gameId?: string;
  mode?: string;
}) {
  return fetchJson<{ sessionId: string }>("/api/coach/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ context }),
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

export type StoredAnalysis = {
  id: string;
  gameId: string;
  accuracy: number;
  acpl: number;
  totalMoves: number;
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  brilliantCount: number;
  moveAnalysis: unknown[];
  evalGraph: unknown[];
  summary: string | null;
  keyMoments: unknown[] | null;
  createdAt: string;
  updatedAt: string;
};

export function getAnalysis(gameId: string) {
  return fetchJson<StoredAnalysis | null>(`/api/analysis/${gameId}`);
}

export function saveAnalysis(
  gameId: string,
  data: {
    accuracy: number;
    acpl: number;
    totalMoves: number;
    blunderCount: number;
    mistakeCount: number;
    inaccuracyCount: number;
    brilliantCount: number;
    moveAnalysis: unknown[];
    evalGraph: unknown[];
  },
) {
  return fetchJson<StoredAnalysis>(`/api/analysis/${gameId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function importPgn(pgn: string) {
  return fetchJson<{ gameId: string; moveCount: number }>(
    "/api/analysis/import",
    {
      method: "POST",
      body: JSON.stringify({ pgn }),
    },
  );
}

export function explainMove(data: {
  gameId: string;
  fen: string;
  moves: string[];
  moveNumber: number;
  san: string;
  evalBefore: number;
  evalAfter: number;
  bestMove?: string;
  classification?: string;
}) {
  return fetchJson<{
    explanation: string;
    concepts: string[];
    suggestedFollowUp?: string;
  }>("/api/coach/explain-move", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function generateGameSummary(gameId: string) {
  return fetchJson<{
    summary: string;
    strengths?: string[];
    improvements?: string[];
    studyTip?: string;
    cached?: boolean;
  }>("/api/coach/game-summary", {
    method: "POST",
    body: JSON.stringify({ gameId }),
  });
}

export type TrainingRecommendations = {
  hasEnoughData: boolean;
  weaknesses: Array<{ tag: string; count: number }>;
  recommendedTopics: string[];
  activeLessons: number;
};

export function getTrainingRecommendations() {
  return fetchJson<TrainingRecommendations>("/api/training/recommendations");
}

export function getStudyPlan() {
  return fetchJson<{
    activeLessons: Array<{
      lessonId: string;
      title: string;
      topic: string;
      currentExercise: number;
      totalExercises: number;
      startedAt: string;
    }>;
  }>("/api/training/study-plan");
}

export function getTrainingLessons(topic?: string) {
  const query = topic ? `?topic=${topic}` : "";
  return fetchJson<unknown[]>(`/api/training/lessons${query}`);
}

export function generateLesson(data?: { topic?: string; weakness?: string }) {
  return fetchJson<{ id: string }>("/api/training/lessons", {
    method: "POST",
    body: JSON.stringify(data ?? {}),
  });
}

export function getLesson(lessonId: string) {
  return fetchJson<LessonDetail>(`/api/training/lessons/${lessonId}`);
}

export function updateLessonProgress(
  lessonId: string,
  data: {
    currentExercise: number;
    exerciseCorrect?: boolean;
    completed?: boolean;
  },
) {
  return fetchJson<unknown>(
    `/api/training/lessons/${lessonId}/progress`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function requestHint(
  lessonId: string,
  data: { exerciseIndex: number; hintLevel: number },
) {
  return fetchJson<{
    hint: string;
    level: number;
    showSolution?: boolean;
    solution?: string;
    explanation?: string;
  }>(`/api/training/lessons/${lessonId}/hint`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyExerciseMove(
  lessonId: string,
  data: { exerciseIndex: number; uci: string },
) {
  return fetchJson<{ correct: boolean }>(
    `/api/training/lessons/${lessonId}/verify`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export type LessonDetail = {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: number;
  status: string;
  exercises: Array<{
    id: string;
    orderIndex: number;
    fen: string;
    objective: string;
    hintLevels: string[];
    explanation: string;
  }>;
  progress: {
    currentExercise: number;
    completed: boolean;
    score: number | null;
  } | null;
};

export type ProgressOverview = {
  gamesPlayed: number;
  analyzedGames: number;
  avgAccuracy: number | null;
  accuracyTrend: Array<{ gameId: string; accuracy: number; date: string }>;
  weaknessTags: Array<{ tag: string; count: number }>;
  streak: number;
  games: GameSummary[];
};

export function getProgress() {
  return fetchJson<ProgressOverview>("/api/user/progress");
}

export function getWeeklyReport() {
  return fetchJson<{
    id: string;
    narrative: string;
    gamesPlayed: number;
    lessonsCompleted: number;
    avgAccuracy: number | null;
    weaknessTags: string[];
    weekStart: string;
    weekEnd: string;
  } | null>("/api/reports/weekly");
}

export function deleteAccount() {
  return fetchJson<{ deleted: boolean }>("/api/user/account", {
    method: "DELETE",
  });
}
