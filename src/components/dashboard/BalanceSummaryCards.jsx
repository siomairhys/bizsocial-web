import Card from '../common/Card'

function BalanceSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">BizBucks Balance</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">1,250</p>
        <p className="text-xs text-slate-500">≈ $125.00 USD</p>
      </Card>
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Funding Readiness</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">82/100</p>
        <p className="text-sm font-semibold text-blue-700">Excellent</p>
        <p className="text-xs text-slate-500">Keep it up!</p>
      </Card>
    </div>
  )
}

export default BalanceSummaryCards
