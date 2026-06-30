import bizSocialsLogo from '../../assets/Biz Socials Rectangle Logo copy.png'
import { navItems } from '../../data/dashboardData'
import StatusBadge from '../common/StatusBadge'
import { DynamicIcon } from '../common/icons'

function getNavRoute(item) {
  const routes = {
    dashboard: '/dashboard',
    feed: '/feed',
    pitchReels: '/pitch-reels',
    fundme: '/fundme',
    settings: '/settings',
  }

  return routes[item.key] || null
}

function Sidebar({ mobile = false, onClose, currentRoute = '/dashboard', onNavigate }) {
  function handleNavClick(event, route) {
    if (!route) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    onNavigate(route)
    onClose?.()
  }

  return (
    <aside
      className={`sidebar-scrollbar flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain border-r border-blue-500/30 bg-gradient-to-b from-[#0f3ecf] via-[#0a37be] to-[#082c9a] text-blue-50 ${
        mobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'fixed inset-y-0 left-0 hidden w-[180px] lg:flex'
      }`}
    >
      <div className="px-3 py-4">
        <div className="mb-5 flex min-h-11 items-center justify-between gap-2">
          <a
            href="#/dashboard"
            onClick={(event) => handleNavClick(event, '/dashboard')}
            className="flex min-w-0 items-center rounded-2xl bg-white px-2 py-2 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Go to BizSocials dashboard"
          >
            <img
              src={bizSocialsLogo}
              alt="BizSocials"
              className="h-14 w-auto max-w-[156px] object-contain"
            />
          </a>
          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close sidebar"
            >
              <DynamicIcon name="X" className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav aria-label="Primary navigation" className="space-y-1">
          {navItems.map((item) => {
            const route = getNavRoute(item)
            const isActive = route === currentRoute

            return (
              <a
                key={item.key}
                href={route ? `#${route}` : '#'}
                onClick={(event) => handleNavClick(event, route)}
                className={`group flex min-h-11 items-center justify-between rounded-xl px-2.5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-[0.99] ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/35'
                    : 'text-blue-50/90 hover:bg-white/12 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <DynamicIcon name={item.icon} className="h-4 w-4 flex-none" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge ? <StatusBadge>{item.badge}</StatusBadge> : null}
              </a>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="rounded-2xl border border-blue-300/25 bg-blue-950/20 p-3 shadow-xl shadow-black/20">
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


