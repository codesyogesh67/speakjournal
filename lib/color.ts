const tones = [
  "indigo",
  "emerald",
  "amber",
  "rose",
  "sky",
  "violet",
  "slate",
] as const;
export type Tone = typeof tones[number];

export function toneForKey(key: string): Tone {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return tones[h % tones.length];
}
