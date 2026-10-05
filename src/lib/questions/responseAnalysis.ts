import type {
  AnswerRecord,
  SignalKey,
} from "./types";

// ==================================================
// SIGNAL GROUPS
// ==================================================

const emotionSignals: SignalKey[] = [
  "joy",
  "sadness",
  "anger",
  "anxiety",
  "fear",
  "stress",
];

const contextSignals: SignalKey[] = [
  "academic",
  "family",
  "social",
  "conflict",
  "sleep",
];

const behaviorSignals: SignalKey[] = [
  "action",
  "coping",
  "decision",
];

const cognitionSignals: SignalKey[] = [
  "thought",
];

// ==================================================
// JOURNEY TYPES
// ==================================================

export type JourneyState =
  | "joy"
  | "sadness"
  | "anger"
  | "anxiety"
  | "fear"
  | "stress"
  | "neutral";

/*
 * Important:
 * neutral is not a SignalKey.
 *
 * Therefore we use an emotion-only type
 * when checking the user's detected signals.
 */
type EmotionJourneyState = Exclude<
  JourneyState,
  "neutral"
>;

// ==================================================
// JOURNEY POINT
// ==================================================

export interface JourneyPoint {
  responseNumber: number;
  state: JourneyState;
  answerPreview: string;
  importantSignals: SignalKey[];
}

// ==================================================
// IMPORTANT OBSERVATION
// ==================================================

export interface ImportantObservation {
  type:
    | "emotion"
    | "context"
    | "action"
    | "thought"
    | "change";

  title: string;
  detail: string;
}

// ==================================================
// RESPONSE SUMMARY
// ==================================================

export interface ResponseSummary {
  totalResponses: number;

  latestState: JourneyState;

  firstState: JourneyState;

  journey: JourneyPoint[];

  emotionJourney: JourneyState[];

  recurringThemes: SignalKey[];

  importantObservations: ImportantObservation[];

  helpfulActions: number;

  responseCoverage: {
    emotions: number;
    contexts: number;
    actions: number;
    thoughts: number;
  };
}

// ==================================================
// SIGNAL LABELS
// ==================================================

export const signalLabels: Record<
  SignalKey,
  string
> = {
  sadness: "Sadness",
  anger: "Anger",
  anxiety: "Anxiety",
  fear: "Fear",
  joy: "Positive feeling",
  stress: "Stress",

  conflict: "Conflict",
  social: "Social interaction",
  sleep: "Sleep",
  tiredness: "Tiredness",

  academic: "College / studies",
  family: "Family",

  action: "Action taken",
  decision: "Decision",
  thought: "Thoughts",
  coping: "Something that helped",
  event: "Important event",
};

// ==================================================
// JOURNEY STATE LABELS
// ==================================================

export const journeyStateLabels: Record<
  JourneyState,
  string
> = {
  joy: "Positive",
  sadness: "Sad",
  anger: "Angry",
  anxiety: "Anxious",
  fear: "Fear",
  stress: "Stressed",
  neutral: "No clear emotion",
};

// ==================================================
// PRIMARY STATE
// ==================================================

export function getPrimaryState(
  signals: SignalKey[] = []
): JourneyState {
  /*
   * IMPORTANT:
   *
   * Do NOT use JourneyState[] here because
   * JourneyState also contains "neutral".
   *
   * Use only actual emotion states.
   */
  const priority: EmotionJourneyState[] = [
    "anger",
    "sadness",
    "anxiety",
    "fear",
    "stress",
    "joy",
  ];

  const found = priority.find(
    (state) => signals.includes(state)
  );

  return found ?? "neutral";
}

// ==================================================
// IMPORTANT SIGNALS
// ==================================================

function getImportantSignals(
  signals: SignalKey[] = []
): SignalKey[] {
  const result: SignalKey[] = [];

  for (const signal of signals) {
    const important =
      emotionSignals.includes(signal) ||
      contextSignals.includes(signal) ||
      behaviorSignals.includes(signal) ||
      cognitionSignals.includes(signal);

    if (
      important &&
      !result.includes(signal)
    ) {
      result.push(signal);
    }
  }

  /*
   * Don't expose every detected signal.
   */
  return result.slice(0, 5);
}

// ==================================================
// ANSWER PREVIEW
// ==================================================

function createPreview(
  text: string = ""
): string {
  const cleaned = text
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 90) {
    return cleaned;
  }

  return `${cleaned.slice(0, 87)}...`;
}

// ==================================================
// BUILD JOURNEY
// ==================================================

export function buildJourney(
  answers: AnswerRecord[] = []
): JourneyPoint[] {
  return answers.map(
    (answer, index) => ({
      responseNumber: index + 1,

      state: getPrimaryState(
        answer?.signals ?? []
      ),

      answerPreview:
        createPreview(
          answer?.answer ?? ""
        ),

      importantSignals:
        getImportantSignals(
          answer?.signals ?? []
        ),
    })
  );
}

// ==================================================
// EMOTION JOURNEY
// ==================================================

function buildEmotionJourney(
  journey: JourneyPoint[]
): JourneyState[] {
  return journey.map(
    (point) => point.state
  );
}

// ==================================================
// FIND RECURRING THEMES
// ==================================================

function findRecurringThemes(
  answers: AnswerRecord[] = []
): SignalKey[] {
  const counts =
    new Map<SignalKey, number>();

  for (const answer of answers) {
    const signals =
      answer?.signals ?? [];

    for (const signal of signals) {
      const importantTheme =
        contextSignals.includes(
          signal
        ) ||
        emotionSignals.includes(
          signal
        );

      if (!importantTheme) {
        continue;
      }

      counts.set(
        signal,
        (counts.get(signal) ?? 0) + 1
      );
    }
  }

  return [...counts.entries()]
    .filter(
      ([, count]) => count >= 2
    )
    .sort(
      (a, b) => b[1] - a[1]
    )
    .map(
      ([signal]) => signal
    )
    .slice(0, 4);
}

