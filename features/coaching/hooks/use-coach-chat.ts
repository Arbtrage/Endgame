"use client";

import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { dbMessageToUIMessage } from "@/features/coaching/utils/chat-messages";
import {
  createCoachChatSession,
  getCoachChatHistory,
  listCoachChatSessions,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";

const COACH_CHAT_ID = "coach-chat";

type CoachChatContext = {
  fen?: string;
  gameId?: string;
  mode?: string;
};

type UseCoachChatOptions = {
  context?: CoachChatContext;
};

function invalidateCoachSessions(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({
    queryKey: ["coach", "sessions"],
  });
}

export function useCoachChat({ context }: UseCoachChatOptions = {}) {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    sessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const sessionsQuery = useQuery({
    queryKey: queryKeys.coach.sessions({ pageSize: 30 }),
    queryFn: () => listCoachChatSessions({ pageSize: 30 }),
  });

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    stop,
    regenerate,
    clearError,
  } = useChat({
    id: COACH_CHAT_ID,
    transport: new DefaultChatTransport({
      api: "/api/coach/chat",
      body: () => ({
        sessionId: sessionIdRef.current ?? undefined,
        context: contextRef.current,
      }),
    }),
    onError: (err) => {
      toast.error(err.message || "Coach unavailable");
    },
    onFinish: () => {
      void invalidateCoachSessions(queryClient);
    },
  });

  const loadSessionHistory = useCallback(
    async (sessionId: string) => {
      setHistoryLoading(true);
      try {
        const history = await getCoachChatHistory(sessionId);
        if (!history.sessionId) {
          toast.error("Chat session not found");
          return;
        }

        sessionIdRef.current = history.sessionId;
        setActiveSessionId(history.sessionId);
        setMessages(
          history.messages.map((msg) =>
            dbMessageToUIMessage({
              id: msg.id,
              role: msg.role,
              content: msg.content,
            }),
          ),
        );
      } catch {
        toast.error("Unable to load chat history");
      } finally {
        setHistoryLoading(false);
      }
    },
    [setMessages],
  );

  useEffect(() => {
    if (bootstrapped || sessionsQuery.isLoading) return;

    const firstSession = sessionsQuery.data?.data[0];
    if (firstSession) {
      void loadSessionHistory(firstSession.id).finally(() => setBootstrapped(true));
    } else {
      setHistoryLoading(false);
      setBootstrapped(true);
    }
  }, [
    bootstrapped,
    loadSessionHistory,
    sessionsQuery.data,
    sessionsQuery.isLoading,
  ]);

  const selectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === activeSessionId) return;
      clearError();
      await loadSessionHistory(sessionId);
    },
    [activeSessionId, clearError, loadSessionHistory],
  );

  const startNewChat = useCallback(() => {
    clearError();
    sessionIdRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    setHistoryLoading(false);
  }, [clearError, setMessages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "ready") return;

      let sessionId = sessionIdRef.current;
      if (!sessionId) {
        try {
          const created = await createCoachChatSession(contextRef.current);
          sessionId = created.sessionId;
          setActiveSessionId(sessionId);
          sessionIdRef.current = sessionId;
          await invalidateCoachSessions(queryClient);
        } catch {
          toast.error("Unable to start chat");
          return;
        }
      }

      await sendMessage(
        { text: trimmed },
        { body: { sessionId, context: contextRef.current } },
      );
    },
    [queryClient, sendMessage, status],
  );

  const refetchSessions = useCallback(() => {
    return sessionsQuery.refetch();
  }, [sessionsQuery]);

  const isStreaming = status === "submitted" || status === "streaming";

  return {
    messages,
    send,
    status,
    error,
    stop,
    regenerate,
    historyLoading,
    activeSessionId,
    sessions: sessionsQuery.data?.data ?? [],
    sessionsLoading: sessionsQuery.isLoading || sessionsQuery.isFetching,
    selectSession,
    startNewChat,
    refetchSessions,
    isStreaming,
  };
}
