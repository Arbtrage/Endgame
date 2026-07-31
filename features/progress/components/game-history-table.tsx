import Link from "next/link";
import type { GameSummary } from "@/shared/api/fetcher";
import { GameCard } from "@/features/game/components/game-card";

type GameHistoryTableProps = {
  games: GameSummary[];
};

export function GameHistoryTable({ games }: GameHistoryTableProps) {
  if (games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Play your first game to start building history.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {games.slice(0, 10).map((game) => (
        <Link key={game.id} href={`/play/${game.id}`}>
          <GameCard game={game} />
        </Link>
      ))}
    </div>
  );
}
