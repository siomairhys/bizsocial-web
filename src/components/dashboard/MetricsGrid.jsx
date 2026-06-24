import { metrics } from '../../data/dashboardData'
import MetricCard from './MetricCard'

function MetricsGrid() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  )
}

export default MetricsGrid
