export default function Sparkline({ values, label, color = "#1d4ed8" }: { values: number[]; label: string; color?: string }) {
  if (values.length < 2) return <p className="text-xs text-muted">Trend appears after a few reports.</p>;
  const w = 280;
  const h = 56;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, max === min ? h / 2 : h - 4 - ((v - min) / (max - min)) * (h - 8)] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none">
      <polyline points={`${line} ${w},${h} 0,${h}`} fill={color} opacity="0.12" stroke="none" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
