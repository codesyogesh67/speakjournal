import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Tag } from "@/components/Tag";
import { toneForKey } from "@/lib/color";

export const dynamic = "force-dynamic";

type TargetAgg = { target: string; count: number };

export default async function PronunciationPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: { analysisJson: true },
  });

  const agg = new Map<string, TargetAgg>();

  for (const s of sessions) {
    const targets =
      s.analysisJson?.nextSessionPlan?.practiceDrill?.pronunciationTargets;
    if (!Array.isArray(targets)) continue;

    for (const t of targets) {
      const target = String(t ?? "").trim();
      if (!target) continue;
      const entry = agg.get(target) ?? { target, count: 0 };
      entry.count += 1;
      agg.set(target, entry);
    }
  }

  const rows = [...agg.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 150);

  return (
    <Container title="Pronunciation targets">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-zinc-600">
          These are your most repeated pronunciation targets across sessions.
          Drill the top ones daily (2–5 minutes).
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-8">Target</div>
          <div className="col-span-2">Count</div>
          <div className="col-span-2">Priority</div>
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-zinc-600">
              No pronunciation targets found yet. Make sure your pasted JSON
              includes nextSessionPlan.practiceDrill.pronunciationTargets.
            </div>
          ) : (
            rows.map((r, idx) => {
              const priority = idx < 5 ? "High" : idx < 15 ? "Medium" : "Low";
              const tone =
                priority === "High"
                  ? "rose"
                  : priority === "Medium"
                  ? "amber"
                  : "slate";

              return (
                <div
                  key={r.target}
                  className="grid grid-cols-12 px-4 py-3 items-center"
                >
                  <div className="col-span-8 flex flex-wrap gap-2 items-center">
                    <Tag text={r.target} tone={toneForKey(r.target)} />
                    <span className="text-sm text-zinc-700">
                      Practice: slow → normal → fast
                    </span>
                  </div>
                  <div className="col-span-2 text-sm font-mono text-zinc-700">
                    {r.count}
                  </div>
                  <div className="col-span-2">
                    <Tag text={priority} tone={tone as any} />
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
