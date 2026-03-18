import Link from "next/link";
import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function num(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function avg(xs: number[]) {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export default async function HomePage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const ordered = [...sessions].reverse();

  const wpmSeries = ordered
    .map((s) => num(s.analysisJson?.metrics?.wpm) ?? num(s.wpm))
    .filter((x): x is number => x !== null);

  const vocabSeries = ordered.map(
    (s) => s.analysisJson?.vocabularyUpgrades?.replacements?.length ?? 0
  );

  const pronSeries = ordered.map(
    (s) =>
      s.analysisJson?.nextSessionPlan?.practiceDrill?.pronunciationTargets
        ?.length ?? 0
  );

  const grammarSeries = ordered
    .map((s) => num(s.analysisJson?.grammarAndClarity?.scoreOutOf10))
    .filter((x): x is number => x !== null);

  const structureSeries = ordered
    .map((s) => num(s.analysisJson?.sentenceStructureAndFlow?.scoreOutOf10))
    .filter((x): x is number => x !== null);

  const latestWpm = wpmSeries.at(-1);
  const avgWpmLast7 = avg(wpmSeries.slice(-7));

  const latestVocab = vocabSeries.at(-1) ?? 0;
  const avgVocabLast7 = avg(vocabSeries.slice(-7)) ?? 0;

  const latestPron = pronSeries.at(-1) ?? 0;
  const avgPronLast7 = avg(pronSeries.slice(-7)) ?? 0;

  const latestGrammar = grammarSeries.at(-1);
  const latestStructure = structureSeries.at(-1);

  return (
    <Container title="Dashboard">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href="/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
        >
          New session (paste JSON)
        </Link>
        <Link href="/sessions" className="rounded-lg border bg-white px-4 py-2">
          All sessions
        </Link>
      </div>

      {/* Value-only summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <ValueCard
          title="Speed (WPM)"
          value={latestWpm != null ? latestWpm.toFixed(1) : "—"}
          note={latestWpm == null ? "No data yet" : wpmStatus(latestWpm)}
          sub={`Avg last 7: ${
            avgWpmLast7 != null ? avgWpmLast7.toFixed(1) : "—"
          }`}
        />
        <ValueCard
          title="Vocabulary upgrades"
          value={String(latestVocab)}
          note="Count in latest session"
          sub={`Avg last 7: ${avgVocabLast7.toFixed(1)}`}
        />
        <ValueCard
          title="Pronunciation targets"
          value={String(latestPron)}
          note="Targets to drill next"
          sub={`Avg last 7: ${avgPronLast7.toFixed(1)}`}
        />
        <ValueCard
          title="Grammar score"
          value={latestGrammar != null ? latestGrammar.toFixed(1) : "—"}
          note="From journal"
          sub="Goal: 8+"
        />
        <ValueCard
          title="Structure score"
          value={latestStructure != null ? latestStructure.toFixed(1) : "—"}
          note="Flow + connectors"
          sub="Goal: 8+"
        />
        <ValueCard
          title="Total sessions"
          value={String(sessions.length)}
          note="Loaded (last 50)"
          sub="Keep it consistent"
        />
      </div>

      {/* Sessions table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-0 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-5">Topic</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">WPM</div>
        </div>

        <div className="divide-y">
          {sessions.length === 0 ? (
            <div className="p-4 text-zinc-600">No sessions yet.</div>
          ) : (
            sessions.map((s) => {
              const wpmVal = num(s.analysisJson?.metrics?.wpm) ?? num(s.wpm);
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-50"
                >
                  <div className="col-span-5 font-medium">{s.topic}</div>
                  <div className="col-span-3 text-sm text-zinc-600">
                    {fmtDate(s.createdAt)}
                  </div>
                  <div className="col-span-2 text-sm text-zinc-600">
                    {s.durationSec}s
                  </div>
                  <div className="col-span-2 text-sm text-zinc-600 font-mono">
                    {wpmVal == null ? "-" : Number(wpmVal).toFixed(1)}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
}

function ValueCard({
  title,
  value,
  note,
  sub,
}: {
  title: string;
  value: string;
  note: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold font-mono">{value}</div>
      <div className="mt-2 text-sm text-zinc-700">{note}</div>
      {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
    </div>
  );
}

function wpmStatus(wpm: number) {
  if (wpm < 90)
    return "Below conversational speed — increase gradually (+10 WPM goal).";
  if (wpm < 110) return "Close — aim for 110–140 (medium native conversation).";
  if (wpm <= 140) return "Great — medium native conversational range.";
  if (wpm <= 170) return "Fast — keep pronunciation clear.";
  return "Very fast — slow down if clarity drops.";
}
