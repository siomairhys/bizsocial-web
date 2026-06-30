import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'
import { DynamicIcon } from '../common/icons'

function FundMeCampaignCard({ campaign }) {
  const progress = campaign?.progressPercent != null ? Number(campaign.progressPercent) : 0
  const campaignTitle = campaign?.title || ''
  const campaignDescription = campaign?.description || ''
  const raisedAmount = Number(campaign?.raisedAmount || 0)
  const goalAmount = Number(campaign?.goalAmount || 0)
  const supporterCount = Number(campaign?.supporters || 0)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const stroke = circumference * ((100 - progress) / 100)

  if (!campaign) {
    return (
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">FundMe Campaign</h3>
        </div>
        <p className="text-sm text-slate-500">FundMe campaign card is not connected to database yet.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">FundMe Campaign</h3>
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Share campaign">
          <DynamicIcon name="Share2" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[116px_1fr]">
        <div className="flex items-center justify-center">
          <svg className="h-24 w-24" viewBox="0 0 96 96" aria-label={`Campaign progress ${progress} percent`}>
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
              {Math.round(progress)}%
            </text>
          </svg>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">{campaignTitle}</h4>
          <p className="mt-1 text-xs text-slate-500">
            {campaignDescription}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            ${raisedAmount.toLocaleString()} raised of ${goalAmount.toLocaleString()} goal
          </p>
          <ProgressBar value={progress} className="mt-2" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{supporterCount} supporters</span>
            <span>18 days left</span>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto"
          >
            View Campaign
          </button>
        </div>
      </div>
    </Card>
  )
}

export default FundMeCampaignCard
