"use client";

interface Props {
  score: number;
}

export default function TrustScoreGauge({ score }: Props) {
  // SVG arc gauge — half circle
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = 180;
  const endAngle = 0;

  const pct = score / 100;
  const angle = 180 - pct * 180;
  const rad = (angle * Math.PI) / 180;

  // Arc path for the filled portion
  const arcEndX = cx + radius * Math.cos((180 * Math.PI) / 180);
  const arcEndY = cy + radius * Math.sin((180 * Math.PI) / 180);
  const needleX = cx + radius * Math.cos(rad);
  const needleY = cy + radius * Math.sin(rad);

  const color = score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

  const describeArc = (startDeg: number, endDeg: number) => {
    const s = ((startDeg - 180) * Math.PI) / 180;
    const e = ((endDeg - 180) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(s);
    const y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e);
    const y2 = cy + radius * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background track */}
        <path
          d={describeArc(0, 180)}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={describeArc(0, pct * 180)}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill="#1E293B" />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="10" fill="#94A3B8">
          / 100
        </text>
      </svg>
      <p className="text-xs text-slate-500 mt-1">Global Trust Score</p>
    </div>
  );
}
