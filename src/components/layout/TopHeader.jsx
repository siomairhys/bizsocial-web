import { useEffect, useRef, useState } from 'react'
import AvatarPlaceholder from '../common/AvatarPlaceholder'
import IconButton from '../common/IconButton'
import StatusBadge from '../common/StatusBadge'
import { DynamicIcon } from '../common/icons'

const createItems = [
  'Create Post',
  'Create Pitch',
  'Start Fundraiser',
  'Create Event',
  'Add Marketplace Item',
]

function TopHeader({ onMenuClick }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const createRef = useRef(null)
  const profileRef = useRef(null)

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

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-[70px] w-full items-center gap-3 px-4 sm:px-5 xl:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
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
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-16 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
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
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-expanded={createOpen}
            >
              <DynamicIcon name="Plus" className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Create</span>
              <DynamicIcon name="ChevronDown" className="h-4 w-4" aria-hidden="true" />
            </button>

            {createOpen ? (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {createItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    {item}
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
              className="flex items-center gap-2 rounded-xl border border-transparent px-1 py-1 transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-expanded={profileOpen}
            >
              <AvatarPlaceholder className="h-10 w-10" label="User" />
              <span className="hidden text-left md:block">
                <span className="block text-sm font-semibold text-slate-900">Marcus Holloway</span>
                <span className="block text-xs text-slate-500">Holloway Designs LLC</span>
              </span>
              <DynamicIcon name="ChevronDown" className="hidden h-4 w-4 text-slate-500 md:block" aria-hidden="true" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-14 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                  Profile
                </button>
                <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                  Account Settings
                </button>
                <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">
                  Sign Out
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
