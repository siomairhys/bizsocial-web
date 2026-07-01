import { useEffect, useRef, useState } from 'react'
import AvatarPlaceholder from '../common/AvatarPlaceholder'
import IconButton from '../common/IconButton'
import StatusBadge from '../common/StatusBadge'
import { DynamicIcon } from '../common/icons'

const createItems = [
  { label: 'Create Post', route: '/create-post', icon: 'Newspaper' },
  { label: 'Create Pitch Reel', route: '/create-pitch-reel', icon: 'Play' },
  { label: 'Start FundMe Campaign', route: '/fundme', icon: 'HandCoins' },
  { label: 'Create Event', route: '/events', icon: 'CalendarDays' },
  { label: 'List Product or Service', route: '/marketplace', icon: 'Store' },
  { label: 'Create Group', route: '/groups', icon: 'Users' },
]

const accountMenuItems = [
  { label: 'Profile', route: '/profile', icon: 'UserRound', description: 'Public identity and business info' },
  { label: 'Account Settings', route: '/settings', icon: 'Settings', description: 'Security, privacy, and preferences' },
]

function getDisplayName(user) {
  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName || user?.name || user?.fullName || user?.full_name || user?.email || 'BizSocials Member'
}

function getBusinessName(user) {
  return (
    user?.businessName ||
    user?.business_name ||
    user?.company ||
    user?.organization ||
    'BizSocials Account'
  )
}

function getAvatarUrl(user) {
  return user?.photoUrl || user?.avatarUrl || user?.avatar_url || ''
}

function TopHeader({ onMenuClick, user, currentRoute, onNavigate, onSignOut }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const createRef = useRef(null)
  const profileRef = useRef(null)
  const displayName = getDisplayName(user)
  const businessName = getBusinessName(user)
  const avatarUrl = getAvatarUrl(user)

  useEffect(() => {
    function handleClose(event) {
      if (event.key === 'Escape') {
        setCreateOpen(false)
        setProfileOpen(false)
      }

      if (event.type === 'mousedown') {
        if (createRef.current && !createRef.current.contains(event.target)) {
          setCreateOpen(false)
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setProfileOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleClose)
    document.addEventListener('mousedown', handleClose)
    return () => {
      document.removeEventListener('keydown', handleClose)
      document.removeEventListener('mousedown', handleClose)
    }
  }, [])

  function handleAccountNavigate(route) {
    setProfileOpen(false)
    onNavigate(route)
  }

  function handleCreateNavigate(route) {
    setCreateOpen(false)
    onNavigate(route)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-[70px] w-full items-center gap-3 px-4 sm:px-5 xl:px-6">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <DynamicIcon name="Menu" className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative hidden w-full max-w-[470px] flex-1 md:block">
          <DynamicIcon
            name="Search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search BizSocials..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-16 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
            Ctrl K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <IconButton label="Notifications">
              <DynamicIcon name="Bell" className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            <StatusBadge className="absolute -right-1 -top-1 h-5 min-w-5 px-0">6</StatusBadge>
          </div>

          <div className="relative" ref={createRef}>
            <button
              type="button"
              onClick={() => setCreateOpen((open) => !open)}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]"
              aria-expanded={createOpen}
              aria-haspopup="menu"
            >
              <DynamicIcon name="Plus" className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Create</span>
              <DynamicIcon name="ChevronDown" className="h-4 w-4" aria-hidden="true" />
            </button>

            {createOpen ? (
              <div className="absolute right-0 top-12 z-40 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl" role="menu">
                {createItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleCreateNavigate(item.route)}
                    className="block min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    role="menuitem"
                  >
                    <span className="flex items-center gap-2.5">
                      <DynamicIcon name={item.icon} className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="hidden h-8 w-px bg-slate-200 md:block" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex min-h-12 items-center gap-2 rounded-2xl border border-transparent px-1.5 py-1 transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99]"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <AvatarPlaceholder className="h-10 w-10" label={displayName} imageUrl={avatarUrl} />
              <span className="hidden max-w-44 text-left md:block">
                <span className="block truncate text-sm font-semibold text-slate-900">{displayName}</span>
                <span className="block truncate text-xs text-slate-500">{businessName}</span>
              </span>
              <DynamicIcon name="ChevronDown" className="hidden h-4 w-4 text-slate-500 md:block" aria-hidden="true" />
            </button>

            {profileOpen ? (
              <div
                className="absolute right-0 top-14 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/12"
                role="menu"
              >
                <div className="mb-1 rounded-xl bg-slate-50 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">{businessName}</p>
                </div>

                {accountMenuItems.map((item) => {
                  const active = currentRoute === item.route

                  return (
                    <button
                      key={item.route}
                      type="button"
                      onClick={() => handleAccountNavigate(item.route)}
                      className={`group flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                      role="menuitem"
                    >
                      <span className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${active ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-white'}`}>
                        <DynamicIcon name={item.icon} className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block truncate text-xs text-slate-500">{item.description}</span>
                      </span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false)
                    onSignOut()
                  }}
                  className="mt-2 flex min-h-11 w-full items-center justify-between rounded-xl border-t border-slate-100 px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  role="menuitem"
                >
                  Sign Out
                  <DynamicIcon name="ChevronDown" className="h-4 w-4 rotate-90" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopHeader
