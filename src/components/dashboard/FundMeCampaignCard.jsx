import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { DynamicIcon } from '../common/icons'

function FundMeCampaignCard() {
  const progress = 62
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const stroke = circumference * ((100 - progress) / 100)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">FundMe Campaign</h3>
        <button type="button" className="text-slate-400 hover:text-slate-700" aria-label="Share campaign">
          <DynamicIcon name="Share2" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[116px_1fr]">
        <div className="flex items-center justify-center">
          <svg className="h-24 w-24" viewBox="0 0 96 96" aria-label="Campaign progress 62 percent">
            <circle cx="48" cy="48" r={radius} stroke="#dbeafe" strokeWidth="8" fill="none" />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#2563eb"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={stroke}
              transform="rotate(-90 48 48)"
              strokeLinecap="round"
            />
            <text x="48" y="53" textAnchor="middle" className="fill-slate-800 text-lg font-bold">
              62%
            </text>
          </svg>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Holloway Designs Growth Fund</h4>
          <p className="mt-1 text-xs text-slate-500">
            Help us expand our design studio and create more jobs in our community.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">$24,850 raised of $40,000 goal</p>
          <ProgressBar value={62} className="mt-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>124 supporters</span>
            <span>18 days left</span>
          </div>
          <button
            type="button"
            className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            View Campaign
          </button>
        </div>
      </div>
    </Card>
  )
}

export default FundMeCampaignCard
