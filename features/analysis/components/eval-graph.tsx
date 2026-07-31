"use client";

import type { EvalGraphPoint } from "../types";

type EvalGraphProps = {
  points: EvalGraphPoint[];
  selectedMoveNumber?: number | null;
  width?: number;
  height?: number;
};

export function EvalGraph({
  points,
  selectedMoveNumber,
  width = 400,
  height = 120,
}: EvalGraphProps) {
  if (points.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
        Not enough data for eval graph
      </div>
    );
  }

  const padding = { top: 8, right: 8, bottom: 20, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxMove = Math.max(...points.map((p) => p.moveNumber), 1);
  const evals = points.map((p) => p.eval / 100);
  const maxEval = Math.max(3, ...evals.map(Math.abs));
  const minEval = -maxEval;

  const x = (moveNumber: number) =>
    padding.left + (moveNumber / maxMove) * innerW;
  const y = (evalCp: number) => {
    const normalized = (evalCp / 100 - minEval) / (maxEval - minEval);
    return padding.top + innerH - normalized * innerH;
  };

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.moveNumber)} ${y(p.eval)}`)
    .join(" ");

  const zeroY = y(0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-full"
      role="img"
      aria-label="Evaluation graph"
    >
      <line
        x1={padding.left}
        y1={zeroY}
        x2={width - padding.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeDasharray="4 4"
      />
      <path
        d={pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />
      {selectedMoveNumber != null ? (
        <line
          x1={x(selectedMoveNumber)}
          y1={padding.top}
          x2={x(selectedMoveNumber)}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeOpacity={0.35}
        />
      ) : null}
      <text
        x={padding.left}
        y={height - 4}
        className="fill-muted-foreground text-[10px]"
      >
        Move 0
      </text>
      <text
        x={width - padding.right}
        y={height - 4}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        {maxMove}
      </text>
    </svg>
  );
}
