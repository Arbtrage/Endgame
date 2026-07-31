import Pusher from "pusher";

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  if (!pusherServer) {
    pusherServer = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherServer;
}

export function gameChannelName(gameId: string): string {
  return `private-game-${gameId}`;
}

export type MoveMadeEvent = {
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  color: string;
};

export type GameOverEvent = {
  result: string;
  resultReason: string;
  finalFen: string | null;
};

export type OpponentJoinedEvent = {
  userId: string;
  name: string | null;
  gameId: string;
};

export type DrawOfferEvent = {
  offeredByUserId: string;
  offeredByName: string | null;
};

export type DrawDeclinedEvent = {
  declinedByUserId: string;
};

export type ChatMessageEvent = {
  id: string;
  userId: string;
  userName: string | null;
  content: string;
  createdAt: string;
};

export type RematchOfferedEvent = {
  inviteId: string;
  offeredByUserId: string;
  offeredByName: string | null;
};

export async function triggerMoveMade(gameId: string, payload: MoveMadeEvent) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "move-made", payload);
}

export async function triggerGameOver(gameId: string, payload: GameOverEvent) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "game-over", payload);
}

export async function triggerOpponentJoined(
  gameId: string,
  payload: OpponentJoinedEvent,
) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "opponent-joined", payload);
}

export async function triggerDrawOffered(gameId: string, payload: DrawOfferEvent) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "draw-offered", payload);
}

export async function triggerDrawDeclined(
  gameId: string,
  payload: DrawDeclinedEvent,
) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "draw-declined", payload);
}

export async function triggerChatMessage(gameId: string, payload: ChatMessageEvent) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "chat-message", payload);
}

export async function triggerRematchOffered(
  gameId: string,
  payload: RematchOfferedEvent,
) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(gameChannelName(gameId), "rematch-offered", payload);
}

export function parseGameChannelName(channel: string): string | null {
  const prefix = "private-game-";
  if (!channel.startsWith(prefix)) return null;
  return channel.slice(prefix.length) || null;
}
