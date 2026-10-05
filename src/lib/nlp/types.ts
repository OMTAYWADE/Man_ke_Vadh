export interface TextSpan {
  text: string;
  start: number;
  end: number;
}

export type POS =
  | "NOUN"
  | "PROPER_NOUN"
  | "VERB"
  | "AUXILIARY"
  | "ADJECTIVE"
  | "ADVERB"
  | "PRONOUN"
  | "DETERMINER"
  | "PREPOSITION"
  | "CONJUNCTION"
  | "INTERJECTION"
  | "UNKNOWN";

export interface TokenAnalysis {
  text: string;
  normal: string;
  lemma: string;
  pos: POS;
  start: number;
  end: number;
}

export interface SentenceAnalysis {
  text: string;
  start: number;
  end: number;
  tokens: TokenAnalysis[];
}

export interface NegationAnalysis {
  text: string;
  target: string;
  start: number;
  end: number;
}

export interface RegexMatch {
  type: string;
  text: string;
  start: number;
  end: number;
}

export interface GrammerAnalysis {
  sentences: SentenceAnalysis[];
  token: TokenAnalysis[];
  nouns: string[];
  verbs: string[];
  adjectives: string[];
  adverbs: string[];
  negations: NegationAnalysis[];
}

export interface NLPAnalysis {
  originalText: string;
  normalizedText: string;
  grammer: GrammerAnalysis;
  patterns: RegexMatch[];
}