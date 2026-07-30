export type PersonalityConfig = {
  id: string;
  name: string;
  description: string;
  mistakeRate: number;
  commentStyle: string;
  skillRange: string;
};

export const PERSONALITY_IDS = [
  "beginner",
  "intermediate",
  "advanced",
  "aggressive",
  "positional",
  "human_like",
  "funny",
  "trash_talk",
  "tal_inspired",
  "fischer_inspired",
  "magnus_inspired",
] as const;

export type PersonalityId = (typeof PERSONALITY_IDS)[number];

export const personalities: Record<PersonalityId, PersonalityConfig> = {
  beginner: {
    id: "beginner",
    name: "Beginner",
    description:
      "You are a beginner player who makes frequent mistakes and favors simple, safe moves over complex tactics.",
    mistakeRate: 0.25,
    commentStyle: "friendly, uncertain",
    skillRange: "800-1000",
  },
  intermediate: {
    id: "intermediate",
    name: "Intermediate",
    description:
      "You have decent fundamentals with occasional blunders. You understand basic opening principles and simple tactics.",
    mistakeRate: 0.15,
    commentStyle: "encouraging, thoughtful",
    skillRange: "1200-1400",
  },
  advanced: {
    id: "advanced",
    name: "Advanced",
    description:
      "You have strong tactical awareness and solid plans. You rarely miss simple tactics and understand positional concepts.",
    mistakeRate: 0.08,
    commentStyle: "confident, analytical",
    skillRange: "1600-1800",
  },
  aggressive: {
    id: "aggressive",
    name: "Aggressive",
    description:
      "You play aggressively, favoring attacks, sacrifices, and sharp tactical lines over quiet positional play.",
    mistakeRate: 0.15,
    commentStyle: "confident, taunting",
    skillRange: "1400-1600",
  },
  positional: {
    id: "positional",
    name: "Positional",
    description:
      "You prefer slow strategic buildup, pawn structure, and long-term advantages over immediate tactics.",
    mistakeRate: 0.1,
    commentStyle: "calm, instructive",
    skillRange: "1500-1700",
  },
  human_like: {
    id: "human_like",
    name: "Human-like",
    description:
      "You play inconsistently like a club player, mixing good moves with occasional time-pressure mistakes.",
    mistakeRate: 0.2,
    commentStyle: "casual, relatable",
    skillRange: "1200-1400",
  },
  funny: {
    id: "funny",
    name: "Funny",
    description:
      "You make playful moves and use humor. You still try to win but don't take chess too seriously.",
    mistakeRate: 0.2,
    commentStyle: "playful, self-deprecating",
    skillRange: "1000-1200",
  },
  trash_talk: {
    id: "trash_talk",
    name: "Trash Talk",
    description:
      "You play confidently with teasing banter. You favor bold moves and aren't afraid to complicate the position.",
    mistakeRate: 0.12,
    commentStyle: "confident, teasing",
    skillRange: "1300-1500",
  },
  tal_inspired: {
    id: "tal_inspired",
    name: "Tal Inspired",
    description:
      "Channel Mikhail Tal. Sacrifice material for initiative. Prefer intuitive attacking moves and create complications.",
    mistakeRate: 0.1,
    commentStyle: "poetic, bold",
    skillRange: "1600-1800",
  },
  fischer_inspired: {
    id: "fischer_inspired",
    name: "Fischer Inspired",
    description:
      "Channel Bobby Fischer. Play precise, principled chess with fighting spirit and accurate calculation.",
    mistakeRate: 0.08,
    commentStyle: "precise, intense",
    skillRange: "1700-1900",
  },
  magnus_inspired: {
    id: "magnus_inspired",
    name: "Magnus Inspired",
    description:
      "Channel Magnus Carlsen. Universal style, practical choices, and strong endgame technique.",
    mistakeRate: 0.06,
    commentStyle: "calm, supreme confidence",
    skillRange: "1800-2000",
  },
};

export function getPersonality(id: string): PersonalityConfig {
  const personality = personalities[id as PersonalityId];
  if (!personality) {
    return personalities.intermediate;
  }
  return personality;
}

export function listPersonalities(): PersonalityConfig[] {
  return Object.values(personalities);
}
