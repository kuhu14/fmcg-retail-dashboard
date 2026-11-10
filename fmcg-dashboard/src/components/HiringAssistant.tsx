"use client";

import { useState } from "react";
import { Card } from "./Card";
import { useHrRoster, askHiringAssistant } from "@/hooks/useHr";

interface Turn {
  question: string;
  answer?: string;
  error?: string;
}

const SUGGESTED_PROMPTS = [
  "Who should we hire for the Store Operations Manager role, and why?",
  "Which internal employee is the strongest promotion candidate right now?",
  "Compare the two Trade Marketing Lead candidates.",
  "Is anyone ready for promotion in Supply Chain?",
];

export function HiringAssistant() {
  const { roster, loading: rosterLoading, error: rosterError } = useHrRoster();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [asking, setAsking] = useState(false);

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || asking) return;
    setAsking(true);
    setQuestion("");
    setTurns((prev) => [...prev, { question: trimmed }]);
    try {
      const answer = await askHiringAssistant(trimmed);
      setTurns((prev) =>
        prev.map((t, i) => (i === prev.length - 1 ? { ...t, answer } : t))
      );
    } catch (err) {
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1 ? { ...t, error: (err as Error).message } : t
        )
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Hiring & promotion assistant"
        subtitle="Reasons over open roles, candidates, and promotion-eligible employees"
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
            <span className="text-[11px] text-[var(--chart-muted)]">Open roles</span>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {rosterLoading ? "—" : roster?.openRoles.length ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
            <span className="text-[11px] text-[var(--chart-muted)]">Candidates</span>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {rosterLoading ? "—" : roster?.candidates.length ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2">
            <span className="text-[11px] text-[var(--chart-muted)]">Promotion-ready</span>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {rosterLoading
                ? "—"
                : roster?.employees.filter((e) => e.readyForPromotion).length ?? 0}
            </p>
          </div>
        </div>

        {rosterError && (
          <p className="text-xs text-red-500 mb-3">Couldn&apos;t load roster data: {rosterError}</p>
        )}

        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto mb-3">
          {turns.length === 0 && (
            <p className="text-xs text-[var(--chart-muted)]">
              Ask about any open role or promotion decision — try one of the prompts below.
            </p>
          )}
          {turns.map((t, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-[var(--foreground)] self-end rounded-lg bg-[var(--chart-gridline)]/40 px-3 py-1.5 max-w-[85%]">
                {t.question}
              </p>
              {t.answer && (
                <p className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 max-w-[85%]">
                  {t.answer}
                </p>
              )}
              {t.error && (
                <p className="text-xs text-red-500 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 max-w-[85%]">
                  {t.error}
                </p>
              )}
            </div>
          ))}
          {asking && <p className="text-xs text-[var(--chart-muted)]">Thinking…</p>}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => submit(p)}
              disabled={asking}
              className="text-[11px] rounded-full border border-[var(--card-border)] px-2.5 py-1 text-[var(--chart-muted)] hover:text-[var(--foreground)] hover:border-[var(--chart-axis)] disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(question);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about a hire or a promotion…"
            disabled={asking}
            className="flex-1 text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="text-xs font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </Card>
    </div>
  );
}
