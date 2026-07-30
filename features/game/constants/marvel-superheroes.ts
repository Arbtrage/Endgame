export const MARVEL_SUPERHEROES = [
  "Iron Man",
  "Captain America",
  "Thor",
  "Spider-Man",
  "Black Widow",
  "Hulk",
  "Doctor Strange",
  "Black Panther",
  "Wolverine",
  "Scarlet Witch",
  "Captain Marvel",
  "Hawkeye",
  "Ant-Man",
  "Vision",
  "Star-Lord",
  "Gamora",
  "Doctor Voodoo",
  "Moon Knight",
] as const;

export type MarvelSuperhero = (typeof MARVEL_SUPERHEROES)[number];

function hashGameId(gameId: string): number {
  let hash = 0;
  for (let i = 0; i < gameId.length; i++) {
    hash = (hash * 31 + gameId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Same game always maps to the same hero (stable across reloads). */
export function getMarvelSuperheroForGame(gameId: string): MarvelSuperhero {
  const index = hashGameId(gameId) % MARVEL_SUPERHEROES.length;
  return MARVEL_SUPERHEROES[index]!;
}

export function getHeroThinkingLabel(hero: string): string {
  return `${hero} is thinking…`;
}
