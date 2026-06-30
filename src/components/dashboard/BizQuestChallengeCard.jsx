import Card from '../common/Card'
import PlaceholderImage from '../common/PlaceholderImage'
import ProgressBar from '../common/ProgressBar'

function BizQuestChallengeCard({ challenge }) {
  const progress = challenge?.progress_percent != null ? Number(challenge.progress_percent) : null

  if (!challenge) {
    return (
      <Card className="overflow-hidden border-blue-900/20 bg-gradient-to-br from-[#0f2b74] to-[#081a4f] text-white shadow-xl shadow-blue-950/35">
        <p className="text-sm text-blue-100">BizQuest challenge is not connected to database yet.</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-blue-900/20 bg-gradient-to-br from-[#0f2b74] to-[#081a4f] text-white shadow-xl shadow-blue-950/35">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-blue-100">BizQuest Challenge</p>
        <span className="flex-none rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-blue-100">{challenge.ends_in || 'Active'}</span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[96px_1fr]">
        <PlaceholderImage
          label="Graphic"
          variant="square"
          className="h-24 w-24 border-blue-300/30 from-blue-200/30 to-blue-100/10"
        />
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-blue-200">{challenge.period || 'Challenge'}</p>
          <h3 className="mt-1 text-xl font-bold">{challenge.title || 'BizQuest'}</h3>
          <p className="mt-1 text-sm text-blue-100/90">
            {challenge.description || 'No challenge details provided.'}
          </p>
          <p className="mt-3 text-xs font-semibold text-blue-200">Your Progress</p>
          <ProgressBar value={progress || 0} className="mt-1 bg-white/15" />
          <div className="mt-1 text-right text-xs text-blue-200">{challenge.progress_label || `${Math.round(progress || 0)}% Completed`}</div>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
          >
            {challenge.cta_label || 'View Challenge'}
          </button>
        </div>
      </div>
    </Card>
  )
}

export default BizQuestChallengeCard
