import { APP_NAME, APP_PGN_EVENT } from "@/shared/constants/brand";
import { ChessGame } from "./chess-game";

export function generatePgn(
  game: ChessGame,
  headers: Record<string, string> = {},
): string {
  const defaultHeaders: Record<string, string> = {
    Event: APP_PGN_EVENT,
    Site: APP_NAME.toLowerCase(),
    Date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    ...headers,
  };

  const headerLines = Object.entries(defaultHeaders)
    .map(([key, value]) => `[${key} "${value}"]`)
    .join("\n");

  const moves = game.getPgn();
  return `${headerLines}\n\n${moves}`.trim();
}
