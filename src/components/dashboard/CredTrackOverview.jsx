import Card from '../common/Card'
import { credTrackChecklist } from '../../data/dashboardData'

function CredTrackOverview() {
  const score = 82
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const stroke = circumference * ((100 - score) / 100)

  return (
    <Card className="border-none bg-gradient-to-br from-[#05194d] via-[#072160] to-[#06265f] text-white shadow-2xl shadow-blue-950/35">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">CredTrack Overview</h3>
        <button
          type="button"
          className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-50"
        >
          View Details
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <svg className="h-28 w-28" viewBox="0 0 124 124" aria-label="CredTrack score gauge">
          <circle cx="62" cy="62" r={radius} stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
          <circle
            cx="62"
            cy="62"
            r={radius}
            stroke="#34d4ff"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={stroke}
            transform="rotate(-90 62 62)"
            strokeLinecap="round"
          />
          <text x="62" y="59" textAnchor="middle" className="fill-white text-[28px] font-bold">
            82
          </text>
          <text x="62" y="77" textAnchor="middle" className="fill-blue-100 text-[11px] font-semibold">
            Excellent
          </text>
        </svg>
        <div>
          <p className="text-lg font-semibold text-blue-50">Funding Readiness Score</p>
          <p className="mt-1 text-sm text-blue-100">
            You&apos;re in great shape! Keep building credit and strengthen your profile.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {credTrackChecklist.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-blue-100">{item.label}</span>
            <span className="font-semibold text-cyan-200">{item.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default CredTrackOverview
