"use client";

import { useEffect, useMemo, useState } from "react";

type CoachNote = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  isPinned: boolean;
};

export function CoachNoteDetailClient({ id }: { id: string }) {
  const [note, setNote] = useState<CoachNote | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/coach-notes/${id}`);
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    setNote(data);
    setTitle(data.title);
    setCategory(data.category ?? "");
    setContent(data.content);
    setIsPinned(data.isPinned);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, [id]);

  const canSave = useMemo(() => {
    return title.trim().length > 0 && content.trim().length > 0;
  }, [title, content]);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setMsg("Copied ✅");
    setTimeout(() => setMsg(null), 1200);
  }

  async function save() {
    if (!canSave) return;

    setBusy(true);
    setErr(null);

    try {
      const res = await fetch(`/api/coach-notes/${id}`, {
        method: "PATCH",
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

      setMsg("Saved ✅");
      await load();
      setTimeout(() => setMsg(null), 1200);
    } catch (e) {
      setErr(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = window.confirm("Delete this coach note?");
    if (!ok) return;

    setBusy(true);
    setErr(null);

    try {
      const res = await fetch(`/api/coach-notes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      window.location.href = "/coach-notes";
    } catch (e) {
      setErr(e?.message ?? "Failed to delete");
      setBusy(false);
    }
  }

  if (!note && !err) {
    return <div className="rounded-2xl border bg-white p-4">Loading…</div>;
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-zinc-500">Title</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="text-xs text-zinc-500">Category</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-zinc-500">Content</div>
        <textarea
          className="mt-1 min-h-[260px] w-full rounded-xl border p-3 text-sm leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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

      {msg ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {msg}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copy} className="rounded-xl border bg-white px-4 py-2">
          Copy
        </button>

        <button
          onClick={save}
          disabled={!canSave || busy}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save"}
        </button>

        <button
          onClick={remove}
          disabled={busy}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
