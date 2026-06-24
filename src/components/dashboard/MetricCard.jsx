import Card from '../common/Card'
import { DynamicIcon } from '../common/icons'

function sparkPath(accent) {
  if (accent === 'green') {
    return 'M4 28 C14 18, 21 24, 32 16 C44 8, 58 14, 72 6 C84 0, 96 4, 124 2'
  }
  return 'M4 24 C14 22, 20 12, 33 16 C45 20, 58 8, 73 14 C84 18, 96 6, 124 10'
}

function MetricCard({ metric }) {
  const trendColor = metric.accent === 'green' ? 'text-emerald-600' : 'text-blue-600'
  const stroke = metric.accent === 'green' ? '#16a34a' : '#2563eb'

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <DynamicIcon name={metric.icon} className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className={`text-xs font-semibold ${trendColor}`}>{metric.trend}</span>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
      <p className="text-xs text-slate-500">vs last 30 days</p>
      <svg className="mt-2 h-7 w-full" viewBox="0 0 128 32" fill="none" aria-hidden="true">
        <path d={sparkPath(metric.accent)} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </Card>
  )
}

export default MetricCard
