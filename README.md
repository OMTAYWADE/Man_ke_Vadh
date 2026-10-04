# Mano_ke_Vadh

### AI-Assisted Mental Health Conversation & Observation System

> A conversation-based system that helps organize a person's responses into meaningful observations, patterns, and conversational journeys for better understanding over time.

---

## Overview

ManoMitra is a mental-health observation and conversation system designed around a simple problem:

A doctor may have limited time with a patient, while the patient's experiences, emotions, situations, and thoughts can change throughout the days between consultations.

Instead of relying only on a short conversation during a consultation, ManoMitra allows a person to share their experiences through a simple conversational interface.

The system analyzes each response and extracts structured information such as:

- Language structure
- Important words
- Temporal information
- Conditions or reported states
- Decisions
- Actions
- Causes and relationships
- Negations
- Other meaningful patterns

The analyzed information is then organized into a visual response journey.

The goal is **not to diagnose a person or replace a doctor**.

The system is intended to organize conversational information so that important observations can be easier to review.

---

# Problem Statement

Mental-health conversations can contain a large amount of information:

- What happened
- When it happened
- What the person felt
- What caused a reaction
- What decision was made
- What action was taken
- What happened afterward
- Who was involved
- How the situation changed

During a short consultation, remembering and reviewing every detail can be difficult.

A simple numerical score also cannot represent the complete context of a person's experience.

For example:

> "My friend ignored me during lunch, so I felt lonely and frustrated. I decided to leave college and went home."

A single score cannot properly represent the relationship between:

```text
Friend ignored me
        ↓
Situation / Trigger
        ↓
Lonely
        ↓
Frustrated
        ↓
Decision
        ↓
Leave college
        ↓
Action
        ↓
Went home
