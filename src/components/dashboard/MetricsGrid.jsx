import { metrics } from '../../data/dashboardData'
import MetricCard from './MetricCard'

function MetricsGrid({ metrics: metricsProp }) {
  const items = Array.isArray(metricsProp) && metricsProp.length > 0 ? metricsProp : metrics

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  )
}

export default MetricsGrid
