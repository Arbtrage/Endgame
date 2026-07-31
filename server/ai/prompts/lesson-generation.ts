export function buildLessonGenerationPrompt(params: {
  topic: string;
  weakness?: string;
  skillLevel: number;
}): string {
  return `You are a chess coach creating a personalized training lesson.
Topic: ${params.topic}
${params.weakness ? `Focus weakness: ${params.weakness}` : ""}
Skill level: ${params.skillLevel}/10

Create exactly 5 puzzle exercises. Each must have a valid FEN and a single best-move UCI solution.
Hints should escalate from subtle to direct (3 levels each).

Respond with JSON only:
{
  "title": "Lesson title",
  "description": "One sentence overview",
  "topic": "${params.topic}",
  "difficulty": ${params.skillLevel},
  "exercises": [
    {
      "fen": "valid FEN",
      "objective": "White to play and win",
      "solutionUci": "e2e4",
      "hintLevels": ["subtle hint", "medium hint", "direct hint"],
      "explanation": "Why this works"
    }
  ]
}`;
}
