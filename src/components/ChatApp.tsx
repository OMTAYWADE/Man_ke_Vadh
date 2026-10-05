"use client";

import { useEffect, useState } from "react";

import BackgroundSelector from "./Background";
import ChatHeader from "./Header";
import FloatingMessage from "./FloatingMessage";
import ChatInput from "./ChatInput";
import AnalysisPanel from "./AnalysisPanel";

import type { NLPAnalysis } from "@/lib/nlp/types";

import {
  answerCurrentQuestion,
  createDailySession,
  loadDailySession,
  saveDailySession,
} from "@/lib/questions";

import type { DailyQuestionSession } from "@/lib/questions";

export default function ChatApp() {
  // --------------------------------------------------
  // DAILY SESSION
  // --------------------------------------------------

  const [session, setSession] =
    useState<DailyQuestionSession | null>(null);

  // --------------------------------------------------
  // INPUT
  // --------------------------------------------------

  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // NLP ANALYSIS
  // --------------------------------------------------

  const [analysis, setAnalysis] =
    useState<NLPAnalysis | null>(null);

  const [analysisOpen, setAnalysisOpen] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  // --------------------------------------------------
  // LOAD TODAY'S SESSION
  // --------------------------------------------------

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedSession = loadDailySession();

      if (savedSession) {
        setSession(savedSession);
        return;
      }

      const newSession = createDailySession();

      saveDailySession(newSession);

      setSession(newSession);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // --------------------------------------------------
  // SEND RESPONSE
  // --------------------------------------------------

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !session ||
      session.completed ||
      analyzing
    ) {
      return;
    }

    // ----------------------------------------------
    // SAVE ANSWER + DECIDE NEXT QUESTION
    // ----------------------------------------------

    const updatedSession =
      answerCurrentQuestion(
        session,
        trimmedMessage
      );

    setSession(updatedSession);

    saveDailySession(updatedSession);

    setMessage("");

    // ----------------------------------------------
    // NLP ANALYSIS
    // ----------------------------------------------

    try {
      setAnalyzing(true);

      const response = await fetch("/api/nlp", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          text: trimmedMessage,
        }),
      });

      const rawResponse = await response.text();

      let data: {
        success?: boolean;
        analysis?: NLPAnalysis;
        error?: string;
      };

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `NLP API returned invalid JSON. HTTP ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "NLP analysis failed."
        );
      }

      console.log(
        "NLP Analysis:",
        data.analysis
      );

      setAnalysis(
        data.analysis ?? null
      );

      // Automatically open after a response
      setAnalysisOpen(true);
    } catch (error) {
      console.error(
        "Text analysis failed:",
        error
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // --------------------------------------------------
  // WAIT FOR SESSION
  // --------------------------------------------------

  if (!session) {
    return (
      <main className="relative flex h-dvh items-center justify-center overflow-hidden">
        <BackgroundSelector />

        <div className="relative z-20 rounded-2xl border border-white/40 bg-white/50 px-6 py-4 text-sm text-slate-700 shadow-xl backdrop-blur-xl">
          Preparing today's conversation...
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN APPLICATION
  // --------------------------------------------------

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundSelector />

      <ChatHeader />

      {/* ================================================== */}
      {/* ANALYSIS PANEL */}
      {/* ================================================== */}

      <AnalysisPanel
        analysis={analysis}
        answers={session.answers}
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />

      {/* ================================================== */}
      {/* OPEN ANALYSIS BUTTON */}
      {/* ================================================== */}

      {!analysisOpen && (
        <button
          type="button"
          onClick={() => setAnalysisOpen(true)}
          className="
            group
            fixed
            left-4
            top-[88px]
            z-50

            flex
            h-11
            w-11
            items-center
            justify-center

            rounded-2xl

            border
            border-white/20

            bg-slate-950/70
            backdrop-blur-xl

            text-emerald-300

            shadow-[0_0_28px_rgba(16,185,129,0.18)]

            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:border-emerald-300/30
            hover:bg-slate-950/85
            hover:text-emerald-200
            hover:shadow-[0_0_35px_rgba(16,185,129,0.28)]

            active:scale-90
          "
          aria-label="Open response analysis"
          title="Open response analysis"
        >
          {/* Glow */}

          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-400/5 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

          {/* Hamburger */}

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M5 7h14" />
            <path d="M5 12h14" />
            <path d="M5 17h9" />
          </svg>
        </button>
      )}

      {/* ================================================== */}
      {/* QUESTION COUNTER */}
      {/* ================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-5
          top-24
          z-30

          rounded-full
          border
          border-white/40
          bg-white/40

          px-4
          py-2

          text-xs
          font-medium
          text-slate-700

          shadow-lg
          backdrop-blur-xl
        "
      >
        {session.questionCount} / 10
      </div>

      {/* ================================================== */}
      {/* CHAT */}
      {/* ================================================== */}

      <section
        className={`
          relative
          z-10
          flex
          flex-1
          overflow-y-auto

          px-5
          py-8

          transition-all
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            analysisOpen
              ? "lg:ml-[40vw]"
              : "lg:ml-0"
          }
        `}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col justify-end gap-5">
          {session.messages.map(
            (chatMessage) => (
              <div
                key={chatMessage.id}
                className={`flex w-full ${
                  chatMessage.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="max-w-[82%]">
                  <FloatingMessage
                    message={
                      chatMessage.text
                    }
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* INPUT */}
      {/* ================================================== */}

      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={sendMessage}
      />

      {/* ================================================== */}
      {/* COMPLETED */}
      {/* ================================================== */}

      {session.completed && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/40 bg-white/55 px-5 py-2 text-xs text-slate-700 shadow-xl backdrop-blur-xl">
          Today's conversation is complete.
        </div>
      )}
    </main>
  );
}