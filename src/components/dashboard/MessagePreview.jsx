import AvatarPlaceholder from '../common/AvatarPlaceholder'
import Card from '../common/Card'
import SectionHeader from '../common/SectionHeader'
import StatusBadge from '../common/StatusBadge'
import { messagePreview } from '../../data/dashboardData'

function MessagePreview() {
  return (
    <Card>
      <SectionHeader title="Messages" action="View All" />
      <div className="space-y-2">
        {messagePreview.map((message) => (
          <button
            key={message.name}
            type="button"
            className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition hover:bg-slate-50"
          >
            <AvatarPlaceholder className="h-9 w-9" label="User" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{message.name}</span>
              <span className="block truncate text-xs text-slate-500">{message.message}</span>
            </span>
            <span className="text-xs text-slate-500">{message.time}</span>
            {message.unread ? <StatusBadge>{message.unread}</StatusBadge> : null}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default MessagePreview
