import Link from "next/link";
import { Container } from "@/components/Container";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <Container title="Sessions">
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="divide-y">
          {sessions.length === 0 ? (
            <div className="p-4 text-zinc-600">No sessions yet.</div>
          ) : (
            sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="block p-4 hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{s.topic}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {fmtDate(s.createdAt)} • {s.durationSec}s
                      {s.wpm != null ? (
                        <>
                          {" "}
                          • WPM:{" "}
                          <span className="font-mono">
                            {Number(s.wpm).toFixed(1)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-xs">
                    {s.analysisJson ? (
                      <span className="rounded-full bg-green-50 border border-green-200 px-2 py-1 text-green-700">
                        analyzed
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-50 border px-2 py-1 text-zinc-600">
                        raw
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Container>
  );
}
