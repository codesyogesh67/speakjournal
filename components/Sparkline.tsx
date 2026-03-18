export function Sparkline({ points }: { points: number[] }) {
  const data = points.filter((n) => Number.isFinite(n));
  if (data.length < 2)
    return <div className="text-xs text-zinc-500">Not enough data</div>;

  const w = 160,
    h = 40,
    pad = 4;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = Math.max(1e-6, max - min);

  const xy = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} className="block">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={xy.join(" ")}
      />
    </svg>
  );
}
