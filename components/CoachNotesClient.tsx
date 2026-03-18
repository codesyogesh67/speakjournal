"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CoachNote = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  isPinned: boolean;
  createdAt: string;
};

export function CoachNotesClient() {
  const [title, setTitle] = useState("Powerful Upgrade");
  const [category, setCategory] = useState("speaking upgrade");
  const [content, setContent] = useState(
    `You often say:

“I feel like…”
“some days…”
“so…”

Replace with:

“I realized…”
“The problem is…”
“That’s when…”

This alone will make you sound much stronger and more natural.`
  );
  const [isPinned, setIsPinned] = useState(true);

  const [rows, setRows] = useState<CoachNote[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/coach-notes");
    const data = await res.json();
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  const canSave = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0;
  }, [title, content]);

  async function onSave() {
    if (!canSave) return;

    setBusy(true);
    setErr(null);

    try {
      const res = await fetch("/api/coach-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category: category.trim() ? category : null,
          content,
          isPinned,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setTitle("");
      setCategory("");
      setContent("");
      setIsPinned(false);

      await load();
    } catch (e) {
      setErr(e?.message ?? "Failed to save note");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Add coach note</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-500">Title</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Powerful Upgrade"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-500">Category</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="speaking upgrade / grammar / mindset"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-zinc-500">Content</div>
          <textarea
            className="mt-1 min-h-[220px] w-full rounded-xl border p-3 text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the note here..."
          />
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
          />
          Pin this note
        </label>

        {err ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {err}
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            onClick={onSave}
            disabled={!canSave || busy}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save note"}
          </button>

          <button
            onClick={() => {
              setTitle("");
              setCategory("");
              setContent("");
              setIsPinned(false);
            }}
            className="rounded-xl border bg-white px-4 py-2"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Pin</div>
          <div className="col-span-5">Preview</div>
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-zinc-600">No coach notes yet.</div>
          ) : (
            rows.map((row) => (
              <Link
                key={row.id}
                href={`/coach-notes/${row.id}`}
                className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-50"
              >
                <div className="col-span-4 font-medium">{row.title}</div>
                <div className="col-span-2 text-sm text-zinc-600">
                  {row.category ?? "—"}
                </div>
                <div className="col-span-1 text-sm">
                  {row.isPinned ? "📌" : "—"}
                </div>
                <div className="col-span-5 text-sm text-zinc-600 truncate">
                  {row.content.slice(0, 100)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
