"use client";

import { useMemo, useState } from "react";
import { countWords, wpm as calcWpm } from "@/lib/utils";

type Session = {
  id: string;
  createdAt: string;
  topic: string;
  durationSec: number;
  transcriptRaw: string;

  transcriptClean?: string | null;
  transcriptNative?: string | null;

  estimatedWords?: number | null;
  wpm?: number | null;

  analysisJson?: any; // your journal JSON
};

type Tab = "raw" | "edited" | "overview" | "focus" | "vocab" | "drill";

export function SessionView({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("overview");

  const rawWords = useMemo(() => countWords(session.transcriptRaw), [
    session.transcriptRaw,
  ]);
  const rawWpm = useMemo(() => calcWpm(rawWords, session.durationSec), [
    rawWords,
    session.durationSec,
  ]);

  const journal = session.analysisJson;

  // Use journal WPM if present; otherwise raw
  const wpm = Number(journal?.metrics?.wpm ?? session.wpm ?? rawWpm);
  const speedBand = journal?.metrics?.speedInterpretation?.band ?? "—";

  const speedMeta = getSpeedMeta(wpm);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-zinc-500">Topic</div>
        <div className="text-lg font-semibold">{session.topic}</div>

        <div className="mt-2 text-xs text-zinc-500">
          Duration: <span className="font-mono">{session.durationSec}s</span> •
          Words: <span className="font-mono">{rawWords}</span>
        </div>

        {/* Speed card */}
        <div className="mt-3 rounded-lg border bg-zinc-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs text-zinc-500">Speed</div>
              <div className="flex items-baseline gap-2">
                <div
                  className={
                    "text-xl font-semibold font-mono " + speedMeta.textClass
                  }
                >
                  {wpm.toFixed(1)} WPM
                </div>
                <div className="text-xs text-zinc-600">({speedBand})</div>
              </div>
            </div>

            <div className="text-xs text-zinc-600">
              <div>Reference:</div>
              <div className="font-mono">Medium: 110–140 • Fast: 140–170</div>
            </div>
          </div>

          <div className="mt-2 text-sm text-zinc-700">{speedMeta.message}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <TabButton
            label="RAW"
            active={tab === "raw"}
            onClick={() => setTab("raw")}
          />
          <TabButton
            label="EDITED"
            active={tab === "edited"}
            onClick={() => setTab("edited")}
          />
          <TabButton
            label="OVERVIEW"
            active={tab === "overview"}
            onClick={() => setTab("overview")}
          />
          <TabButton
            label="TOP FOCUS"
            active={tab === "focus"}
            onClick={() => setTab("focus")}
          />
          <TabButton
            label="VOCAB"
            active={tab === "vocab"}
            onClick={() => setTab("vocab")}
          />
          <TabButton
            label="DRILL"
            active={tab === "drill"}
            onClick={() => setTab("drill")}
          />
        </div>

        <div className="mt-4">
          {tab === "raw" && (
            <TextBlock title="Raw transcript" text={session.transcriptRaw} />
          )}

          {tab === "edited" && (
            <div className="grid gap-4">
              <TextBlock
                title="Clean transcript"
                text={session.transcriptClean ?? "Not provided yet."}
              />
              <TextBlock
                title="Native transcript"
                text={session.transcriptNative ?? "Not provided yet."}
              />
            </div>
          )}

          {!journal ? (
            tab !== "raw" && tab !== "edited" ? (
              <div className="text-sm text-zinc-600">
                No journal JSON stored for this session yet.
              </div>
            ) : null
          ) : (
            <>
              {tab === "overview" && <OverviewTab journal={journal} />}
              {tab === "focus" && <FocusTab journal={journal} />}
              {tab === "vocab" && <VocabTab journal={journal} />}
              {tab === "drill" && <DrillTab journal={journal} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs ---------------- */

function OverviewTab({ journal }: { journal: any }) {
  const repetition = journal.repetition;
  const grammar = journal.grammarAndClarity;

  return (
    <div className="grid gap-4">
      <Section title="Repeated words / phrases">
        {repetition?.repeatedWordsOrPhrases?.length ? (
          <div className="grid gap-2">
            {repetition.repeatedWordsOrPhrases.map((r: any, i: number) => (
              <div key={i} className="rounded-lg border bg-zinc-50 p-3">
                <div className="text-sm">
                  <span className="font-medium">{r.item}</span>{" "}
                  <span className="text-zinc-600">— {r.impact}</span>
                </div>
                {r.betterAlternatives?.length ? (
                  <div className="mt-2 text-xs text-zinc-700">
                    Alternatives:{" "}
                    <span className="font-mono">
                      {r.betterAlternatives.filter(Boolean).join(" • ")}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-600">No repetition list found.</div>
        )}
      </Section>

      <Section title="Grammar & clarity issues">
        <div className="text-sm text-zinc-700">
          Score:{" "}
          <span className="font-mono">{grammar?.scoreOutOf10 ?? "—"}</span>
          {grammar?.summary ? <> • {grammar.summary}</> : null}
        </div>

        {grammar?.keyIssues?.length ? (
          <div className="mt-3 grid gap-2">
            {grammar.keyIssues.map((m: any, i: number) => (
              <div key={i} className="rounded-lg border bg-white p-3">
                <div className="text-xs text-zinc-500">{m.type}</div>
                <div className="mt-1 text-sm">
                  <span className="font-medium">Original:</span>{" "}
                  <span className="font-mono">{m.original}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Fix:</span>{" "}
                  <span className="font-mono">{m.fix}</span>
                </div>
                {m.note ? (
                  <div className="mt-1 text-sm text-zinc-600">{m.note}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600">No key issues found.</div>
        )}
      </Section>
    </div>
  );
}

function FocusTab({ journal }: { journal: any }) {
  const priorities = journal.prioritiesToImprove?.ordered;
  return (
    <Section title="Top focus for improvement">
      {Array.isArray(priorities) && priorities.length ? (
        <ol className="list-decimal pl-5 text-sm text-zinc-700">
          {priorities.slice(0, 8).map((p: any, i: number) => (
            <li key={i} className="mt-1">
              <span className="font-medium">{p.focus}</span>
              {p.howToPractice ? (
                <span className="text-zinc-600"> — {p.howToPractice}</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-sm text-zinc-600">No priorities found.</div>
      )}
    </Section>
  );
}

function VocabTab({ journal }: { journal: any }) {
  const vocab = journal.vocabularyUpgrades?.replacements;
  return (
    <Section title="Vocabulary upgrades">
      {Array.isArray(vocab) && vocab.length ? (
        <div className="grid gap-2">
          {vocab.map((v: any, i: number) => (
            <div key={i} className="rounded-lg border bg-zinc-50 p-3">
              <div className="text-sm">
                <span className="font-medium">Used:</span>{" "}
                <span className="font-mono">{v.used}</span>
              </div>
              <div className="mt-1 text-xs text-zinc-700">
                Better:{" "}
                <span className="font-mono">
                  {(v.betterOptions ?? []).filter(Boolean).join(" • ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-zinc-600">
          No vocabulary upgrades found.
        </div>
      )}
    </Section>
  );
}

function DrillTab({ journal }: { journal: any }) {
  const nextPlan = journal.nextSessionPlan;
  return (
    <Section title="Next session drill">
      <div className="text-sm text-zinc-700">
        {nextPlan?.goal ? <span className="font-medium">Goal:</span> : null}{" "}
        {nextPlan?.goal ?? "—"}
      </div>

      {nextPlan?.constraints?.length ? (
        <>
          <div className="mt-3 text-sm font-medium">Constraints</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
            {nextPlan.constraints.map((c: string, i: number) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm font-medium">Repeat lines</div>
          {nextPlan?.practiceDrill?.repeatLines?.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              {nextPlan.practiceDrill.repeatLines.map(
                (x: string, i: number) => (
                  <li key={i}>{x}</li>
                )
              )}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-zinc-600">No repeat lines.</div>
          )}
        </div>

        <div>
          <div className="text-sm font-medium">Pronunciation targets</div>
          {nextPlan?.practiceDrill?.pronunciationTargets?.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              {nextPlan.practiceDrill.pronunciationTargets.map(
                (x: string, i: number) => (
                  <li key={i}>{x}</li>
                )
              )}
            </ul>
          ) : (
            <div className="mt-2 text-sm text-zinc-600">
              No pronunciation targets.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- UI helpers ---------------- */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-3 py-1 text-sm border " +
        (active ? "bg-zinc-900 text-white border-zinc-900" : "bg-white")
      }
    >
      {label}
    </button>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <pre className="mt-2 whitespace-pre-wrap rounded-lg border bg-zinc-50 p-3 text-sm leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function getSpeedMeta(wpm: number) {
  // Reference: medium 110–140, fast 140–170 (conversational)
  if (!Number.isFinite(wpm) || wpm <= 0) {
    return { textClass: "text-zinc-900", message: "No speed data yet." };
  }
  if (wpm < 90) {
    return {
      textClass: "text-amber-600",
      message:
        "Below conversational speed. Aim for +10 WPM over the next 1–2 weeks by speaking with shorter sentences.",
    };
  }
  if (wpm < 110) {
    return {
      textClass: "text-amber-600",
      message:
        "Approaching conversational speed. Target 110–140 WPM (medium native conversation).",
    };
  }
  if (wpm <= 140) {
    return {
      textClass: "text-emerald-600",
      message:
        "Great—this is in the medium native conversational range (110–140). Keep clarity first.",
    };
  }
  if (wpm <= 170) {
    return {
      textClass: "text-emerald-600",
      message:
        "Fast conversational pace (140–170). Make sure pronunciation stays clean.",
    };
  }
  return {
    textClass: "text-zinc-900",
    message: "Very fast. If clarity drops, slow slightly and add pauses.",
  };
}
