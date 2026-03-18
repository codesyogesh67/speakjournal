"use client";

import { useState } from "react";

export function JournalJsonForm() {
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSave() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalJsonText: jsonText }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json(); // { id }
      window.location.href = `/sessions/${data.id}`;
    } catch (e) {
      setErr(e?.message ?? "Failed");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <label className="text-sm font-medium">Paste journal JSON</label>
      <textarea
        className="mt-2 w-full min-h-[340px] rounded-lg border px-3 py-2 font-mono text-sm"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="Paste the full JSON from ChatGPT here..."
      />
      {err ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      ) : null}

      <button
        disabled={busy}
        onClick={onSave}
        className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : "Save session"}
      </button>

      <div className="mt-2 text-xs text-zinc-500">
        Tip: Make sure the response is JSON only (no extra text).
      </div>
    </div>
  );
}
