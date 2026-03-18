"use client";

import { useMemo, useState } from "react";
import { parseDurationToSec } from "@/lib/utils";

type CreateResponse = { id: string };

export function SessionForm() {
  const [topic, setTopic] = useState(
    "Discipline is more important than motivation"
  );
  const [duration, setDuration] = useState("1:42");
  const [transcriptRaw, setTranscriptRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const durationSec = useMemo(() => parseDurationToSec(duration), [duration]);

  async function onCreate(analyze: boolean) {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, durationSec, transcriptRaw }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as CreateResponse;

      if (analyze) {
        const a = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: data.id }),
        });
        if (!a.ok) throw new Error(await a.text());
      }

      window.location.href = `/sessions/${data.id}`;
    } catch (e) {
      setErr(e?.message ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Topic</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic..."
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Duration (mm:ss or seconds)
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="1:42"
          />
          <div className="mt-1 text-xs text-zinc-500">
            Parsed: <span className="font-mono">{durationSec}</span> seconds
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Raw transcript (paste from Word)
          </label>
          <textarea
            className="mt-1 w-full min-h-[180px] rounded-lg border px-3 py-2 font-mono text-sm"
            value={transcriptRaw}
            onChange={(e) => setTranscriptRaw(e.target.value)}
            placeholder="Paste your transcript here..."
          />
        </div>

        {err ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            disabled={busy}
            onClick={() => onCreate(false)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {busy ? "Working..." : "Save session"}
          </button>

          <button
            disabled={busy}
            onClick={() => onCreate(true)}
            className="rounded-lg border bg-white px-4 py-2 disabled:opacity-60"
          >
            {busy ? "Working..." : "Save + Analyze"}
          </button>
        </div>

        <div className="text-xs text-zinc-500">
          Tip: Save first, then analyze later if you want.
        </div>
      </div>
    </div>
  );
}
