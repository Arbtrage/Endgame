"use client";

import { memo } from "react";
import { parseFenPieces } from "@/features/marketing/three/board/square-utils";
import { PieceMesh } from "./piece-model";

function ChessPiecesInner({ fen }: { fen: string }) {
  const pieces = parseFenPieces(fen);

  return (
    <group position={[0, 0.15, 0]}>
      {pieces.map(({ square, kind, color }) => (
        <PieceMesh
          key={square}
          square={square}
          kind={kind}
          color={color}
        />
      ))}
    </group>
  );
}

export const ChessPieces = memo(ChessPiecesInner);
