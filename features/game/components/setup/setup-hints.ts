import { Sparkle } from "@phosphor-icons/react";

export const SAMPLE_VILLAINS = [
  "Thanos",
  "Loki",
  "Doctor Doom",
  "Magneto",
  "Ultron",
  "Hela",
] as const;

export const SAMPLE_HEROES = [
  "Iron Man",
  "Spider-Man",
  "Thor",
  "Black Panther",
  "Captain Marvel",
  "Doctor Strange",
] as const;

export const VILLAIN_SIDEBAR = {
  title: "Random villain each game",
  description:
    "Every new match draws a Marvel nemesis. Reopen the same game and the name stays the same.",
  tips: [
    "Threat level 1–8: casual. 9–14: solid. 15–20: ruthless.",
    "Engine-backed moves — no illegal tricks.",
    "Finished games replay from your dashboard.",
  ],
} as const;

export const HERO_CALLOUT = {
  title: "Your hero is chosen at match start",
  body: "Iron Man, Spider-Man, Captain Marvel, and others rotate in randomly. Playing style sets how they play — not their name.",
  icon: Sparkle,
} as const;

export const COACH_SIDEBAR = {
  title: "Coach follows your game",
  description:
    "Stockfish plays the villain. Gemini explains your key moments live.",
  tips: [
    "Blunders, missed tactics, and turning points trigger notes.",
    "Lower threat level if you need time to read explanations.",
    "Toggle auto-explain in Settings anytime.",
  ],
} as const;
