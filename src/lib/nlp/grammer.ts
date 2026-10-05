import nlp from "compromise";

import type {
  GrammerAnalysis,
  TokenAnalysis,
  NegationAnalysis,
  SentenceAnalysis,
  POS,
} from "./types";

function getSafeString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function getTokenPosition(
  text: string,
  token: string,
  fromIndex: number
) {
  const index = text.indexOf(token, fromIndex);

  if (index === -1) {
    return {
      start: fromIndex,
      end: fromIndex + token.length,
    };
  }

  return {
    start: index,
    end: index + token.length,
  };
}

/*
 * Compromise POS tags.
 *
 * We use Compromise's .has("#Tag") instead of reading
 * term.tags from .json().
 */
const POS_PATTERNS: Array<[string, POS]> = [
  ["#Pronoun", "PRONOUN"],
  ["#ProperNoun", "PROPER_NOUN"],
  ["#Auxiliary", "AUXILIARY"],
  ["#Noun", "NOUN"],
  ["#Verb", "VERB"],
  ["#Adjective", "ADJECTIVE"],
  ["#Adverb", "ADVERB"],
  ["#Determiner", "DETERMINER"],
  ["#Preposition", "PREPOSITION"],
  ["#Conjunction", "CONJUNCTION"],
  ["#Interjection", "INTERJECTION"],
];

/*
 * Determine POS directly from the Compromise term view.
 */
function getPOS(termView: {
  has: (pattern: string) => boolean;
}): POS {
  const matchedPattern = POS_PATTERNS.find(([pattern]) =>
    termView.has(pattern)
  );

  return matchedPattern?.[1] ?? "UNKNOWN";
}

function analyseSentence(
  sentenceText: string,
  sentenceStart: number
): SentenceAnalysis {
  const document = nlp(sentenceText);

  /*
   * JSON gives us the token text/normal values.
   */
  const terms = document.terms().json();

  /*
   * IMPORTANT:
   * Keep the live Compromise terms as well.
   *
   * We use these for POS detection.
   */
  const termView = document.terms();

  const tokens: TokenAnalysis[] = [];

  let searchIndex = 0;

  terms.forEach((term, index) => {
    const token = getSafeString(term.text, "");

    if (!token) {
      return;
    }

    const position = getTokenPosition(
      sentenceText,
      token,
      searchIndex
    );

    searchIndex = position.end;

    const normal = getSafeString(
      term.normal,
      token.toLowerCase()
    );

    const lemma = getSafeString(
      term.implicit,
      normal
    );

    /*
     * Get the actual live Compromise term.
     */
    const currentTerm = termView.eq(index);

    /*
     * Detect POS using Compromise's tag matcher.
     */
    const pos = getPOS(currentTerm);

    tokens.push({
      text: token,
      normal,
      lemma,
      pos,
      start: sentenceStart + position.start,
      end: sentenceStart + position.end,
    });
  });

  return {
    text: sentenceText,
    start: sentenceStart,
    end: sentenceStart + sentenceText.length,
    tokens,
  };
}

function extractNegations(
  sentences: SentenceAnalysis[]
): NegationAnalysis[] {
  const negations: NegationAnalysis[] = [];

  for (const sentence of sentences) {
    const document = nlp(sentence.text);

    const negativeTerms = document
      .match("(not|never|no|neither|nor|hardly|barely)")
      .terms()
      .json();

    for (const term of negativeTerms) {
      const token = getSafeString(term.text, "");

      if (!token) {
        continue;
      }

      const tokenIndex = sentence.tokens.findIndex(
        (item) => item.text === token
      );

      if (tokenIndex === -1) {
        continue;
      }

      const relativeStart = sentence.text.indexOf(token);

      if (relativeStart === -1) {
        continue;
      }

      const target = sentence.tokens
        .slice(tokenIndex + 1, tokenIndex + 4)
        .map((item) => item.text)
        .join(" ");

      negations.push({
        text: token,
        target,
        start: sentence.start + relativeStart,
        end:
          sentence.start +
          relativeStart +
          token.length,
      });
    }
  }

  return negations;
}

export function analyseGrammar(
  text: string
): GrammerAnalysis {
  const document = nlp(text);

  const sentenceJson = document
    .sentences().json();
    const sentences: SentenceAnalysis[] = [];

  let searchIndex = 0;

  for (const sentence of sentenceJson) {
    const sentenceText = getSafeString(
      sentence.text,
      ""
    );

    if (!sentenceText) {
      continue;
    }

    const start = text.indexOf(
      sentenceText,
      searchIndex
    );

    const sentenceStart =
      start === -1 ? searchIndex : start;

    sentences.push(
      analyseSentence(
        sentenceText,
        sentenceStart
      )
    );

    searchIndex =
      sentenceStart + sentenceText.length;
  }

  const tokens = sentences.flatMap(
    (sentence) => sentence.tokens
  );

  const nouns = tokens
    .filter((token) => token.pos === "NOUN")
    .map((token) => token.text);

  const verbs = tokens
    .filter(
      (token) =>
        token.pos === "VERB" ||
        token.pos === "AUXILIARY"
    )
    .map((token) => token.text);

  const adjectives = tokens
    .filter(
      (token) => token.pos === "ADJECTIVE"
    )
    .map((token) => token.text);

  const adverbs = tokens
    .filter(
      (token) => token.pos === "ADVERB"
    )
    .map((token) => token.text);

  const negations =
    extractNegations(sentences);

  return {
    sentences,
    token: tokens,
    nouns,
    verbs,
    adjectives,
    adverbs,
    negations,
  };
}