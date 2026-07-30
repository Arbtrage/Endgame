import { Chess, type Move } from "chess.js";
import type { PlayerColor } from "@/features/game/types";
import { chessTurnToColor } from "@/features/game/types";

export type ChessMoveRecord = {
  san: string;
  uci: string;
  fen: string;
  color: PlayerColor;
  moveNumber: number;
};

export class ChessGame {
  private chess: Chess;
  private reviewIndex: number | null = null;
  private snapshots: string[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.snapshots = [this.chess.fen()];
  }

  getFen(): string {
    if (this.reviewIndex !== null) {
      return this.snapshots[this.reviewIndex] ?? this.chess.fen();
    }
    return this.chess.fen();
  }

  getLiveFen(): string {
    return this.chess.fen();
  }

  turn(): "w" | "b" {
    if (this.reviewIndex !== null) {
      const fen = this.snapshots[this.reviewIndex] ?? this.chess.fen();
      return fen.split(" ")[1] === "b" ? "b" : "w";
    }
    return this.chess.turn();
  }

  getLegalMoves(square?: string) {
    return this.chess.moves({ square: square as never, verbose: true });
  }

  makeMove(from: string, to: string, promotion?: string): Move | null {
    if (this.reviewIndex !== null) {
      return null;
    }

    try {
      const move = this.chess.move({
        from: from as never,
        to: to as never,
        promotion: promotion as never,
      });
      if (move) {
        this.snapshots.push(this.chess.fen());
      }
      return move;
    } catch {
      return null;
    }
  }

  makeMoveUci(uci: string): Move | null {
    if (this.reviewIndex !== null) {
      return null;
    }

    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;
    return this.makeMove(from, to, promotion);
  }

  getHistory(): string[] {
    return this.chess.history();
  }

  getHistoryUci(): string[] {
    return this.chess.history({ verbose: true }).map((move) => {
      const promotion = move.promotion ?? "";
      return `${move.from}${move.to}${promotion}`;
    });
  }

  getMoveRecords(): ChessMoveRecord[] {
    const verbose = this.chess.history({ verbose: true });
    const temp = new Chess();
    const records: ChessMoveRecord[] = [];

    verbose.forEach((move, index) => {
      temp.move(move);
      records.push({
        moveNumber: index + 1,
        san: move.san,
        uci: `${move.from}${move.to}${move.promotion ?? ""}`,
        fen: temp.fen(),
        color: chessTurnToColor(move.color),
      });
    });

    return records;
  }

  getPgn(): string {
    return this.chess.pgn();
  }

  isCheck(): boolean {
    return this.chess.inCheck();
  }

  getKingSquare(color?: "w" | "b"): string | null {
    const targetColor = color ?? this.chess.turn();
    const board = this.chess.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row]?.[col];
        if (piece?.type === "k" && piece.color === targetColor) {
          return `${String.fromCharCode(97 + col)}${8 - row}`;
        }
      }
    }

    return null;
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  isDraw(): boolean {
    return this.chess.isDraw();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  isFiftyMoveRule(): boolean {
    const fen = this.chess.fen();
    const halfmove = Number(fen.split(" ")[4] ?? 0);
    return halfmove >= 100;
  }

  getDrawReason(): string | null {
    if (this.isStalemate()) return "stalemate";
    if (this.isThreefoldRepetition()) return "threefold_repetition";
    if (this.isInsufficientMaterial()) return "insufficient_material";
    if (this.isFiftyMoveRule()) return "fifty_move_rule";
    if (this.isDraw() && !this.isStalemate()) return "draw";
    return null;
  }

  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.snapshots = [fen];
      this.reviewIndex = null;
      return true;
    } catch {
      return false;
    }
  }

  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      this.rebuildSnapshots();
      this.reviewIndex = null;
      return true;
    } catch {
      return false;
    }
  }

  private rebuildSnapshots(): void {
    const pgn = this.chess.pgn();
    const temp = new Chess();
    temp.loadPgn(pgn);
    const verbose = temp.history({ verbose: true });
    this.chess.reset();
    this.snapshots = [this.chess.fen()];
    verbose.forEach((move) => {
      this.chess.move(move);
      this.snapshots.push(this.chess.fen());
    });
  }

  goToMove(index: number): void {
    if (index < 0 || index >= this.snapshots.length) {
      this.reviewIndex = null;
      return;
    }
    this.reviewIndex = index;
  }

  exitReview(): void {
    this.reviewIndex = null;
  }

  isReviewing(): boolean {
    return this.reviewIndex !== null;
  }

  getReviewIndex(): number | null {
    return this.reviewIndex;
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  reset(): void {
    this.chess.reset();
    this.snapshots = [this.chess.fen()];
    this.reviewIndex = null;
  }
}