// ==================================================
// RESPONSE COVERAGE
// ==================================================

function calculateCoverage(
  answers: AnswerRecord[] = []
) {
  let emotions = 0;
  let contexts = 0;
  let actions = 0;
  let thoughts = 0;

  for (const answer of answers) {
    const signals =
      answer?.signals ?? [];

    // ----------------------------------------------
    // EMOTION
    // ----------------------------------------------

    if (
      signals.some((signal) =>
        emotionSignals.includes(
          signal
        )
      )
    ) {
      emotions++;
    }

    // ----------------------------------------------
    // CONTEXT
    // ----------------------------------------------

    if (
      signals.some((signal) =>
        contextSignals.includes(
          signal
        )
      )
    ) {
      contexts++;
    }

    // ----------------------------------------------
    // ACTION / COPING / DECISION
    // ----------------------------------------------

    if (
      signals.some((signal) =>
        behaviorSignals.includes(
          signal
        )
      )
    ) {
      actions++;
    }

    // ----------------------------------------------
    // THOUGHT
    // ----------------------------------------------

    if (
      signals.includes("thought")
    ) {
      thoughts++;
    }
  }

  return {
    emotions,
    contexts,
    actions,
    thoughts,
  };
}

// ==================================================
// IMPORTANT OBSERVATIONS
// ==================================================

function buildImportantObservations(
  answers: AnswerRecord[] = [],
  journey: JourneyPoint[] = [],
  recurringThemes: SignalKey[] = []
): ImportantObservation[] {
  if (answers.length === 0) {
    return [];
  }

  const observations: ImportantObservation[] =
    [];

  const first = journey[0];

  const latest =
    journey[journey.length - 1];

  // =================================================
  // LATEST STATE
  // =================================================

  if (
    latest &&
    latest.state !== "neutral"
  ) {
    observations.push({
      type: "emotion",

      title: "Latest state mentioned",

      detail:
        journeyStateLabels[
          latest.state
        ],
    });
  }

  // =================================================
  // LATEST CONTEXT
  // =================================================

  const latestAnswer =
    answers[answers.length - 1];

  const latestContexts = (
    latestAnswer?.signals ?? []
  ).filter((signal) =>
    contextSignals.includes(
      signal
    )
  );

  for (const context of latestContexts.slice(
    0,
    2
  )) {
    observations.push({
      type: "context",

      title:
        signalLabels[context],

      detail:
        "This context appeared in the latest response.",
    });
  }

  // =================================================
  // ACTION / COPING
  // =================================================

  const actionAnswers =
    answers.filter((answer) =>
      (answer?.signals ?? []).some(
        (signal) =>
          behaviorSignals.includes(
            signal
          )
      )
    );

  if (actionAnswers.length > 0) {
    const latestAction =
      actionAnswers[
        actionAnswers.length - 1
      ];

    const actionSignal =
      (
        latestAction?.signals ?? []
      ).find((signal) =>
        behaviorSignals.includes(
          signal
        )
      );

    if (actionSignal) {
      observations.push({
        type: "action",

        title:
          signalLabels[
            actionSignal
          ],

        detail:
          "An action, decision, or coping response was described.",
      });
    }
  }

  // =================================================
  // THOUGHT
  // =================================================

  const thoughtAnswer =
    answers.find((answer) =>
      (answer?.signals ?? []).includes(
        "thought"
      )
    );

  if (thoughtAnswer) {
    observations.push({
      type: "thought",

      title: "Thoughts were mentioned",

      detail:
        "The response included information about what was going through the user's mind.",
    });
  }

  // =================================================
  // STATE CHANGE
  // =================================================

  if (
    first &&
    latest &&
    journey.length >= 2 &&
    first.state !== latest.state
  ) {
    observations.push({
      type: "change",

      title: "State changed",

      detail: `${journeyStateLabels[first.state]} → ${journeyStateLabels[latest.state]}`,
    });
  }

  // =================================================
  // REPEATED THEMES
  // =================================================

  for (const theme of recurringThemes.slice(
    0,
    2
  )) {
    observations.push({
      type: "context",

      title:
        signalLabels[theme],

      detail:
        "This theme appeared in multiple responses.",
    });
  }

  /*
   * Keep the user-facing result short.
   */
  return observations.slice(0, 6);
}

// ==================================================
// MAIN RESPONSE ANALYZER
// ==================================================

export function analyzeResponses(
  answers: AnswerRecord[] = []
): ResponseSummary {
  /*
   * Protect against null/undefined data
   * coming from localStorage or UI state.
   */
  const safeAnswers =
    Array.isArray(answers)
      ? answers
      : [];

  const journey =
    buildJourney(safeAnswers);

  const emotionJourney =
    buildEmotionJourney(
      journey
    );

  const recurringThemes =
    findRecurringThemes(
      safeAnswers
    );

  const importantObservations =
    buildImportantObservations(
      safeAnswers,
      journey,
      recurringThemes
    );

  const coverage =
    calculateCoverage(
      safeAnswers
    );

  const latestState =
    journey.length > 0
      ? journey[
          journey.length - 1
        ].state
      : "neutral";

  const firstState =
    journey.length > 0
      ? journey[0].state
      : "neutral";

  const helpfulActions =
    safeAnswers.filter(
      (answer) =>
        (
          answer?.signals ?? []
        ).includes("coping")
    ).length;

  return {
    totalResponses:
      safeAnswers.length,

    latestState,

    firstState,

    journey,

    emotionJourney,

    recurringThemes,

    importantObservations,

    helpfulActions,

    responseCoverage: coverage,
  };
}