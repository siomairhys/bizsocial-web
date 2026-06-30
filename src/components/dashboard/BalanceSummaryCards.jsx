import Card from '../common/Card'

function BalanceSummaryCards({ summary }) {
  const balance = summary?.bizbucksBalance != null ? Number(summary.bizbucksBalance) : null
  const balanceUsd = (balance / 10).toFixed(2)
  const readinessScore = summary?.fundingReadiness != null ? Number(summary.fundingReadiness) : null
  const readinessLabel = summary?.fundingReadinessLabel || null

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">BizBucks Balance</p>
        {balance == null ? (
          <p className="mt-1 text-sm text-slate-500">Not connected to database yet.</p>
        ) : (
          <>
            <p className="mt-1 text-3xl font-bold text-slate-900">{balance.toLocaleString()}</p>
            <p className="text-xs text-slate-500">≈ ${balanceUsd} USD</p>
          </>
        )}
      </Card>
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Funding Readiness</p>
        {readinessScore == null ? (
          <p className="mt-1 text-sm text-slate-500">Not connected to database yet.</p>
        ) : (
          <>
            <p className="mt-1 text-3xl font-bold text-slate-900">{readinessScore}/100</p>
            <p className="text-sm font-semibold text-blue-700">{readinessLabel || 'Available'}</p>
          </>
        )}
      </Card>
    </div>
  )
}

export default BalanceSummaryCards
