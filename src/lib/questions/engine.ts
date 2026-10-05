import { questionBank } from "./bank";

import type {
  AnswerRecord,
  ChatMessage,
  DailyQuestionSession,
  Question,
  QuestionCategory,
  SignalKey,
  TimeSlot,
} from "./types";

import {
  MIN_DAILY_QUESTIONS,
  MAX_DAILY_QUESTIONS,
} from "./types";

// --------------------------------------------------
// DATE / TIME
// --------------------------------------------------

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTimeSlot(date = new Date()): TimeSlot {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "evening";
  }

  return "night";
}

// --------------------------------------------------
// SIMPLE RESPONSE SIGNAL DETECTION
// --------------------------------------------------

const signalPatterns: Record<
  SignalKey,
  RegExp
> = {
  sadness:
    /\b(sad|upset|down|low|lonely|hurt|cry|crying|tears|unhappy)\b/i,

  anger:
    /\b(angry|mad|irritated|annoyed|frustrated|rage|furious)\b/i,

  anxiety:
    /\b(anxious|anxiety|nervous|worried|worry|panic|restless|uncertain)\b/i,

  fear:
    /\b(afraid|scared|fear|frightened|terrified)\b/i,

  joy:
    /\b(happy|good|great|excited|relieved|calm|peaceful|glad|fun)\b/i,

  stress:
    /\b(stress|stressed|stressful|pressure|overwhelmed|exhausted)\b/i,

  conflict:
    /\b(argue|argument|fight|fought|fighting|yell|yelled|shout|shouted|scold|conflict|disagree)\b/i,

  social:
    /\b(friend|friends|classmate|teacher|professor|parent|mom|dad|family|sister|brother|partner|roommate|someone|people)\b/i,

  sleep:
    /\b(sleep|slept|sleeping|insomnia|awake|woke|waking)\b/i,

  tiredness:
    /\b(tired|tiredness|exhausted|fatigue|sleepy|drained)\b/i,

  academic:
    /\b(college|class|classes|exam|exams|study|studied|studying|assignment|project|teacher|professor|lecture)\b/i,

  family:
    /\b(family|mother|mom|father|dad|parent|parents|sister|brother)\b/i,

  action:
    /\b(went|left|called|talked|spoke|met|walked|studied|played|stayed|cried|slept|ate|drank|worked|stopped|started|tried|avoided|ignored|helped|watched)\b/i,

  decision:
    /\b(decided|decide|chose|choose|plan|planned|intend|intended|decided not|wanted to|will|won't)\b/i,

  thought:
    /\b(think|thought|thinking|mind|wonder|wondered|overthink|overthinking|remember|remembered|kept thinking)\b/i,

  coping:
    /\b(relax|relaxed|rest|rested|walk|walked|music|exercise|exercised|breathe|breathing|break|watched|talked to|called)\b/i,

  event:
    /\b(today|yesterday|happened|morning|afternoon|evening|tonight|earlier|later|after|before|when|during)\b/i,
};

export function inferSignals(
  text: string
): SignalKey[] {
  const signals: SignalKey[] = [];

  for (const [signal, pattern] of Object.entries(
    signalPatterns
  ) as [SignalKey, RegExp][]) {
    if (pattern.test(text)) {
      signals.push(signal);
    }
  }

  return signals;
}

// --------------------------------------------------
// QUESTION LOOKUP
// --------------------------------------------------

export function getQuestionById(
  id: string | null
): Question | null {
  if (!id) {
    return null;
  }

  return (
    questionBank.find(
      (question) => question.id === id
    ) ?? null
  );
}

// --------------------------------------------------
// INITIAL QUESTION
// --------------------------------------------------

function getOpeningQuestion(
  timeSlot: TimeSlot
): Question {
  const questions = questionBank.filter(
    (question) =>
      question.timeSlots?.includes(timeSlot)
  );

  return questions[0] ?? questionBank[0];
}

// --------------------------------------------------
// CORE AREAS
// --------------------------------------------------

const coreCategories: QuestionCategory[] = [
  "emotion",
  "event",
  "thought",
  "action",
  "social",
  "coping",
];

function getCoveredCategories(
  session: DailyQuestionSession
): Set<QuestionCategory> {
  const covered =
    new Set<QuestionCategory>();

  for (const answer of session.answers) {
    // The category of the question itself
    if (
      coreCategories.includes(
        answer.category
      )
    ) {
      covered.add(answer.category);
    }

    // Additional information found inside
    // the actual response
    for (const signal of answer.signals) {
      switch (signal) {
        case "sadness":
        case "anger":
        case "anxiety":
        case "fear":
        case "joy":
        case "stress":
          covered.add("emotion");
          break;

        case "event":
          covered.add("event");
          break;

        case "thought":
          covered.add("thought");
          break;

        case "action":
          covered.add("action");
          break;

        case "social":
        case "family":
        case "conflict":
          covered.add("social");
          break;

        case "coping":
          covered.add("coping");
          break;

        default:
          break;
      }
    }
  }

  return covered;
}

// --------------------------------------------------
// QUESTION SCORING
// --------------------------------------------------

function scoreQuestion(
  question: Question,
  session: DailyQuestionSession,
  lastAnswer: AnswerRecord | undefined
): number {
  let score =
    question.priority ?? 0;

  const askedIds = new Set(
    session.answers.map(
      (answer) => answer.questionId
    )
  );

  // Never ask the same question again today.
  if (askedIds.has(question.id)) {
    return Number.NEGATIVE_INFINITY;
  }

  const covered =
    getCoveredCategories(session);

  const missingCategories =
    coreCategories.filter(
      (category) =>
        !covered.has(category)
    );

  // Important: fill missing areas.
  if (
    missingCategories.includes(
      question.category
    )
  ) {
    score += 55;
  }

  // Strong follow-up to the most recent response.
  if (lastAnswer) {
    const lastSignals =
      new Set(lastAnswer.signals);

    const hasDirectFollowUp =
      question.followUpFor?.some(
        (signal) =>
          lastSignals.has(signal)
      );

    if (hasDirectFollowUp) {
      score += 80;
    }

    // Weaker follow-up based on anything
    // seen during today's conversation.
    const allSignals =
      new Set<SignalKey>();

    for (const answer of session.answers) {
      for (const signal of answer.signals) {
        allSignals.add(signal);
      }
    }

    const hasHistoricalFollowUp =
      question.followUpFor?.some(
        (signal) =>
          allSignals.has(signal)
      );

    if (hasHistoricalFollowUp) {
      score += 20;
    }

    // Avoid asking the same category repeatedly
    // unless it is clearly a follow-up.
    if (
      question.category ===
      lastAnswer.category
    ) {
      const directFollowUp =
        question.followUpFor?.some(
          (signal) =>
            lastSignals.has(signal)
        );

      if (!directFollowUp) {
        score -= 25;
      }
    }
  }

  return score;
}

// --------------------------------------------------
// NEXT QUESTION
// --------------------------------------------------

export function selectNextQuestion(
  session: DailyQuestionSession
): Question | null {
  if (
    session.questionCount >=
    MAX_DAILY_QUESTIONS
  ) {
    return null;
  }

  const lastAnswer =
    session.answers[
      session.answers.length - 1
    ];

  let bestQuestion: Question | null =
    null;

  let bestScore =
    Number.NEGATIVE_INFINITY;

  for (const question of questionBank) {
    const score = scoreQuestion(
      question,
      session,
      lastAnswer
    );

    if (score > bestScore) {
      bestScore = score;
      bestQuestion = question;
    }
  }

  return bestQuestion;
}

// --------------------------------------------------
// DECIDE WHETHER 7 QUESTIONS ARE ENOUGH
// --------------------------------------------------

function shouldFinishAfterMinimum(
  session: DailyQuestionSession
): boolean {
  if (
    session.questionCount <
    MIN_DAILY_QUESTIONS
  ) {
    return false;
  }

  if (
    session.questionCount >=
    MAX_DAILY_QUESTIONS
  ) {
    return true;
  }

  const covered =
    getCoveredCategories(session);

  // We want reasonable coverage before
  // finishing at question 7.
  if (covered.size < 5) {
    return false;
  }

  // If the last response contains a strong
  // signal and a relevant unanswered follow-up
  // exists, continue the conversation.
  const lastAnswer =
    session.answers[
      session.answers.length - 1
    ];

  const strongSignals: SignalKey[] = [
    "sadness",
    "anger",
    "anxiety",
    "fear",
    "stress",
    "conflict",
  ];

  const hasStrongSignal =
    lastAnswer?.signals.some(
      (signal) =>
        strongSignals.includes(signal)
    );

  if (hasStrongSignal) {
    const possibleFollowUp =
      questionBank.some(
        (question) =>
          !session.answers.some(
            (answer) =>
              answer.questionId ===
              question.id
          ) &&
          question.followUpFor?.some(
            (signal) =>
              lastAnswer.signals.includes(
                signal
              )
          )
      );

    if (possibleFollowUp) {
      return false;
    }
  }

  return true;
}

// --------------------------------------------------
// SESSION CREATION
// --------------------------------------------------

function createChatMessage(
  role: "assistant" | "user",
  text: string
): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,

    role,
    text,
    timestamp:
      new Date().toISOString(),
  };
}

export function createDailySession(
  date = new Date()
): DailyQuestionSession {
  const dateKey =
    getDateKey(date);

  const timeSlot =
    getTimeSlot(date);

  const firstQuestion =
    getOpeningQuestion(timeSlot);

  const now =
    new Date().toISOString();

  return {
    version: 1,

    sessionId:
      `manomitra-${dateKey}-${Date.now()}`,

    dateKey,

    timeSlot,

    questionCount: 0,

    currentQuestionId:
      firstQuestion.id,

    answers: [],

    messages: [
      createChatMessage(
        "assistant",
        firstQuestion.text
      ),
    ],

    completed: false,

    createdAt: now,

    updatedAt: now,
  };
}

// --------------------------------------------------
// SAVE AN ANSWER + SELECT NEXT QUESTION
// --------------------------------------------------

export function answerCurrentQuestion(
  session: DailyQuestionSession,
  answerText: string
): DailyQuestionSession {
  const question =
    getQuestionById(
      session.currentQuestionId
    );

  if (!question) {
    return session;
  }

  if (session.completed) {
    return session;
  }

  if (
    session.questionCount >=
    MAX_DAILY_QUESTIONS
  ) {
    return {
      ...session,
      completed: true,
      currentQuestionId: null,
      updatedAt:
        new Date().toISOString(),
    };
  }

  const signals =
    inferSignals(answerText);

  const answerRecord: AnswerRecord = {
    questionId: question.id,
    question: question.text,
    answer: answerText,
    timestamp:
      new Date().toISOString(),
    signals,
    category: question.category,
  };

  const updatedSession: DailyQuestionSession =
    {
      ...session,

      questionCount:
        session.questionCount + 1,

      currentQuestionId: null,

      answers: [
        ...session.answers,
        answerRecord,
      ],

      messages: [
        ...session.messages,

        createChatMessage(
          "user",
          answerText
        ),
      ],

      updatedAt:
        new Date().toISOString(),
    };

  // --------------------------------------------------
  // STOP AFTER 7 IF CONVERSATION COVERAGE
  // IS ALREADY GOOD.
  // --------------------------------------------------

  if (
    shouldFinishAfterMinimum(
      updatedSession
    )
  ) {
    return {
      ...updatedSession,

      completed: true,

      messages: [
        ...updatedSession.messages,

        createChatMessage(
          "assistant",
          "Thank you for sharing. That is enough for today's conversation."
        ),
      ],

      updatedAt:
        new Date().toISOString(),
    };
  }

  // --------------------------------------------------
  // OTHERWISE SELECT NEXT QUESTION
  // --------------------------------------------------

  const nextQuestion =
    selectNextQuestion(
      updatedSession
    );

  if (!nextQuestion) {
    return {
      ...updatedSession,

      completed: true,

      messages: [
        ...updatedSession.messages,

        createChatMessage(
          "assistant",
          "Thank you for sharing. We have completed today's conversation."
        ),
      ],

      updatedAt:
        new Date().toISOString(),
    };
  }

  return {
    ...updatedSession,

    currentQuestionId:
      nextQuestion.id,

    messages: [
      ...updatedSession.messages,

      createChatMessage(
        "assistant",
        nextQuestion.text
      ),
    ],

    updatedAt:
      new Date().toISOString(),
  };
}