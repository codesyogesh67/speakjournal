export function parseDurationToSec(input: string): number {
  // accepts "mm:ss" or "ss" or "m"
  const s = input.trim();
  if (!s) return 0;

  if (s.includes(":")) {
    const [mm, ss] = s.split(":").map((x) => x.trim());
    const m = Number(mm);
    const sec = Number(ss);
    if (!Number.isFinite(m) || !Number.isFinite(sec)) return 0;
    return m * 60 + sec;
  }

  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function wpm(words: number, durationSec: number): number {
  if (durationSec <= 0) return 0;
  return words / (durationSec / 60);
}

export function fmtDate(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString();
}
