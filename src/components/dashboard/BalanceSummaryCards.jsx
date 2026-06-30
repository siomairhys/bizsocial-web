import Card from '../common/Card'

function BalanceSummaryCards({ summary }) {
  const balance = Number(summary?.bizbucksBalance ?? 1250)
  const balanceUsd = (balance / 10).toFixed(2)
  const readinessScore = Number(summary?.fundingReadiness ?? 82)
  const readinessLabel = summary?.fundingReadinessLabel || 'Excellent'

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">BizBucks Balance</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{balance.toLocaleString()}</p>
        <p className="text-xs text-slate-500">≈ ${balanceUsd} USD</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Funding Readiness</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{readinessScore}/100</p>
        <p className="text-sm font-semibold text-blue-700">{readinessLabel}</p>
        <p className="text-xs text-slate-500">Keep it up!</p>
      </Card>
    </div>
  )
}

export default BalanceSummaryCards
