export type MomentType =
  | "blunder"
  | "brilliant"
  | "opening_exit"
  | "endgame_entry"
  | "check"
  | "material_change";

export type EvalContext = {
  moveNumber: number;
  evalBefore: number;
  evalAfter: number;
  evalSwing: number;
  evalGain: number;
  isBestMove: boolean;
  isCheck: boolean;
  capturedPiece: string | null;
  totalPieces: number;
  prevTotalPieces: number;
};

export type KeyMoment = {
  type: MomentType;
  moveNumber: number;
  evalBefore: number;
  evalAfter: number;
  san: string;
};

type Trigger = {
  type: MomentType;
  condition: (ctx: EvalContext) => boolean;
};

const triggers: Trigger[] = [
  {
    type: "blunder",
    condition: (ctx) => Math.abs(ctx.evalSwing) >= 200,
  },
  {
    type: "brilliant",
    condition: (ctx) => ctx.isBestMove && ctx.evalGain >= 150,
  },
  {
    type: "opening_exit",
    condition: (ctx) => ctx.moveNumber === 12,
  },
  {
    type: "endgame_entry",
    condition: (ctx) => ctx.totalPieces <= 6 && ctx.prevTotalPieces > 6,
  },
  {
    type: "check",
    condition: (ctx) => ctx.isCheck,
  },
  {
    type: "material_change",
    condition: (ctx) => ctx.capturedPiece !== null,
  },
];

export type KeyMomentDetectorState = {
  lastExplainedMove: number;
  momentCount: number;
};

export function createKeyMomentDetectorState(): KeyMomentDetectorState {
  return {
    lastExplainedMove: 0,
    momentCount: 0,
  };
}

export function countPieces(fen: string): number {
  const board = fen.split(" ")[0];
  const pieces = board.replace(/[^pnbrqkPNBRQK]/g, "");
  return pieces.length;
}

export function detectKeyMoments(
  ctx: EvalContext,
  state: KeyMomentDetectorState,
  options: {
    debounceMoves?: number;
    maxMoments?: number;
  } = {},
): KeyMoment | null {
  const debounceMoves = options.debounceMoves ?? 3;
  const maxMoments = options.maxMoments ?? 10;

  if (state.momentCount >= maxMoments) {
    return null;
  }

  if (ctx.moveNumber - state.lastExplainedMove < debounceMoves) {
    return null;
  }

  for (const trigger of triggers) {
    if (trigger.condition(ctx)) {
      state.lastExplainedMove = ctx.moveNumber;
      state.momentCount += 1;
      return {
        type: trigger.type,
        moveNumber: ctx.moveNumber,
        evalBefore: ctx.evalBefore,
        evalAfter: ctx.evalAfter,
        san: "",
      };
    }
  }

  return null;
}

export function buildEvalContext(params: {
  moveNumber: number;
  evalBefore: number;
  evalAfter: number;
  isBestMove: boolean;
  isCheck: boolean;
  capturedPiece: string | null;
  fenBefore: string;
  fenAfter: string;
  playerColor: "white" | "black";
}): EvalContext {
  const swing = params.evalAfter - params.evalBefore;
  const playerMultiplier = params.playerColor === "white" ? 1 : -1;
  const evalSwing = swing * playerMultiplier;
  const evalGain = evalSwing > 0 ? evalSwing : 0;

  return {
    moveNumber: params.moveNumber,
    evalBefore: params.evalBefore,
    evalAfter: params.evalAfter,
    evalSwing,
    evalGain,
    isBestMove: params.isBestMove,
    isCheck: params.isCheck,
    capturedPiece: params.capturedPiece,
    totalPieces: countPieces(params.fenAfter),
    prevTotalPieces: countPieces(params.fenBefore),
  };
}
