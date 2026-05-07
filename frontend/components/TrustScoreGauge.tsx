"use client";

interface Props {
  score: number;
  compact?: boolean;
  /** If true, show trailing `%` instead of `/100` after the score */
  showPercentSuffix?: boolean;
}

/** Segmented semicircle gauge — coral fill for the score portion, gray track (Figma: discrete ticks, fill rounds up). */
export default function TrustScoreGauge({
  score,
  compact = false,
  showPercentSuffix = false,
}: Props) {
  const raw = typeof score === "number" ? score : Number(score);
  const clamped = Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0));
  const segments = compact ? 40 : 48;
  /** Each segment = 100/segments points; round up so 24/100 → 10 of 40 segments. */
  const filledCount = Math.min(segments, Math.ceil((clamped / 100) * segments));

  const cx = compact ? 80 : 100;
  const cy = compact ? 88 : 108;
  const outerR = compact ? 62 : 78;
  const strokeW = compact ? 5.5 : 6.5;

  const inactive = "#d4dce4";
  const active = "#db8e8e";

  const arcPath = (startRad: number, endRad: number, r: number) => {
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy - r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy - r * Math.sin(endRad);
    const sweep = startRad > endRad ? 0 : 1;
    return `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2}`;
  };

  const slicePaths: { d: string; filled: boolean }[] = [];
  for (let i = 0; i < segments; i++) {
    const t0 = Math.PI * (1 - i / segments);
    const t1 = Math.PI * (1 - (i + 1) / segments);
    const filled = i < filledCount;
    slicePaths.push({
      d: arcPath(t0, t1, outerR),
      filled,
    });
  }

  const vb = compact ? "0 0 160 108" : "0 0 200 130";
  const sw = compact ? 160 : 200;
  const sh = compact ? 108 : 130;

  const display = Math.round(clamped);

  return (
    <div className={`flex w-full flex-col items-center ${compact ? "gap-0.5" : "gap-1"}`}>
      <svg width={sw} height={sh} viewBox={vb} className="overflow-visible" aria-hidden>
        {slicePaths.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill="none"
            stroke={seg.filled ? active : inactive}
            strokeWidth={strokeW}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <p className="flex items-baseline justify-center gap-0.5 leading-none tracking-tight">
        <span className={`font-semibold text-[#242424] ${compact ? "text-[34px]" : "text-[44px]"}`}>{display}</span>
        {showPercentSuffix ? (
          <span className={`font-semibold text-[#242424] ${compact ? "text-[34px]" : "text-[44px]"}`}>%</span>
        ) : (
          <span className={`font-normal text-[#717171] ${compact ? "text-[15px]" : "text-lg"}`}>/100</span>
        )}
      </p>
    </div>
  );
}
