import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { BOARD_COLORS } from "./board-materials";
import { isLightSquare } from "./square-utils";

const SQUARE_HEIGHT = 0.08;
const BEVEL = 0.04;

function BoardSquare({
  file,
  rank,
}: {
  file: number;
  rank: number;
}) {
  const isLight = isLightSquare(file, rank);
  const x = file - 3.5;
  const z = 3.5 - rank;
  const y = isLight ? 0.02 : 0;

  return (
    <RoundedBox
      args={[0.92, SQUARE_HEIGHT, 0.92]}
      radius={BEVEL}
      smoothness={4}
      position={[x, y + SQUARE_HEIGHT / 2, z]}
      receiveShadow
    >
      <meshStandardMaterial
        color={isLight ? BOARD_COLORS.light : BOARD_COLORS.dark}
        metalness={BOARD_COLORS.squareMetalness}
        roughness={BOARD_COLORS.squareRoughness}
        envMapIntensity={0.3}
      />
    </RoundedBox>
  );
}

function BoardFrame() {
  return (
    <mesh position={[0, -0.02, 0]} receiveShadow castShadow>
      <boxGeometry args={[8.6, 0.2, 8.6]} />
      <meshStandardMaterial
        color={BOARD_COLORS.frame}
        metalness={BOARD_COLORS.frameMetalness}
        roughness={BOARD_COLORS.frameRoughness}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

function HighlightSquare({ square }: { square: string }) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]!, 10) - 1;
  const x = file - 3.5;
  const z = 3.5 - rank;

  return (
    <mesh position={[x, 0.12, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.88, 0.88]} />
      <meshStandardMaterial
        color={BOARD_COLORS.highlight}
        emissive={BOARD_COLORS.highlight}
        emissiveIntensity={0.6}
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

export function ChessBoard3D({
  highlightedSquare,
}: {
  highlightedSquare?: string | null;
}) {
  const squares = useMemo(() => {
    const items: { file: number; rank: number; key: string }[] = [];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        items.push({ file, rank, key: `${file}-${rank}` });
      }
    }
    return items;
  }, []);

  return (
    <group position={[0, 0.15, 0]}>
      <BoardFrame />
      {squares.map(({ file, rank, key }) => (
        <BoardSquare key={key} file={file} rank={rank} />
      ))}
      {highlightedSquare ? (
        <HighlightSquare square={highlightedSquare} />
      ) : null}
    </group>
  );
}
