import { Vector3 } from "three";

export const SQUARE_SIZE = 1;
export const BOARD_HALF = 4;

export type Square = string;

export function squareToCoords(square: Square): { file: number; rank: number } {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]!, 10) - 1;
  return { file, rank };
}

export function coordsToSquare(file: number, rank: number): Square {
  return `${String.fromCharCode("a".charCodeAt(0) + file)}${rank + 1}`;
}

/** Map chess square to world position (board centered at origin, white at bottom). */
export function squareToPosition(square: Square, y = 0): Vector3 {
  const { file, rank } = squareToCoords(square);
  const x = file - 3.5;
  const z = 3.5 - rank;
  return new Vector3(x * SQUARE_SIZE, y, z * SQUARE_SIZE);
}

export function isLightSquare(file: number, rank: number): boolean {
  return (file + rank) % 2 === 0;
}

export type ParsedPiece = {
  square: Square;
  kind: "p" | "r" | "n" | "b" | "q" | "k";
  color: "w" | "b";
};

export function parseFenPieces(fen: string): ParsedPiece[] {
  const placement = fen.split(" ")[0] ?? "";
  const result: ParsedPiece[] = [];
  let rank = 7;
  let file = 0;

  for (const char of placement) {
    if (char === "/") {
      rank--;
      file = 0;
      continue;
    }
    if (char >= "1" && char <= "8") {
      file += parseInt(char, 10);
      continue;
    }
    const isWhite = char === char.toUpperCase();
    const kind = char.toLowerCase() as ParsedPiece["kind"];
    result.push({
      square: coordsToSquare(file, rank),
      kind,
      color: isWhite ? "w" : "b",
    });
    file++;
  }

  return result;
}
