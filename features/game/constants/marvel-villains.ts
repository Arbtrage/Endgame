export const MARVEL_VILLAINS = [
  "Thanos",
  "Doctor Doom",
  "Loki",
  "Magneto",
  "Green Goblin",
  "Ultron",
  "Venom",
  "Red Skull",
  "Kingpin",
  "Mysterio",
  "Killmonger",
  "Hela",
  "Dormammu",
  "Galactus",
  "Kang the Conqueror",
  "Mystique",
  "Apocalypse",
] as const;

export type MarvelVillain = (typeof MARVEL_VILLAINS)[number];

function hashGameId(gameId: string): number {
  let hash = 0;
  for (let i = 0; i < gameId.length; i++) {
    hash = (hash * 31 + gameId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Same game always maps to the same villain (stable across reloads). */
export function getMarvelVillainForGame(gameId: string): MarvelVillain {
  const index = hashGameId(gameId) % MARVEL_VILLAINS.length;
  return MARVEL_VILLAINS[index]!;
}

export function getVillainThinkingLabel(villain: string): string {
  return `${villain} is thinking…`;
}

export const ENGINE_LOADING_LABEL = "Summoning opponent…";
