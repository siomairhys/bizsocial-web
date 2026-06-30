import MetricCard from './MetricCard'

function MetricsGrid({ metrics: metricsProp }) {
  const items = Array.isArray(metricsProp) ? metricsProp : []

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
        Metrics data is not connected yet.
      </section>
    )
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  )
}

export default MetricsGrid
