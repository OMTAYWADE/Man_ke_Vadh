"use client";

import { useMemo, useState } from "react";

import type { NLPAnalysis } from "@/lib/nlp/types";
import type { AnswerRecord } from "@/lib/questions";

import {
  analyzeResponses,
  journeyStateLabels,
  signalLabels,
} from "@/lib/questions/responseAnalysis";

interface AnalysisPanelProps {
  analysis: NLPAnalysis | null;
  answers: AnswerRecord[];
  open: boolean;
  onClose: () => void;
}

const stateOrder = [
  "joy",
  "neutral",
  "stress",
  "anxiety",
  "fear",
  "sadness",
  "anger",
] as const;

const importantSignals = [
  "joy",
  "sadness",
  "anger",
  "anxiety",
  "fear",
  "stress",
  "academic",
  "family",
  "social",
  "conflict",
  "sleep",
  "thought",
  "action",
  "decision",
  "coping",
] as const;

function getStateY(state: string): number {
  const index = stateOrder.indexOf(
    state as (typeof stateOrder)[number]
  );

  if (index === -1) {
    return 135;
  }

  return 28 + index * 32;
}

function getX(
  index: number,
  total: number,
  width: number
): number {
  const left = 70;
  const right = 25;

  if (total <= 1) {
    return width / 2;
  }

  return (
    left +
    (index / (total - 1)) *
      (width - left - right)
  );
}

function buildJourneyPath(
  journey: ReturnType<typeof analyzeResponses>["journey"],
  width: number
): string {
  if (journey.length < 2) {
    return "";
  }

  return journey
    .map((point, index) => {
      const x = getX(
        index,
        journey.length,
        width
      );

      const y = getStateY(point.state);

      return `${
        index === 0 ? "M" : "L"
      } ${x} ${y}`;
    })
    .join(" ");
}

