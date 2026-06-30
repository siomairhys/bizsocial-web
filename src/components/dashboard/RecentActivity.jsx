import Card from '../common/Card'
import SectionHeader from '../common/SectionHeader'
import { recentActivities } from '../../data/dashboardData'
import { DynamicIcon } from '../common/icons'

const RECENT_ACTIVITY_LIMIT = 5

function RecentActivity({ activities }) {
  const sourceItems = Array.isArray(activities) && activities.length > 0 ? activities : recentActivities
  const items = sourceItems.slice(0, RECENT_ACTIVITY_LIMIT)

  return (
    <Card>
      <SectionHeader title="Recent Activity" action="View All" />
      <div className="space-y-2">
        {items.map((activity) => (
          <div
            key={activity.key || activity.text}
            className="flex items-start justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <DynamicIcon name={activity.icon} className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="text-sm leading-snug text-slate-700">{activity.text}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivity
