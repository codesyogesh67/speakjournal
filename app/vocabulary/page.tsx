import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Tag } from "@/components/Tag";
import { toneForKey } from "@/lib/color";

export const dynamic = "force-dynamic";

type VocabAgg = {
  used: string;
  count: number;
  better: Map<string, number>;
};

export default async function VocabularyPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, topic: true, createdAt: true, analysisJson: true },
  });

  const agg = new Map<string, VocabAgg>();

  for (const s of sessions) {
    const reps = s.analysisJson?.vocabularyUpgrades?.replacements;
    if (!Array.isArray(reps)) continue;

    for (const r of reps) {
      const used = String(r?.used ?? "").trim();
      if (!used) continue;

      const betterList = Array.isArray(r?.betterOptions) ? r.betterOptions : [];
      const entry = agg.get(used) ?? { used, count: 0, better: new Map() };

      entry.count += 1;
      for (const b of betterList) {
        const bb = String(b ?? "").trim();
        if (!bb) continue;
        entry.better.set(bb, (entry.better.get(bb) ?? 0) + 1);
      }
      agg.set(used, entry);
    }
  }

  const rows = [...agg.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 120);

  return (
    <Container title="Vocabulary">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-zinc-600">
          Aggregated from your saved sessions. “Used” words/phrases are
          highlighted so you can focus.
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-4">Used</div>
          <div className="col-span-1">Count</div>
          <div className="col-span-7">Better options</div>
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-zinc-600">
              No vocabulary upgrades found yet. Make sure your pasted JSON
              includes vocabularyUpgrades.replacements.
            </div>
          ) : (
            rows.map((r) => {
              const betterSorted = [...r.better.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8);

              return (
                <div key={r.used} className="grid grid-cols-12 px-4 py-3">
                  <div className="col-span-4 flex items-center gap-2">
                    <Tag text={r.used} tone={toneForKey(r.used)} />
                  </div>
                  <div className="col-span-1 text-sm font-mono text-zinc-700">
                    {r.count}
                  </div>
                  <div className="col-span-7 flex flex-wrap gap-2">
                    {betterSorted.length ? (
                      betterSorted.map(([b]) => (
                        <Tag key={b} text={b} tone="slate" />
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
}
