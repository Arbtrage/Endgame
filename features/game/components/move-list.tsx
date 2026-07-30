"use client";

import { cn } from "@/shared/lib/utils";
import type { GameMove } from "@/features/game/types";

type MoveListProps = {
  moves: GameMove[];
  activeIndex: number | null;
  onSelectMove: (index: number) => void;
};

export function MoveList({ moves, activeIndex, onSelectMove }: MoveListProps) {
  const pairs: Array<{ white?: GameMove; black?: GameMove }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      white: moves[i],
      black: moves[i + 1],
    });
  }

  if (moves.length === 0) {
    return (
      <div className="flex h-full min-h-32 flex-col items-center justify-center px-6 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No moves yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your move history will appear here as the game progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 border-b border-border/80 bg-card">
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-10 px-4 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">White</th>
            <th className="px-3 py-2 text-left font-medium">Black</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => {
            const moveNumber = index + 1;
            return (
              <tr
                key={moveNumber}
                className="border-b border-border/50 last:border-b-0"
              >
                <td className="px-4 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">
                  {moveNumber}
                </td>
                <td className="px-3 py-1.5">
                  {pair.white ? (
                    <MoveButton
                      label={pair.white.san}
                      active={activeIndex === pair.white.moveNumber - 1}
                      onClick={() => onSelectMove(pair.white!.moveNumber - 1)}
                    />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  {pair.black ? (
                    <MoveButton
                      label={pair.black.san}
                      active={activeIndex === pair.black.moveNumber - 1}
                      onClick={() => onSelectMove(pair.black!.moveNumber - 1)}
                    />
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MoveButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-2 py-1 font-medium transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active && "bg-primary/15 text-primary",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
