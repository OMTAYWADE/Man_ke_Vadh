"use client";

import { useMemo, useState } from "react";

import type { AnswerRecord } from "@/lib/questions";

import {
  analyzeResponses,
  journeyStateLabels,
  signalLabels,
} from "@/lib/questions/responseAnalysis";

type ViewMode =
  | "patient"
  | "guardian";

interface ResponseInsightsProps {
  answers?: AnswerRecord[];
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

function getStateY(
  state: string
): number {
  const index =
    stateOrder.indexOf(
      state as (typeof stateOrder)[number]
    );

  if (index === -1) {
    return 120;
  }

  return 25 + index * 27;
}

function getLinePath(
  journey: ReturnType<
    typeof analyzeResponses
  >["journey"]
): string {
  if (journey.length === 0) {
    return "";
  }

  const width = 560;
  const left = 55;
  const right = 20;

  const usableWidth =
    width - left - right;

  if (journey.length === 1) {
    const x = width / 2;

    return `M ${x} ${getStateY(
      journey[0].state
    )}`;
  }

  return journey
    .map((point, index) => {
      const x =
        left +
        (index /
          (journey.length - 1)) *
          usableWidth;

      const y =
        getStateY(point.state);

      return `${
        index === 0 ? "M" : "L"
      } ${x} ${y}`;
    })
    .join(" ");
}

export default function ResponseInsights({
  answers = [],
}: ResponseInsightsProps) {
  const [mode, setMode] =
    useState<ViewMode>("patient");

  const safeAnswers =
    Array.isArray(answers)
      ? answers
      : [];

  const summary = useMemo(
    () =>
      analyzeResponses(
        safeAnswers
      ),
    [safeAnswers]
  );

  if (safeAnswers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/40 p-5 backdrop-blur-xl">
        <p className="text-sm text-slate-600">
          Response insights will appear
          after the first answer.
        </p>
      </div>
    );
  }

  // ==================================================
  // PATIENT VIEW
  // ==================================================

