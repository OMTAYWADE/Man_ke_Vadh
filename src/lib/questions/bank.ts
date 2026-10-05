import type { Question } from "./types";

export const questionBank: Question[] = [
  // --------------------------------------------------
  // OPENING QUESTIONS - TIME BASED
  // --------------------------------------------------

  {
    id: "opening-morning",
    text: "How are you feeling this morning?",
    category: "emotion",
    timeSlots: ["morning"],
    priority: 100,
  },

  {
    id: "opening-afternoon",
    text: "How has your day been so far?",
    category: "event",
    timeSlots: ["afternoon"],
    priority: 100,
  },

  {
    id: "opening-evening",
    text: "How was your day overall?",
    category: "reflection",
    timeSlots: ["evening"],
    priority: 100,
  },

  {
    id: "opening-night",
    text: "Before you finish your day, what is on your mind?",
    category: "thought",
    timeSlots: ["night"],
    priority: 100,
  },

  // --------------------------------------------------
  // EMOTION / TRIGGER
  // --------------------------------------------------

  {
    id: "emotion-cause",
    text: "What happened that made you feel that way?",
    category: "trigger",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
      "joy",
    ],
    priority: 10,
  },

  {
    id: "trigger",
    text: "What was happening just before you started feeling that way?",
    category: "trigger",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
    ],
    priority: 9,
  },

  {
    id: "emotional_change",
    text: "Did your feelings change at any point during the day?",
    category: "emotion",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
      "joy",
    ],
    priority: 8,
  },

  // --------------------------------------------------
  // EVENT
  // --------------------------------------------------

  {
    id: "important-event",
    text: "What was the most important thing that happened today?",
    category: "event",
    followUpFor: ["event"],
    priority: 9,
  },

  {
    id: "consequence",
    text: "What happened after that?",
    category: "event",
    followUpFor: [
      "event",
      "action",
      "conflict",
    ],
    priority: 8,
  },

  {
    id: "frequency",
    text: "Has this been happening often, or was it mainly today?",
    category: "reflection",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
      "conflict",
    ],
    priority: 7,
  },

  // --------------------------------------------------
  // THOUGHT
  // --------------------------------------------------

  {
    id: "thought",
    text: "What was going through your mind at that moment?",
    category: "thought",
    followUpFor: [
      "thought",
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
    ],
    priority: 10,
  },

  {
    id: "repeated-thought",
    text: "Was there any thought that kept coming back to you?",
    category: "thought",
    followUpFor: [
      "thought",
      "anxiety",
      "stress",
      "sadness",
    ],
    priority: 8,
  },

  // --------------------------------------------------
  // ACTION
  // --------------------------------------------------

  {
    id: "response-action",
    text: "What did you do after that happened?",
    category: "action",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
      "event",
      "conflict",
    ],
    priority: 10,
  },

  {
    id: "reaction",
    text: "How did you respond to what happened?",
    category: "action",
    followUpFor: [
      "event",
      "conflict",
      "anger",
      "stress",
    ],
    priority: 9,
  },

  // --------------------------------------------------
  // SOCIAL
  // --------------------------------------------------

  {
   id: "social-impact",
    text: "Did anyone's words or actions affect how you felt today?",
    category: "social",
    followUpFor: [
      "social",
      "conflict",
      "family",
    ],
    priority: 10,
  },

  {
    id: "social-support",
    text: "Did you talk to anyone about what was on your mind?",
    category: "social",
    followUpFor: [
      "social",
      "sadness",
      "stress",
      "anxiety",
    ],
    priority: 8,
  },

  // --------------------------------------------------
  // DECISION
  // --------------------------------------------------

  {
    id: "decision",
    text: "Did you make any decision because of what happened?",
    category: "decision",
    followUpFor: [
      "decision",
      "event",
      "conflict",
    ],
    priority: 9,
  },

  {
    id: "consideration",
    text: "Was there something you considered doing but decided not to?",
    category: "decision",
    followUpFor: [
      "decision",
      "thought",
      "conflict",
    ],
    priority: 7,
  },

  // --------------------------------------------------
  // COPING
  // --------------------------------------------------

  {
    id: "coping",
    text: "What helped you feel a little better, even briefly?",
    category: "coping",
    followUpFor: [
      "sadness",
      "anger",
      "anxiety",
      "fear",
      "stress",
    ],
    priority: 10,
  },

  {
    id: "break",
    text: "Did you do anything that helped you get some space from the situation?",
    category: "coping",
    followUpFor: [
      "stress",
      "anger",
      "anxiety",
      "conflict",
    ],
    priority: 8,
  },

  // --------------------------------------------------
  // SLEEP / ACADEMIC / FAMILY CONTEXT
  // --------------------------------------------------

  {
    id: "sleep",
    text: "Did your sleep affect how you felt or functioned today?",
    category: "event",
    followUpFor: ["sleep", "stress", "tiredness"],
    priority: 8,
  } as Question,

  {
    id: "academic",
    text: "Did college, studies, or work affect how you felt today?",
    category: "event",
    followUpFor: ["academic", "stress", "anxiety"],
    priority: 8,
  },

  {
    id: "family",
    text: "Did anything at home or with your family affect your day?",
    category: "social",
    followUpFor: ["family", "conflict"],
    priority: 8,
  },

  // --------------------------------------------------
  // POSITIVE SIDE
  // --------------------------------------------------

  {
    id: "positive-moment",
    text: "Was there any moment today that made you feel good?",
    category: "emotion",
    followUpFor: ["joy"],
    priority: 7,
  },

  {
    id: "small-win",
    text: "Was there anything today that went better than you expected?",
    category: "reflection",
    followUpFor: ["joy"],
    priority: 6,
  },

  // --------------------------------------------------
  // REFLECTION
  // --------------------------------------------------

  {
    id: "important-moment",
    text: "Looking back, which moment from today stands out the most?",
    category: "reflection",
    followUpFor: ["event", "thought"],
    priority: 6,
  },

  {
    id: "tomorrow",
    text: "Is there anything you would like to handle differently tomorrow?",
    category: "reflection",
    followUpFor: ["decision", "thought", "stress"],
    priority: 5,
  },
];