"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { TOPICS, PracticeTopic } from "@/data/topics";
import { Tag } from "@/components/Tag";
import { VoiceToText, type VoiceToTextHandle } from "@/components/VoiceToText";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function CompactRing({
    progress,
    state,
  }: {
    progress: number; // remaining (0..1)
    state: "ready" | "running" | "done";
  }) {
    const size = 44;
    const stroke = 6;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = c * progress;
  
    const ring =
      state === "done"
        ? "stroke-rose-500"
        : state === "running"
        ? "stroke-emerald-500"
        : "stroke-amber-500";
  
    return (
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="stroke-zinc-200"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={ring}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    );
  }
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

function pickRandomTopic(exceptSlug?: string | null) {
  if (TOPICS.length === 0) return null;
  if (TOPICS.length === 1) return TOPICS[0];
  let t = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  if (exceptSlug) {
    let tries = 0;
    while (t.slug === exceptSlug && tries < 8) {
      t = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      tries++;
    }
  }
  return t;
}

export default function GamePage() {
  const [picked, setPicked] = useState<PracticeTopic | null>(null);
  const vttRef = useRef<VoiceToTextHandle | null>(null);
  // Shuffle animation state
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleText, setShuffleText] = useState<string>("Click Shuffle 🎲");
  const shuffleTimerRef = useRef<number | null>(null);

  // Timer state
  const [showHints, setShowHints] = useState(false);
  const [running, setRunning] = useState(false);
  const [durationInput, setDurationInput] = useState("2:00");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const totalSeconds = useMemo(() => {
    const parsed = parseDuration(durationInput);
    return parsed && parsed > 0 ? parsed : 120;
  }, [durationInput]);

  // Countdown effect
  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  // Stop running at 0
  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  function applyDuration() {
    const sec = parseDuration(durationInput);
    if (sec == null || sec <= 0 || sec > 60 * 20) return;
    setSecondsLeft(sec);
    setRunning(false);
  }

  function setDurationLive(next: string) {
    setDurationInput(next);
  
    const sec = parseDuration(next);
    if (sec == null || sec <= 0 || sec > 60 * 20) return;
  
    // auto-apply immediately
    setRunning(false);
    vttRef.current?.stop();
    setSecondsLeft(sec);
  }

  function resetTimer() {
    const sec = parseDuration(durationInput) ?? 120;
    setSecondsLeft(sec);
    setRunning(false);
  }

  function startShuffle() {
    if (isShuffling) return;
    setRunning(false);

    setIsShuffling(true);
    setShowHints(false);

    const start = Date.now();
    const durationMs = 1100; // shuffle animation duration
    const tickMs = 80;

    // show rapidly changing titles
    shuffleTimerRef.current = window.setInterval(() => {
      const t = pickRandomTopic(picked?.slug ?? null);
      if (t) setShuffleText(t.title);

      if (Date.now() - start >= durationMs) {
        if (shuffleTimerRef.current)
          window.clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;

        const finalPick = pickRandomTopic(picked?.slug ?? null);
        setPicked(finalPick);
        setShuffleText(finalPick?.title ?? "No topic");

        // set default timer based on topic
        if (finalPick) {
          const sec = finalPick.timeSecDefault ?? 120;
          setDurationInput(fmt(sec));
          setSecondsLeft(sec);
        }

        setIsShuffling(false);
      }
    }, tickMs);
  }

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current)
        window.clearInterval(shuffleTimerRef.current);
    };
  }, []);

  const progress =
    totalSeconds > 0 ? clamp(secondsLeft / totalSeconds, 0, 1) : 0;

  return (
    <Container title="Topic Game">
      {/* Main layout */}
      <div className="relative rounded-xl border bg-white p-4 shadow-sm">
        {/* Small timer pinned top-right ONLY when hints are open */}
        {showHints ? (
          <div className="absolute right-4 top-4 z-20">
            <MiniTimer secondsLeft={secondsLeft} running={running} />
          </div>
        ) : null}

        {/* Top controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-zinc-500">Shuffle result</div>
            <div className="mt-1 text-xl font-semibold">
              {isShuffling ? (
                <span className="animate-pulse">{shuffleText}</span>
              ) : picked ? (
                picked.title
              ) : (
                shuffleText
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {picked ? (
                <>
                  <Tag
                    text={picked.level.toUpperCase()}
                    tone={
                      picked.level === "easy"
                        ? "emerald"
                        : picked.level === "medium"
                        ? "amber"
                        : "rose"
                    }
                  />
                  <Tag
                    text={`Default ${Math.round(
                      (picked.timeSecDefault ?? 120) / 60
                    )} min`}
                    tone="slate"
                  />
                </>
              ) : (
                <Tag text="Press Shuffle to start" tone="slate" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={startShuffle}
              disabled={isShuffling}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
            >
              {isShuffling ? "Shuffling…" : "Shuffle 🎲"}
            </button>

          

            <button
              onClick={() => setShowHints((v) => !v)}
              disabled={!picked}
              className="rounded-lg border bg-white px-4 py-2 disabled:opacity-60"
            >
              {showHints ? "Hide hints" : "Hints"}
            </button>
          </div>
        </div>

        {/* Prompt */}
        {picked ? (
          <div className="mt-3 rounded-lg border bg-zinc-50 p-3 text-sm text-zinc-700">
            <span className="font-medium">Prompt:</span> {picked.prompt}
          </div>
        ) : null}

        {/* TIMER + controls (hidden when hints open, because mini timer appears top-right) */}
        {!showHints ? (
  <div className="mt-4">
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* Header row: left info, right timer */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-zinc-500">Now practicing</div>
          <div className="mt-1 text-lg font-semibold truncate">
            {picked ? picked.title : "Shuffle a topic 🎲"}
          </div>

          {picked ? (
            <div className="mt-2 text-sm text-zinc-700">
              <span className="font-medium">Prompt:</span> {picked.prompt}
            </div>
          ) : null}
        </div>

        {/* Compact timer block */}
        <div className="shrink-0 p-3">
          <div className="flex items-center gap-3">
            <CompactRing progress={progress} state={timerState(secondsLeft, running)} />
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Time</div>
              <div className="font-mono text-lg font-semibold">{fmt(secondsLeft)}</div>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-[11px] text-zinc-500 text-right">Duration</div>
            <input
              value={durationInput}
              onChange={(e) => setDurationLive(e.target.value)}
              className="mt-1 w-24 rounded-lg border bg-white px-2 py-1.5 text-right font-mono text-sm"
              placeholder="2:00"
              disabled={!picked}
            />
          </div>
        </div>
      </div>

      {/* Transcript (inside same box) */}
      <div className="">
        <VoiceToText ref={vttRef} hideControls />
      </div>

      {/* Player controls (below transcript) */}
      <div className="mt-1 flex flex-wrap items-center gap-2 p-2">
        <button
          onClick={() => {
            if (!picked) return;

            setRunning((r) => {
              const next = !r;
              if (next) vttRef.current?.start();
              else vttRef.current?.stop();
              return next;
            });
          }}
          disabled={!picked}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-60"
        >
          {running ? "Pause" : "Start"}
        </button>

        <button
          onClick={() => {
            // Reset = stop timer + reset time to durationInput + stop voice + clear transcript
            const sec = parseDuration(durationInput) ?? (picked?.timeSecDefault ?? 120);
            setRunning(false);
            setSecondsLeft(sec);
            vttRef.current?.stop();
            vttRef.current?.clear();
          }}
          disabled={!picked}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:opacity-60"
        >
          Reset
        </button>

        <button
          onClick={() => vttRef.current?.copy()}
          disabled={!picked}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:opacity-60"
        >
          Copy
        </button>

        <button
          onClick={() => setShowHints(true)}
          disabled={!picked}
          className="ml-auto rounded-lg border bg-white px-3 py-1.5 text-xs disabled:opacity-60"
        >
          Hints
        </button>
      </div>

      <div className="mt-2 text-[11px] text-zinc-500">
        Tip: Start speaking first. Only open hints if you freeze.
      </div>
    </div>
  </div>
) : null}

        {/* HINTS overlay section (same page) */}
        {showHints && picked ? (
          <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">Hints</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
                >
                  {running ? "Pause" : "Start"}
                </button>
                <button
                  onClick={resetTimer}
                  className="rounded-lg border bg-white px-4 py-2"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <HintsCard
                title="Ideas to include"
                items={picked.ideas}
                mode="list"
                tone="sky"
              />
              <HintsCard
                title="Vocabulary to use"
                items={picked.vocab}
                mode="tags"
                tone="indigo"
              />
              <HintsCard
                title="Starters"
                items={picked.starters}
                mode="list"
                tone="emerald"
              />
              <HintsCard
                title="Strong sentences"
                items={picked.strongSentences}
                mode="list"
                tone="violet"
              />
              <HintsCard
                title="If you get stuck"
                items={picked.stuckBridges}
                mode="list"
                tone="rose"
              />
              <HintsCard
                title="Insights"
                items={picked.insights}
                mode="list"
                tone="amber"
              />
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

function timerState(secondsLeft: number, running: boolean) {
  if (secondsLeft === 0) return "done";
  if (running) return "running";
  return "ready";
}

function CircleTimer({
  progress,
  label,
  state,
}: {
  progress: number; // 0..1 (remaining)
  label: string;
  state: "ready" | "running" | "done";
}) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  const ring =
    state === "done"
      ? "stroke-rose-500"
      : state === "running"
      ? "stroke-emerald-500"
      : "stroke-amber-500";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="stroke-zinc-200"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={ring}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-2xl font-semibold font-mono">{label}</div>
      </div>
    </div>
  );
}

function MiniTimer({
  secondsLeft,
  running,
}: {
  secondsLeft: number;
  running: boolean;
}) {
  const tone =
    secondsLeft === 0
      ? "text-rose-600"
      : running
      ? "text-emerald-600"
      : "text-amber-600";

  return (
    <div className="rounded-full border bg-white px-3 py-2 shadow-sm">
      <div className={"font-mono text-sm font-semibold " + tone}>
        {fmt(secondsLeft)}
      </div>
    </div>
  );
}

function HintsCard({
  title,
  items,
  mode,
  tone,
}: {
  title: string;
  items: string[];
  mode: "list" | "tags";
  tone: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate";
}) {
  return (
    <div className="rounded-xl border bg-zinc-50 p-4">
      <div className="text-sm font-semibold">{title}</div>

      {mode === "tags" ? (
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
