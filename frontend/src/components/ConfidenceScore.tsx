export default function ConfidenceScore({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const circumference = 2 * Math.PI * 26
  const offset = circumference * (1 - value)
  const color = pct >= 90 ? '#4fd48a' : pct >= 75 ? '#5fd4e0' : '#e8a94f'

  return (
    <div className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#19212d" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div>
        <p className="text-2xl font-semibold text-slate-100 leading-none">{pct}%</p>
        <p className="tech-label mt-1">Confidence</p>
      </div>
    </div>
  )
}