  if (mode === "patient") {
    return (
      <section className="space-y-5">
        {/* MODE */}

        <div className="flex rounded-xl border border-white/40 bg-white/35 p-1">
          <button
            type="button"
            onClick={() =>
              setMode("patient")
            }
            className="flex-1 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm"
          >
            Patient
          </button>

          <button
            type="button"
            onClick={() =>
              setMode("guardian")
            }
            className="flex-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white/50"
          >
            Guardian
          </button>
        </div>

        {/* TITLE */}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Today's conversation
          </p>

          <h3 className="mt-1 text-xl font-semibold text-slate-800">
            Your response journey
          </h3>

          <p className="mt-1 text-xs text-slate-600">
            {summary.totalResponses}{" "}
            response
            {summary.totalResponses !== 1
              ? "s"
              : ""}{" "}
            analyzed
          </p>
        </div>

        {/* GRAPH */}

        <JourneyGraph
          summary={summary}
        />

        {/* IMPORTANT */}

        {summary.importantObservations
          .length > 0 && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Important points
            </h4>

            <div className="space-y-2">
              {summary.importantObservations.map(
                (
                  observation,
                  index
                ) => (
                  <div
                    key={`${observation.title}-${index}`}
                    className="rounded-xl border border-white/50 bg-white/45 p-3"
                  >
                    <p className="text-xs font-semibold text-slate-800">
                      {
                        observation.title
                      }
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {
                        observation.detail
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* THEMES */}

        {summary.recurringThemes
          .length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">
              Repeated themes
            </h4>

            <div className="flex flex-wrap gap-2">
              {summary.recurringThemes.map(
                (theme) => (
                  <span
                    key={theme}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800"
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
          </div>
        )}

        {/* COVERAGE */}

        <div className="grid grid-cols-2 gap-2">
          <SmallStat
            label="Emotions"
            value={
              summary.responseCoverage
                .emotions
            }
          />

          <SmallStat
            label="Context"
            value={
              summary.responseCoverage
                .contexts
            }
          />

          <SmallStat
            label="Actions"
            value={
              summary.responseCoverage
                .actions
            }
          />

          <SmallStat
            label="Thoughts"
            value={
              summary.responseCoverage
                .thoughts
            }
          />
        </div>

        <p className="rounded-xl bg-slate-900/5 p-3 text-[11px] leading-5 text-slate-500">
          This reflects what you described
          during the conversation. It is not
          a diagnosis or a mental health
          score.
        </p>
      </section>
    );
  }

  // ==================================================
  // GUARDIAN VIEW
  // ==================================================

  return (
    <section className="space-y-5">
      {/* MODE */}

      <div className="flex rounded-xl border border-white/40 bg-white/35 p-1">
        <button
          type="button"
          onClick={() =>
            setMode("patient")
          }
          className="flex-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white/50"
        >
          Patient
        </button>

        <button
          type="button"
          onClick={() =>
            setMode("guardian")
          }
          className="flex-1 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm"
        >
          Guardian
        </button>
      </div>

      {/* TITLE */}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Conversation overview
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-800">
          What was mentioned today
        </h3>
      </div>

      {/* DIRECTION */}

      <div className="rounded-2xl border border-white/40 bg-white/45 p-4 backdrop-blur-xl">
        <p className="text-xs font-semibold text-slate-700">
          Conversation direction
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {summary.emotionJourney.map(
            (state, index) => (
              <div
                key={`${state}-${index}`}
                className="flex items-center gap-2"
              >
                <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700">
                  {
                    journeyStateLabels[
                      state
                    ]
                  }
                </span>

                {index <
                  summary.emotionJourney
                    .length -
                    1 && (
                  <span className="text-slate-400">
                    →
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* MAIN THEMES */}

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">
          Main themes
        </h4>

        {summary.recurringThemes
          .length > 0 ? (
          <div className="space-y-2">
            {summary.recurringThemes.map(
              (theme) => (
                <div
                  key={theme}
                  className="rounded-xl border border-white/50 bg-white/45 p-3"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {
                      signalLabels[
                        theme
                      ]
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    This topic appeared in
                    multiple responses.
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="rounded-xl bg-white/40 p-3 text-xs text-slate-600">
            No repeated theme has emerged
            so far.
          </p>
        )}
      </div>

      {/* SUPPORTIVE */}

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">
          Supportive information
        </h4>

        <div className="space-y-2">
          {summary.helpfulActions >
            0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900">
                Helpful actions mentioned
              </p>

              <p className="mt-1 text-xs text-emerald-800/80">
                {summary.helpfulActions}{" "}
                response
                {summary.helpfulActions !==
                1
                  ? "s"
                  : ""}{" "}
                included something that
                helped.
              </p>
            </div>
          )}

          {summary.emotionJourney.includes(
            "joy"
          ) && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs font-semibold text-sky-900">
                Positive experience
                mentioned
              </p>

              <p className="mt-1 text-xs text-sky-800/80">
                A positive feeling or
                experience appeared in the
                conversation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* LATEST */}

      <div className="rounded-2xl border border-white/50 bg-white/55 p-4">
        <p className="text-xs font-semibold text-slate-700">
          Latest conversation state
        </p>

        <p className="mt-2 text-lg font-semibold text-slate-800">
          {
            journeyStateLabels[
              summary.latestState
            ]
          }
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          This describes what was mentioned
          most recently. It is not a
          severity or clinical assessment.
        </p>
      </div>

      <div className="rounded-xl bg-slate-900/5 p-3 text-[11px] leading-5 text-slate-500">
        Guardian view shows broad
        conversation patterns rather than
        private raw responses.
      </div>
    </section>
  );
}

// ==================================================
// JOURNEY GRAPH
// ==================================================

function JourneyGraph({
  summary,
}: {
  summary: ReturnType<
    typeof analyzeResponses
  >;
}) {
  const width = 560;
  const height = 220;

  const left = 55;
  const right = 20;

  const path = getLinePath(
    summary.journey
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/50 p-3 backdrop-blur-xl">
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-700">
          Response journey
        </p>

        <p className="mt-1 text-[11px] text-slate-500">
          Each point represents one
          response. The vertical position is
          categorical, not a clinical score.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[520px] w-full"
          role="img"
          aria-label="Conversation response journey"
        >
          {stateOrder.map(
            (state) => {
              const y =
                getStateY(state);

              return (
                <g key={state}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y}
                    y2={y}
                    stroke="rgba(100,116,139,0.15)"
                    strokeWidth="1"
                  />

                  <text
                    x="0"
                    y={y + 4}
                    fontSize="10"
                    fill="rgba(51,65,85,0.65)"
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

          {summary.journey.length >
            1 && (
            <path
              d={path}
              fill="none"
              stroke="rgba(16,185,129,0.75)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {summary.journey.map(
            (point, index) => {
              const x =
                summary.journey.length ===
                1
                  ? width / 2
                  : left +
                    (index /
                      (summary.journey
                        .length -
                        1)) *
                      (width -
                        left -
                        right);

              const y =
                getStateY(
                  point.state
                );

              return (
                <g
                  key={`${point.responseNumber}-${point.state}`}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="white"
                    stroke="rgba(5,150,105,0.9)"
                    strokeWidth="3"
                  />

                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgba(51,65,85,0.7)"
                  >
                    R
                    {
                      point.responseNumber
                    }
                  </text>
                </g>
              );
            }
          )}
        </svg>
      </div>

      {/* RESPONSE DETAILS */}

      <div className="mt-4 space-y-2">
        {summary.journey.map(
          (point) => (
            <div
              key={
                point.responseNumber
              }
              className="rounded-xl border border-white/50 bg-white/45 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-800">
                  Response{" "}
                  {
                    point.responseNumber
                  }
                </span>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                  {
                    journeyStateLabels[
                      point.state
                    ]
                  }
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                {point.answerPreview}
              </p>

              {point.importantSignals
                .length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {point.importantSignals.map(
                    (signal) => (
                      <span
                        key={signal}
                        className="rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-600"
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
    </div>
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
    <div className="rounded-xl border border-white/50 bg-white/45 p-3">
      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}