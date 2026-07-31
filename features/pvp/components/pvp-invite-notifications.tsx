"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPusherClient } from "@/shared/realtime/pusher-client";
import { useSession } from "@/shared/auth/auth-client";
import type { InviteAcceptedEvent } from "@/server/realtime/pusher";

export function PvpInviteNotifications() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const handledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("invite-accepted", (payload: InviteAcceptedEvent) => {
      if (handledRef.current.has(payload.gameId)) return;
      handledRef.current.add(payload.gameId);

      const label = payload.opponentName ?? "Your opponent";
      toast.success(`${label} accepted — joining game`);

      router.push(`/play/${payload.gameId}`);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [router, userId]);

  return null;
}
