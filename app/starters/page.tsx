import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { Tag } from "@/components/Tag";
import { toneForKey } from "@/lib/color";

export const dynamic = "force-dynamic";

type StarterAgg = { text: string; count: number };

function categorizeStarter(s: string) {
  const t = s.toLowerCase();
  if (t.startsWith("at first") || t.startsWith("before"))
    return "Before/contrast";
  if (t.startsWith("but") || t.includes("however")) return "Contrast";
  if (t.startsWith("for example") || t.includes("for instance"))
    return "Example";
  if (t.includes("in the long run") || t.startsWith("overall"))
    return "Conclusion";
  return "General";
}

export default async function StartersPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
    select: { analysisJson: true },
  });

  const agg = new Map<string, StarterAgg>();

  for (const s of sessions) {
    const list = s.analysisJson?.sentencesToUseNextTime?.upgradeBank;
    if (!Array.isArray(list)) continue;

    for (const item of list) {
      const text = String(item ?? "").trim();
      if (!text) continue;
      const entry = agg.get(text) ?? { text, count: 0 };
      entry.count += 1;
      agg.set(text, entry);
    }
  }

  const rows = [...agg.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 120);

  return (
    <Container title="Starters & strong sentences">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-zinc-600">
          These are the “ready-to-say” lines you can reuse. Use them to avoid
          freezing and sound more native.
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag text="Before/contrast" tone="indigo" />
          <Tag text="Contrast" tone="rose" />
          <Tag text="Example" tone="sky" />
          <Tag text="Conclusion" tone="emerald" />
          <Tag text="General" tone="slate" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-8">Sentence</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Count</div>
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-zinc-600">
              No starters found yet. Make sure your pasted JSON includes
              sentencesToUseNextTime.upgradeBank.
            </div>
          ) : (
            rows.map((r) => {
              const type = categorizeStarter(r.text);
              const tone =
                type === "Before/contrast"
                  ? "indigo"
                  : type === "Contrast"
                  ? "rose"
                  : type === "Example"
                  ? "sky"
                  : type === "Conclusion"
                  ? "emerald"
                  : "slate";

              return (
                <div
                  key={r.text}
                  className="grid grid-cols-12 px-4 py-3 items-start gap-2"
                >
                  <div className="col-span-8">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Tag text="Use" tone={toneForKey(r.text)} />
                      <span className="text-sm text-zinc-800">{r.text}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Tag text={type} tone={tone as any} />
                  </div>
                  <div className="col-span-2 text-sm font-mono text-zinc-700">
                    {r.count}
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
