"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export type VoiceToTextHandle = {
  start: () => void;
  stop: () => void;
  clear: () => void;
  copy: () => Promise<void>;
  stopAndClear: () => void;
  getText: () => string;
  setText: (t: string) => void;
  isSupported: () => boolean;
};

export const VoiceToText = forwardRef<
  VoiceToTextHandle,
  {
    initialText?: string;
    onChangeText?: (text: string) => void;
    hideControls?: boolean; // ✅ hide start/stop/clear/copy buttons (we’ll control from /game)
  }
>(function VoiceToText(
  { onChangeText, initialText = "", hideControls = false },
  ref
) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setTextState] = useState(initialText);
  const [msg, setMsg] = useState<string | null>(null);

  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(SR));
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + " ";
      }
      if (finalText) {
        setTextState((prev) => {
          const next = prev + finalText;
          onChangeText?.(next);
          return next;
        });
      }
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
  }, [onChangeText]);

  function start() {
    if (!recRef.current) return;
    try {
      setListening(true);
      recRef.current.start();
    } catch {
      // Some browsers throw if start is called twice quickly.
    }
  }

  function stop() {
    if (!recRef.current) return;
    try {
      setListening(false);
      recRef.current.stop();
    } catch {}
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied ✅");
      setTimeout(() => setMsg(null), 1200);
    } catch {
      setMsg("Copy failed");
      setTimeout(() => setMsg(null), 1200);
    }
  }

  function clear() {
    setTextState("");
    onChangeText?.("");
  }

  function setText(t: string) {
    setTextState(t);
    onChangeText?.(t);
  }

  useImperativeHandle(
    ref,
    () => ({
      start,
      stop,
      clear,
      copy,
      stopAndClear: () => {
        stop();
        clear();
      },
      getText: () => text,
      setText,
      isSupported: () => supported,
    }),
    [supported, text]
  );

  if (!supported) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-zinc-700">
        Voice-to-text isn’t supported in this browser. Try Chrome.
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-zinc-500">Voice → Text</div>
          <div className="text-sm font-semibold">
            {listening ? "Listening…" : "Ready"}
          </div>
        </div>

        {msg ? (
          <div className="text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded-full">
            {msg}
          </div>
        ) : null}
      </div>

      {!hideControls ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={start}
            disabled={listening}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            Start
          </button>
          <button
            onClick={stop}
            disabled={!listening}
            className="rounded-lg border bg-white px-4 py-2 disabled:opacity-60"
          >
            Stop
          </button>
          <button
            onClick={copy}
            disabled={!text.trim()}
            className="rounded-lg border bg-white px-4 py-2 disabled:opacity-60"
          >
            Copy
          </button>
          <button
            onClick={clear}
            className="rounded-lg border bg-white px-4 py-2"
          >
            Clear
          </button>
        </div>
      ) : null}

      <textarea
        className="mt-3 w-full min-h-[160px] rounded-xl border p-3 text-sm leading-relaxed"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your transcript will appear here…"
      />
    </div>
  );
});
