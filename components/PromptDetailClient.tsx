"use client";

import { useEffect, useMemo, useState } from "react";

type PromptDoc = {
  id: string;
  title: string;
  category: string | null;
  content: string;
};

export function PromptDetailClient({ id }: { id: string }) {
  const [doc, setDoc] = useState<PromptDoc | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/prompts/${id}`);
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    setDoc(data);
    setTitle(data.title);
    setCategory(data.category ?? "");
    setContent(data.content);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canSave = useMemo(() => title.trim() && content.trim(), [
    title,
    content,
  ]);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setMsg("Copied to clipboard ✅");
    setTimeout(() => setMsg(null), 1200);
  }

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const r = await fetch(`/api/prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: category.trim() ? category : null,
          content,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setMsg("Saved ✅");
      await load();
      setTimeout(() => setMsg(null), 1200);
    } catch (e) {
      setErr(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!confirm("Delete this prompt?")) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      window.location.href = "/prompts";
    } catch (e) {
      setErr(e?.message ?? "Failed");
      setBusy(false);
    }
  }

  if (!doc && !err) {
    return <div className="rounded-xl border bg-white p-4">Loading…</div>;
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-500">Title</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-zinc-500">Category</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-zinc-500">Prompt content</div>
          <textarea
            className="mt-1 w-full min-h-[360px] rounded-lg border px-3 py-2 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {err ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </div>
        ) : null}

        {msg ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {msg}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={copy}
            className="rounded-lg border bg-white px-4 py-2"
          >
            Copy
          </button>
          <button
            onClick={save}
            disabled={!canSave || busy}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            onClick={del}
            disabled={busy}
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
