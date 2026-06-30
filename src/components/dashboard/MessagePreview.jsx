import AvatarPlaceholder from '../common/AvatarPlaceholder'
import Card from '../common/Card'
import SectionHeader from '../common/SectionHeader'
import StatusBadge from '../common/StatusBadge'
import { messagePreview } from '../../data/dashboardData'

function MessagePreview({ messages }) {
  const items = Array.isArray(messages) && messages.length > 0 ? messages : messagePreview

  return (
    <Card>
      <SectionHeader title="Messages" action="View All" />
      <div className="space-y-2">
        {items.map((message) => (
          <button
            key={`${message.name}-${message.time}`}
            type="button"
            className="flex min-h-12 w-full items-center gap-2 rounded-xl p-2 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <AvatarPlaceholder className="h-9 w-9" label="User" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{message.name}</span>
              <span className="block truncate text-xs text-slate-500">{message.message}</span>
            </span>
            <span className="flex-none text-xs text-slate-500">{message.time}</span>
            {message.unread ? <StatusBadge className="flex-none">{message.unread}</StatusBadge> : null}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default MessagePreview
