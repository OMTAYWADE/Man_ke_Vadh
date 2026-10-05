export type TimeSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export type QuestionCategory =
  | "emotion"
  | "event"
  | "trigger"
  | "social"
  | "thought"
  | "action"
  | "decision"
  | "coping"
  | "reflection";

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;

  /**
   * Used for the first question of the day.
   */
  timeSlots?: TimeSlot[];

  /**
   * If the previous response contains one of these signals,
   * this question gets a higher score.
   */
  followUpFor?: SignalKey[];

  priority?: number;
}

export interface AnswerRecord {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
  signals: SignalKey[];
  category: QuestionCategory;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: string;
}

export interface DailyQuestionSession {
  version: 1;

  sessionId: string;

  /**
   * YYYY-MM-DD in the user's local browser timezone.
   */
  dateKey: string;

  timeSlot: TimeSlot;

  /**
   * Number of user answers/questions completed.
   */
  questionCount: number;

  /**
   * Question currently waiting for the user.
   */
  currentQuestionId: string | null;

  answers: AnswerRecord[];

  messages: ChatMessage[];

  completed: boolean;

  createdAt: string;

  updatedAt: string;
}

export const MIN_DAILY_QUESTIONS = 7;
export const MAX_DAILY_QUESTIONS = 10;

export type SignalKey =
  | "sadness"
  | "anger"
  | "anxiety"
  | "fear"
  | "joy"
  | "stress"
  | "conflict"
  | "social"
  | "sleep"
  | "tiredness"
  | "academic"
  | "family"
  | "action"
  | "decision"
  | "thought"
  | "coping"
  | "event";