import type { RegexMatch } from "./types";

interface PatternDefinition {
  type: string;
  pattern: RegExp;
}

const patterns: PatternDefinition[] = [
  {
    type: "duration",
    pattern:
      /\b(?:for|since)\s+(?:the\s+)?(?:last\s+)?\d+\s+(?:second|seconds|minute|minutes|hour|hours|day|days|week|weeks|month|months|year|years)\b/gi,
  },

  {
    type: "temporal",
    pattern:
      /\b(?:today|yesterday|tomorrow|this morning|this afternoon|tonight|last night|last week|this week|recently|lately|earlier|later)\b/gi,
  },

  {
    type: "frequency",
    pattern:
      /\b(?:always|usually|often|sometimes|occasionally|rarely|never|every day|every week|once a day|twice a week)\b/gi,
  },

  {
    type: "decision",
    pattern:
      /\b(?:I\s+)?(?:decided|decide|chose|choose|plan|planned|intend|intended|will|won't|want to|don't want to|thought about)\b[^.!?]*/gi,
  },

  {
    type: "causal",
    pattern:
      /\b(?:because|because of|due to|since|after|before|when|whenever|therefore|so|as a result)\b[^.!?]*/gi,
  },

  {
    type: "condition",
    pattern:
      /\b(?:I\s+am|I'm|I\s+feel|I\s+felt|I've been feeling|I\s+have been feeling)\b[^.!?]*/gi,
  },

  {
    type: "firstPersonAction",
    pattern:
      /\bI\s+(?:went|left|called|talked|spoke|met|walked|studied|played|stayed|cried|slept|ate|drank|worked|stopped|started|tried)\b[^.!?]*/gi,
  },
];

export function extractRegexPatterns(
  text: string
): RegexMatch[] {
  const matches: RegexMatch[] = [];

  for (const definition of patterns) {
    const regex = new RegExp(
      definition.pattern.source,
      definition.pattern.flags
    );

    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: definition.type,
        text: match[0].trim(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return matches.sort(
    (a, b) => a.start - b.start
  );
}