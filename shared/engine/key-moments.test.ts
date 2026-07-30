import { describe, expect, it } from "vitest";
import {
  buildEvalContext,
  countPieces,
  createKeyMomentDetectorState,
  detectKeyMoments,
} from "@/shared/engine/key-moments";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("key-moments", () => {
  it("counts pieces on board", () => {
    expect(countPieces(START_FEN)).toBe(32);
  });

  it("detects blunder trigger", () => {
    const state = createKeyMomentDetectorState();
    const ctx = buildEvalContext({
      moveNumber: 5,
      evalBefore: 50,
      evalAfter: -200,
      isBestMove: false,
      isCheck: false,
      capturedPiece: null,
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    const moment = detectKeyMoments(ctx, state);
    expect(moment?.type).toBe("blunder");
  });

  it("detects opening exit at move 12", () => {
    const state = createKeyMomentDetectorState();
    const ctx = buildEvalContext({
      moveNumber: 12,
      evalBefore: 0,
      evalAfter: 10,
      isBestMove: false,
      isCheck: false,
      capturedPiece: null,
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    const moment = detectKeyMoments(ctx, state);
    expect(moment?.type).toBe("opening_exit");
  });

  it("detects check trigger", () => {
    const state = createKeyMomentDetectorState();
    const ctx = buildEvalContext({
      moveNumber: 8,
      evalBefore: 0,
      evalAfter: 50,
      isBestMove: false,
      isCheck: true,
      capturedPiece: null,
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    const moment = detectKeyMoments(ctx, state);
    expect(moment?.type).toBe("check");
  });

  it("detects material change on capture", () => {
    const state = createKeyMomentDetectorState();
    const ctx = buildEvalContext({
      moveNumber: 4,
      evalBefore: 0,
      evalAfter: 100,
      isBestMove: false,
      isCheck: false,
      capturedPiece: "x",
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    const moment = detectKeyMoments(ctx, state);
    expect(moment?.type).toBe("material_change");
  });

  it("respects debounce between moments", () => {
    const state = createKeyMomentDetectorState();
    const ctx = buildEvalContext({
      moveNumber: 4,
      evalBefore: 0,
      evalAfter: -300,
      isBestMove: false,
      isCheck: true,
      capturedPiece: "x",
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    detectKeyMoments(ctx, state);
    const second = detectKeyMoments(
      { ...ctx, moveNumber: 5 },
      state,
    );
    expect(second).toBeNull();
  });

  it("detects brilliant move", () => {
    const state = createKeyMomentDetectorState();
    state.lastExplainedMove = 0;
    const ctx = buildEvalContext({
      moveNumber: 10,
      evalBefore: 50,
      evalAfter: 200,
      isBestMove: true,
      isCheck: false,
      capturedPiece: null,
      fenBefore: START_FEN,
      fenAfter: START_FEN,
      playerColor: "white",
    });

    const moment = detectKeyMoments(ctx, state);
    expect(moment?.type).toBe("brilliant");
  });
});
