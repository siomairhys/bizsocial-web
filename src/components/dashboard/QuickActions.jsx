import { quickActions } from '../../data/dashboardData'
import { DynamicIcon } from '../common/icons'

function QuickActions() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
      {quickActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="rounded-xl border border-blue-300/40 bg-white/10 p-3 text-left text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <DynamicIcon name={action.icon} className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-semibold">{action.label}</span>
          </div>
          <p className="text-xs text-blue-100">{action.description}</p>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