export default function AnalysisPanel({
  analysis,
  answers,
  open,
  onClose,
}: AnalysisPanelProps) {
  const [showMore, setShowMore] =
    useState(false);

  const safeAnswers = Array.isArray(
    answers
  )
    ? answers
    : [];

  const summary = useMemo(
    () => analyzeResponses(safeAnswers),
    [safeAnswers]
  );

  const journey = summary.journey;

  // ------------------------------------------------
  // SIGNAL COUNTS
  // ------------------------------------------------

  const signalCounts = useMemo(() => {
    const counts =
      new Map<string, number>();

    for (const answer of safeAnswers) {
      for (const signal of answer.signals) {
        counts.set(
          signal,
          (counts.get(signal) ?? 0) + 1
        );
      }
    }

    return importantSignals
      .map((signal) => ({
        signal,
        count:
          counts.get(signal) ?? 0,
      }))
      .filter(
        (item) => item.count > 0
      )
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 7);
  }, [safeAnswers]);

  // ------------------------------------------------
  // GRAPH
  // ------------------------------------------------

  const width = 700;
  const height = 270;

  const journeyPath =
    buildJourneyPath(
      journey,
      width
    );

  return (
    <aside
      className={`
        fixed
        left-0
        top-[72px]
        bottom-[78px]
        z-40
        w-[min(40vw,620px)]
        min-w-[420px]
        overflow-hidden

        border-r
        border-white/10

        bg-slate-950/75
        text-white

        shadow-[18px_0_70px_rgba(0,0,0,0.45)]

        backdrop-blur-2xl

        transition-transform
        duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]

        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        {/* glow */}

        <div className="pointer-events-none absolute left-4 top-0 h-16 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-emerald-300/80">
            ManoMitra
          </p>

          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-white">
            Response analysis
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            group
            relative
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full

            border
            border-white/10

            bg-white/5

            text-white/60

            shadow-[0_0_20px_rgba(16,185,129,0.04)]

            transition
            duration-200

            hover:border-emerald-300/30
            hover:bg-emerald-400/10
            hover:text-white

            active:scale-90
          "
          aria-label="Close analysis panel"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* ================================================== */}
      {/* SCROLL AREA */}
      {/* ================================================== */}

      <div
        className="
          h-[calc(100%-64px)]
          overflow-y-auto
          px-4
          py-5

          scrollbar-thin
          scrollbar-track-white/5
          scrollbar-thumb-emerald-400/30
          hover:scrollbar-thumb-emerald-300/50
        "
      >
        <div className="space-y-5 pb-8">

          {/* ================================================== */}
          {/* LATEST RESPONSE */}
          {/* ================================================== */}

          {analysis && (
            <section
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.045]
                p-4

                shadow-[0_0_35px_rgba(16,185,129,0.04)]
              "
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Latest response
                  </p>

                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] text-white/45">
                    R{summary.totalResponses}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/80">
                  {analysis.originalText}
                </p>

                {analysis.patterns.length >
                  0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {analysis.patterns
                      .slice(0, 5)
                      .map(
                        (
                          pattern,
                          index
                        ) => (
                          <span
                            key={`${pattern.type}-${index}`}
                            className="
                              rounded-full
                              border
                              border-emerald-300/10
                              bg-emerald-300/[0.08]
                              px-2.5
                              py-1

                              text-[9px]
                              text-emerald-200/70
                            "
                          >
                            {pattern.type}
                          </span>
                        )
                      )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ================================================== */}
          {/* RESPONSE JOURNEY */}
          {/* ================================================== */}

          <section
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-4

              shadow-[0_0_45px_rgba(16,185,129,0.04)]
            "
          >
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Conversation journey
              </p>

              <h3 className="mt-1 text-base font-semibold text-white">
                Response state map
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-white/40">
                Each point represents one response.
                Position shows the state mentioned,
                not severity.
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="min-w-[580px] w-full"
              >
                {/* GRID */}

                {stateOrder.map(
                  (state) => {
                    const y =
                      getStateY(
                        state
                      );

                    return (
                      <g key={state}>
                        <line
                          x1="65"
                          x2={
                            width - 20
                          }
                          y1={y}
                          y2={y}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="1"
                        />

                        <text
                          x="0"
                          y={y + 4}
                          fontSize="10"
                          fill="rgba(255,255,255,0.42)"
                        >
                          {
                            journeyStateLabels[
                              state
                            ]
                          }
                        </text>
                      </g>
                    );
                  }
                )}

                {/* GLOW LINE */}

                {journey.length >
                  1 && (
                  <>
                    <path
                      d={journeyPath}
                      fill="none"
                      stroke="rgba(16,185,129,0.12)"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    <path
                      d={journeyPath}
                      fill="none"
                      stroke="rgba(52,211,153,0.75)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}

                {/* POINTS */}

                {journey.map(
                  (
                    point,
                    index
                  ) => {
                    const x =
                      getX(
                        index,
                        journey.length,
                        width
                      );

                    const y =
                      getStateY(
                        point.state
                      );

                    return (
                      <g
                        key={`${point.responseNumber}-${point.state}`}
                      >
                        {/* glow */}
                        <circle
                          cx={x}
                          cy={y}
                          r="15"
                          fill="rgba(52,211,153,0.08)"
                        />

                        {/* point */}
                        <circle
                          cx={x}
                          cy={y}
                          r="6.5"
                          fill="#071814"
                          stroke="rgba(110,231,183,0.95)"
                          strokeWidth="2.5"
                        />

                        <text
                          x={x}
                          y={
                            height -
                            12
                          }
                          textAnchor="middle"
                          fontSize="9"
                          fill="rgba(255,255,255,0.5)"
                        >
                          R
                          {
                            point.responseNumber
                          }
                        </text>

                        <title>
                          {`Response ${point.responseNumber}: ${
                            journeyStateLabels[
                              point.state
                            ]
                          }\n${point.answerPreview}`}
                        </title>
                      </g>
                    );
                  }
                )}
              </svg>
            </div>

            {/* JOURNEY CHIPS */}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {journey.map(
                (point) => (
                  <span
                    key={
                      point.responseNumber
                    }
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-2.5
                      py-1.5

                      text-[9px]
                      text-white/60
                    "
                  >
                    R
                    {
                      point.responseNumber
                    }{" "}
                    ·{" "}
                    {
                      journeyStateLabels[
                        point.state
                      ]
                    }
                  </span>
                )
              )}
            </div>
          </section>

          {/* ================================================== */}
          {/* PATTERN THRESHOLD */}
          {/* ================================================== */}

          <section
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-4
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Pattern frequency
                </p>

                <h3 className="mt-1 text-base font-semibold text-white">
                  Repeated signals
                </h3>
              </div>

              <span className="rounded-full border border-amber-300/10 bg-amber-300/[0.06] px-2.5 py-1 text-[9px] text-amber-200/60">
                threshold: 2
              </span>
            </div>

            <p className="mt-1 text-[10px] leading-5 text-white/40">
              The threshold only marks patterns
              that appeared in multiple responses.
              It is not a clinical threshold.
            </p>

            <div className="mt-5 space-y-3">
              {signalCounts.map(
                ({
                  signal,
                  count,
                }) => (
                  <div
                    key={signal}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] text-white/65">
                        {
                          signalLabels[
                            signal
                          ]
                        }
                      </span>

                      <span className="text-[9px] text-white/35">
                        {count}
                      </span>
                    </div>

                    <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      {/* threshold */}
                      <div
                        className="
                          absolute
                          bottom-0
                          left-[50%]
                          top-0
                          z-10
                          border-l
                          border-dashed
                          border-amber-300/30
                        "
                      />

                      <div
                        className="
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          from-emerald-500/40
                          via-emerald-300/80
                          to-emerald-200
                          shadow-[0_0_15px_rgba(52,211,153,0.25)]
                          transition-all
                          duration-700
                        "
                        style={{
                          width: `${Math.min(
                            100,
                            (count /
                              Math.max(
                                4,
                                ...signalCounts.map(
                                  (
                                    item
                                  ) =>
                                    item.count
                                )
                              )) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-300/60 shadow-[0_0_8px_rgba(252,211,77,0.3)]" />

              <span className="text-[9px] text-white/35">
                repeated-pattern threshold
              </span>
            </div>
          </section>

          {/* ================================================== */}
          {/* SEE MORE DATA */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={() =>
              setShowMore(
                (current) =>
                  !current
              )
            }
            className="
              group
              flex
              w-full
              items-center
              justify-between

              rounded-2xl
              border
              border-emerald-300/10

              bg-emerald-300/[0.045]

              px-4
              py-3.5

              text-left

              shadow-[0_0_30px_rgba(16,185,129,0.04)]

              transition
              duration-200

              hover:border-emerald-300/20
              hover:bg-emerald-300/[0.07]
            "
          >
            <div>
              <p className="text-xs font-semibold text-white">
                See more data
              </p>

              <p className="mt-0.5 text-[9px] text-white/35">
                Observations, themes and response
                details
              </p>
            </div>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-emerald-300/60 transition-transform duration-300 ${
                showMore
                  ? "rotate-180"
                  : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* ================================================== */}
          {/* EXPANDED DATA */}
          {/* ================================================== */}

          {showMore && (
            <div className="space-y-4">

              {/* IMPORTANT OBSERVATIONS */}

              {summary
                .importantObservations
                .length > 0 && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                  "
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Important observations
                  </p>

                  <div className="mt-3 space-y-2">
                    {summary.importantObservations.map(
                      (
                        observation,
                        index
                      ) => (
                        <div
                          key={`${observation.title}-${index}`}
                          className="
                            rounded-xl
                            border
                            border-white/5
                            bg-white/[0.025]
                            p-3
                          "
                        >
                          <p className="text-[10px] font-semibold text-white/75">
                            {
                              observation.title
                            }
                          </p>

                          <p className="mt-1 text-[10px] leading-5 text-white/40">
                            {
                              observation.detail
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {/* REPEATED THEMES */}

              {summary.recurringThemes
                .length > 0 && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                  "
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Repeated themes
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {summary.recurringThemes.map(
                      (theme) => (
                        <span
                          key={theme}
                          className="
                            rounded-full
                            border
                            border-emerald-300/10
                            bg-emerald-300/[0.06]
                            px-3
                            py-1.5
                            text-[9px]
                            text-emerald-200/70
                          "
                        >
                          {
                            signalLabels[
                              theme
                            ]
                          }
                        </span>
                      )
                    )}
                  </div>
                </section>
              )}

              {/* RESPONSE LIST */}

              <section
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Response details
                  </p>

                  <span className="text-[9px] text-white/30">
                    {
                      safeAnswers.length
                    }{" "}
                    total
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {summary.journey.map(
                    (point) => (
                      <div
                        key={
                          point.responseNumber
                        }
                        className="
                          rounded-xl
                          border
                          border-white/5
                          bg-white/[0.025]
                          p-3
                        "
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold text-white/70">
                            Response{" "}
                            {
                              point.responseNumber
                            }
                          </span>

                          <span className="rounded-full border border-emerald-300/10 bg-emerald-300/[0.06] px-2 py-1 text-[9px] text-emerald-200/70">
                            {
                              journeyStateLabels[
                                point.state
                              ]
                            }
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] leading-5 text-white/40">
                          {
                            point.answerPreview
                          }
                        </p>

                        {point
                          .importantSignals
                          .length >
                          0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {point.importantSignals.map(
                              (
                                signal
                              ) => (
                                <span
                                  key={
                                    signal
                                  }
                                  className="rounded-full bg-white/[0.04] px-2 py-1 text-[8px] text-white/35"
                                >
                                  {
                                    signalLabels[
                                      signal
                                    ]
                                  }
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* COVERAGE */}

              <section
                className="
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <SmallStat
                  label="Emotions"
                  value={
                    summary
                      .responseCoverage
                      .emotions
                  }
                />

                <SmallStat
                  label="Context"
                  value={
                    summary
                      .responseCoverage
                      .contexts
                  }
                />

                <SmallStat
                  label="Actions"
                  value={
                    summary
                      .responseCoverage
                      .actions
                  }
                />

                <SmallStat
                  label="Thoughts"
                  value={
                    summary
                      .responseCoverage
                      .thoughts
                  }
                />
              </section>
            </div>
          )}

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[9px] leading-5 text-white/25">
              This panel summarizes information
              described during the conversation.
              It does not calculate diagnosis,
              severity, or a mental-health score.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ==================================================
// SMALL STAT
// ==================================================

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-white/[0.035]
        p-3
      "
    >
      <p className="text-[9px] text-white/30">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-emerald-200">
        {value}
      </p>
    </div>
  );
}