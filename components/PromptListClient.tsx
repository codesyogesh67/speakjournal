"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PromptRow = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  createdAt: string;
};

export function PromptListClient() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [rows, setRows] = useState<PromptRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/prompts");
    const data = await r.json();
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  const canSave = useMemo(() => title.trim() && content.trim(), [
    title,
    content,
  ]);

  async function onSave() {
    if (!canSave) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: category.trim() ? category : null,
          content,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setTitle("");
      setCategory("");
      setContent("");
      await load();
    } catch (e) {
      setErr(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      {/* Create form */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Add a prompt</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-500">Title</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal JSON generator"
            />
          </div>

          <div>
            <div className="text-xs text-zinc-500">Category (optional)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="journal / analysis / game"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-zinc-500">Prompt content</div>
          <textarea
            className="mt-1 w-full min-h-[220px] rounded-lg border px-3 py-2 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the prompt you want to reuse..."
          />
        </div>

        {err ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <button
            onClick={onSave}
            disabled={!canSave || busy}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save prompt"}
          </button>
          <button
            onClick={() => {
              setTitle("");
              setCategory("");
              setContent("");
            }}
            className="rounded-lg border bg-white px-4 py-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-4">Preview</div>
        </div>

        <div className="divide-y">
          {rows.length === 0 ? (
            <div className="p-4 text-sm text-zinc-600">No prompts yet.</div>
          ) : (
            rows.map((p) => (
              <Link
                key={p.id}
                href={`/prompts/${p.id}`}
                className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-50"
              >
                <div className="col-span-5 font-medium">{p.title}</div>
                <div className="col-span-3 text-sm text-zinc-600">
                  {p.category ?? "—"}
                </div>
                <div className="col-span-4 text-sm text-zinc-600 truncate">
                  {p.content.slice(0, 80)}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
