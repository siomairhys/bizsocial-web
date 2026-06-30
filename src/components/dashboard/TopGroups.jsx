import Card from '../common/Card'
import SectionHeader from '../common/SectionHeader'
import AvatarPlaceholder from '../common/AvatarPlaceholder'
import { groups } from '../../data/dashboardData'

function TopGroups() {
  return (
    <Card>
      <SectionHeader title="Top Groups" action="View All" />
      <div className="space-y-2">
        {groups.map((group) => (
          <button
            key={group.name}
            type="button"
            className="flex min-h-12 w-full items-center gap-2 rounded-xl p-2 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <AvatarPlaceholder className="h-9 w-9" label="Group" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">{group.name}</span>
              <span className="block text-xs text-slate-500">{group.members}</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default TopGroups
