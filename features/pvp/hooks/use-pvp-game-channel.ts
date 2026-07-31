"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/shared/realtime/pusher-client";
import type {
  ChatMessageEvent,
  DrawDeclinedEvent,
  DrawOfferEvent,
  GameOverEvent,
  MoveMadeEvent,
  RematchOfferedEvent,
} from "@/server/realtime/pusher";

type UsePvpGameChannelOptions = {
  gameId: string;
  enabled: boolean;
  onMoveMade: (move: MoveMadeEvent) => void;
  onGameOver: (payload: GameOverEvent) => void;
  onDrawOffered?: (payload: DrawOfferEvent) => void;
  onDrawDeclined?: (payload: DrawDeclinedEvent) => void;
  onChatMessage?: (payload: ChatMessageEvent) => void;
  onRematchOffered?: (payload: RematchOfferedEvent) => void;
};

export function usePvpGameChannel({
  gameId,
  enabled,
  onMoveMade,
  onGameOver,
  onDrawOffered,
  onDrawDeclined,
  onChatMessage,
  onRematchOffered,
}: UsePvpGameChannelOptions) {
  const onMoveRef = useRef(onMoveMade);
  const onOverRef = useRef(onGameOver);
  const onDrawOfferedRef = useRef(onDrawOffered);
  const onDrawDeclinedRef = useRef(onDrawDeclined);
  const onChatRef = useRef(onChatMessage);
  const onRematchRef = useRef(onRematchOffered);

  useEffect(() => {
    onMoveRef.current = onMoveMade;
  }, [onMoveMade]);

  useEffect(() => {
    onOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    onDrawOfferedRef.current = onDrawOffered;
  }, [onDrawOffered]);

  useEffect(() => {
    onDrawDeclinedRef.current = onDrawDeclined;
  }, [onDrawDeclined]);

  useEffect(() => {
    onChatRef.current = onChatMessage;
  }, [onChatMessage]);

  useEffect(() => {
    onRematchRef.current = onRematchOffered;
  }, [onRematchOffered]);

  useEffect(() => {
    if (!enabled) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-game-${gameId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("move-made", (data: MoveMadeEvent) => {
      onMoveRef.current(data);
    });

    channel.bind("game-over", (data: GameOverEvent) => {
      onOverRef.current(data);
    });

    channel.bind("draw-offered", (data: DrawOfferEvent) => {
      onDrawOfferedRef.current?.(data);
    });

    channel.bind("draw-declined", (data: DrawDeclinedEvent) => {
      onDrawDeclinedRef.current?.(data);
    });

    channel.bind("chat-message", (data: ChatMessageEvent) => {
      onChatRef.current?.(data);
    });

    channel.bind("rematch-offered", (data: RematchOfferedEvent) => {
      onRematchRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [enabled, gameId]);
}
