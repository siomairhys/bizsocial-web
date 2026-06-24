import { navItems } from '../../data/dashboardData'
import PlaceholderImage from '../common/PlaceholderImage'
import StatusBadge from '../common/StatusBadge'
import { DynamicIcon } from '../common/icons'

function Sidebar({ mobile = false, onClose }) {
  return (
    <aside
      className={`flex h-full w-64 flex-col border-r border-blue-500/30 bg-gradient-to-b from-[#0f3ecf] via-[#0a37be] to-[#082c9a] text-blue-50 ${
        mobile ? 'fixed inset-y-0 left-0 z-50' : 'fixed inset-y-0 left-0 hidden lg:flex'
      }`}
    >
      <div className="px-4 py-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaceholderImage
              label="Logo"
              variant="logo"
              className="h-10 w-10 border-blue-300/40 from-blue-300/20 to-blue-200/10"
            />
            <div>
              <p className="text-xl font-bold tracking-tight">BizSocials</p>
              <p className="text-xs text-blue-100/80">.com</p>
            </div>
          </div>
          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <DynamicIcon name="X" className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav aria-label="Primary navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.key === 'dashboard'

            return (
              <a
                key={item.key}
                href="#"
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/35'
                    : 'text-blue-50/90 hover:bg-white/12 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <DynamicIcon name={item.icon} className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </span>
                {item.badge ? <StatusBadge>{item.badge}</StatusBadge> : null}
              </a>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-blue-300/25 bg-blue-950/20 p-4 shadow-xl shadow-black/20">
          <p className="text-sm font-semibold text-white">BizSocials Pro</p>
          <p className="mt-1 text-xs text-blue-100/90">
            Unlock advanced tools, insights, and more visibility.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
