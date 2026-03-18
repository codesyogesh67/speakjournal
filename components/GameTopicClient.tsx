"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/data/topics";
import { Tag } from "@/components/Tag";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function GameTopicClient({ slug }: { slug: string }) {
  const topic = useMemo(() => TOPICS.find((t) => t.slug === slug) ?? null, [
    slug,
  ]);

  const [showHints, setShowHints] = useState(true);
  const [running, setRunning] = useState(false);
  const [durationInput, setDurationInput] = useState("2:00");
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    if (!topic) return;
    const sec = topic.timeSecDefault ?? 120;
    setSecondsLeft(sec);
    setDurationInput(fmt(sec));
  }, [topic]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [running, secondsLeft]);

  function parseDuration(text: string) {
    const t = text.trim();
    if (!t) return null;
    if (t.includes(":")) {
      const [mm, ss] = t.split(":");
      const m = Number(mm);
      const s = Number(ss);
      if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
      return m * 60 + s;
    }
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }

  function applyDuration() {
    const sec = parseDuration(durationInput);
    if (sec == null || sec <= 0 || sec > 60 * 20) return;
    setSecondsLeft(sec);
    setRunning(false);
  }

  function reset() {
    const sec = parseDuration(durationInput) ?? topic?.timeSecDefault ?? 120;
    setSecondsLeft(sec);
    setRunning(false);
  }

  if (!topic) {
    return (
      <div className="rounded-xl border bg-white p-4">
        Not found.{" "}
        <Link className="underline" href="/game">
          Back to game
        </Link>
      </div>
    );
  }

  const statusTone = secondsLeft === 0 ? "rose" : running ? "emerald" : "amber";

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-zinc-500">Topic</div>
            <div className="mt-1 text-xl font-semibold">{topic.title}</div>
            <div className="mt-2 flex gap-2">
              <Tag
                text={topic.level.toUpperCase()}
                tone={
                  topic.level === "easy"
                    ? "emerald"
                    : topic.level === "medium"
                    ? "amber"
                    : "rose"
                }
              />
              <Tag
                text={running ? "RUNNING" : "READY"}
                tone={statusTone as any}
              />
            </div>
          </div>

          <Link href="/game" className="rounded-lg border bg-white px-4 py-2">
            ← Back
          </Link>
        </div>

        <div className="mt-3 text-sm text-zinc-700">
          <span className="font-medium">Prompt:</span> {topic.prompt}
        </div>

        {/* Timer */}
        <div className="mt-4 rounded-xl border bg-zinc-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs text-zinc-500">Timer</div>
              <div className="mt-1 text-4xl font-semibold font-mono">
                {fmt(secondsLeft)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <div className="text-xs text-zinc-500">Set duration</div>
                <input
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="mt-1 w-28 rounded-lg border px-3 py-2 font-mono text-sm"
                  placeholder="2:00"
                />
              </div>
              <button
                onClick={applyDuration}
                className="rounded-lg border bg-white px-3 py-2"
              >
                Apply
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border bg-white px-4 py-2"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowHints((s) => !s)}
              className="rounded-lg border bg-white px-4 py-2"
            >
              {showHints ? "Hide hints" : "Show hints"}
            </button>

            <div className="text-xs text-zinc-600">
              Tip: Start speaking first. Only open hints if you freeze.
            </div>
          </div>
        </div>
      </div>

      {showHints ? (
        <div className="grid gap-4">
          <HintsCard title="Ideas to include" items={topic.ideas} tone="sky" />
          <HintsCard
            title="Vocabulary to use"
            items={topic.vocab}
            tone="indigo"
            isTags
          />
          <HintsCard title="Starters" items={topic.starters} tone="emerald" />
          <HintsCard
            title="Strong sentences"
            items={topic.strongSentences}
            tone="violet"
          />
          <HintsCard
            title="If you get stuck"
            items={topic.stuckBridges}
            tone="rose"
          />
          <HintsCard title="Insights" items={topic.insights} tone="amber" />
        </div>
      ) : null}
    </div>
  );
}

function HintsCard({
  title,
  items,
  tone,
  isTags,
}: {
  title: string;
  items: string[];
  tone: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate";
  isTags?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      {isTags ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((x) => (
            <Tag key={x} text={x} tone={tone} />
          ))}
        </div>
      ) : (
        <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
