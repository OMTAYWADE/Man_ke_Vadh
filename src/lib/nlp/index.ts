import { normalizeText } from "./normalize";
import { analyseGrammar } from "./grammer";
import { extractRegexPatterns } from "./regex";

import type { NLPAnalysis } from "./types";

export function analyseText(
  text: string
): NLPAnalysis {
  const normalizedText =
    normalizeText(text);

  const grammar =
    analyseGrammar(normalizedText);

  const patterns =
    extractRegexPatterns(normalizedText);

  return {
    originalText: text,
    normalizedText,
    grammer: grammar,
    patterns,
  };
}
