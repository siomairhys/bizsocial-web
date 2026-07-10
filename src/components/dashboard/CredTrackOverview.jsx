import Card from '../common/Card'

import getBizCreditLogo from '../../assets/getbizcredit.png'

function CredTrackOverview({ overview }) {
  const score = overview?.score != null ? Number(overview.score) : null
  const scoreLabel = overview?.label || 'Not connected'
  const checklist = Array.isArray(overview?.checklist) ? overview.checklist : []
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const stroke = circumference * ((100 - (score || 0)) / 100)

  return (
    <Card className="border-none bg-gradient-to-br from-[#04163f] via-[#071f57] to-[#05245c] text-white shadow-2xl shadow-blue-950/35">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">CredTrack Overview</h3>
          <span className="grid h-4 w-4 place-items-center rounded-full border border-white/50 text-[10px] font-bold text-blue-100">
            i
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-50"
        >
          View Details
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[124px_minmax(0,1fr)]">
        <svg className="h-32 w-32" viewBox="0 0 124 124" aria-label="CredTrack score gauge">
          <circle cx="62" cy="62" r={radius} stroke="rgba(255,255,255,0.25)" strokeWidth="10" fill="none" />
          <circle
            cx="62"
            cy="62"
            r={radius}
            stroke="#155dfc"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.22}
            transform="rotate(-90 62 62)"
            strokeLinecap="round"
          />
          <circle
            cx="62"
            cy="62"
            r={radius}
            stroke="#22e6c8"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={stroke}
            transform="rotate(-90 62 62)"
            strokeLinecap="round"
          />
          <text x="62" y="59" textAnchor="middle" className="fill-white text-[28px] font-bold">
            {score != null ? Math.round(score) : '--'}
          </text>
          <text x="62" y="77" textAnchor="middle" className="fill-blue-100 text-[11px] font-semibold">
            {scoreLabel}
          </text>
        </svg>
        <div className="min-w-0">
          <img
            src={getBizCreditLogo}
            alt="GetBizCredit"
            loading="lazy"
            className="h-12 w-44 object-contain object-left"
          />
          <p className="mt-3 text-lg font-semibold text-blue-50">Funding Readiness Score</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {score == null
              ? 'CredTrack overview is not connected to database yet.'
              : "You're in great shape!"}
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-100">
            Keep building credit and strengthen your profile.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {checklist.length === 0 ? (
          <p className="text-sm text-blue-100">Checklist is not connected to database yet.</p>
        ) : null}
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="flex min-w-0 items-center gap-2 text-blue-100">
              <span className="grid h-4 w-4 flex-none place-items-center rounded-full bg-emerald-400 text-[10px] font-bold text-blue-950">
                &#10003;
              </span>
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-semibold text-emerald-300">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default CredTrackOverview
