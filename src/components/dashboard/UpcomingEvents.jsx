import AvatarPlaceholder from '../common/AvatarPlaceholder'
import Card from '../common/Card'
import { DynamicIcon } from '../common/icons'

function UpcomingEvents({ events }) {
  const items = Array.isArray(events) ? events : []

  return (
    <Card>
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <DynamicIcon name="CalendarDays" className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
            <span className="text-sm font-semibold text-slate-800">Upcoming</span>
            <span className="text-[22px] font-semibold leading-none text-blue-700">BizSocials</span>
          </div>
        </div>
        <button type="button" className="inline-flex min-h-11 flex-none items-center text-xs font-semibold text-blue-700 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Upcoming events are not connected to database yet.</p>
        ) : null}
        {items.map((event) => (
          <article key={`${event.month}-${event.day}-${event.title}`} className="rounded-xl border border-slate-200 p-3">
            <div className="grid gap-3 sm:grid-cols-[56px_1fr_auto] sm:items-start">
              <div className="rounded-lg bg-blue-50 p-2 text-center text-blue-700">
                <p className="text-[10px] font-semibold">{event.month}</p>
                <p className="text-xl font-bold leading-tight">{event.day}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{event.date} • {event.time}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <DynamicIcon name="MapPin" className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.location}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {[0, 1, 2].map((idx) => (
                    <AvatarPlaceholder
                      key={idx}
                      className={`h-6 w-6 border border-white ${idx > 0 ? '-ml-2' : ''}`}
                      label="Attendee"
                    />
                  ))}
                  <span className="ml-1 text-xs text-slate-500">+{event.attendees}</span>
                </div>
              </div>
              <button
                type="button"
                className="min-h-11 w-full rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto"
              >
                Register
              </button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}

export default UpcomingEvents
