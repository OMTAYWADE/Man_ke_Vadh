import type { DailyQuestionSession } from "./types";
import { getDateKey } from "./engine";

const STORAGE_KEY =
  "manomitra-daily-question-session-v1";

export function loadDailySession():
  | DailyQuestionSession
  | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    const session =
      JSON.parse(
        raw
      ) as DailyQuestionSession;

    // Wrong cache version
    if (session.version !== 1) {
      window.localStorage.removeItem(
        STORAGE_KEY
      );

      return null;
    }

    // Old day's session
    if (
      session.dateKey !==
      getDateKey()
    ) {
      window.localStorage.removeItem(
        STORAGE_KEY
      );

      return null;
    }

    return session;
  } catch (error) {
    console.error(
      "Failed to read ManoMitra cache:",
      error
    );

    return null;
  }
}

export function saveDailySession(
  session: DailyQuestionSession
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(session)
    );
  } catch (error) {
    console.error(
      "Failed to save ManoMitra cache:",
      error
    );
  }
}

export function clearDailySession(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    STORAGE_KEY
  );
}