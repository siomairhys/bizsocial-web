import { quickActions } from '../../data/dashboardData'
import AvatarPlaceholder from '../common/AvatarPlaceholder'
import { DynamicIcon } from '../common/icons'

function getDisplayName(user) {
  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName || user?.name || user?.fullName || user?.full_name || user?.email || 'BizSocials Member'
}

function getAvatarUrl(user) {
  return user?.photoUrl || user?.avatarUrl || user?.avatar_url || ''
}

function WelcomeBanner({ user }) {
  const displayName = getDisplayName(user)
  const firstName = displayName.split(' ')[0] || displayName
  const avatarUrl = getAvatarUrl(user)

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0630b7] via-[#104be2] to-[#1d35d8] px-4 py-4 text-white shadow-xl shadow-blue-950/25 sm:px-5 lg:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-24 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.22),transparent_34%)]" />
        <div className="absolute right-12 top-6 h-px w-80 rotate-[-8deg] bg-white/20" />
        <div className="absolute right-16 top-12 h-px w-72 rotate-[-8deg] bg-white/12" />
      </div>

      <div className="relative grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center">
          <AvatarPlaceholder
            className="h-16 w-16 flex-none border-2 border-white/50 from-white/95 to-blue-100/85 text-blue-900 shadow-lg shadow-blue-950/20 sm:h-20 sm:w-20"
            label={displayName}
            imageUrl={avatarUrl}
          />

          <div className="min-w-0 flex-1">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 max-w-xl text-sm font-medium leading-5 text-blue-50 sm:text-[15px]">
                Your business is growing. Keep the momentum going and let's turn your vision into impact.
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={`#${action.route}`}
                  className="group flex min-h-[58px] items-center gap-3 rounded-xl border border-white/20 bg-white/12 px-3 py-2.5 text-left shadow-sm shadow-blue-950/10 transition duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/20 hover:shadow-lg hover:shadow-blue-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700 active:scale-[0.98]"
                >
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-white/15 text-white transition group-hover:bg-white/25">
                    <DynamicIcon name={action.icon} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-4 text-white">{action.label}</span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-blue-100">
                      {action.description}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden h-36 lg:block">
          <div className="absolute bottom-0 right-0 h-20 w-52 rounded-[50%] bg-white/18 blur-xl" />
          <div className="absolute bottom-1 right-4 h-14 w-44 rounded-[50%] bg-blue-100/20" />
          <div className="absolute right-12 top-1 grid h-24 w-24 -rotate-12 place-items-center rounded-[2rem] border border-white/20 bg-white/12 shadow-2xl shadow-blue-950/20 backdrop-blur-sm">
            <DynamicIcon name="Rocket" className="h-14 w-14 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
          <div className="absolute right-24 top-20 h-5 w-5 rounded-full bg-white/30 blur-sm" />
          <div className="absolute right-7 top-28 h-3 w-3 rounded-full bg-white/25 blur-sm" />
        </div>
      </div>
    </section>
  )
}

export default WelcomeBanner
