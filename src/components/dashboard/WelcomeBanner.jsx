import AvatarPlaceholder from '../common/AvatarPlaceholder'
import PlaceholderImage from '../common/PlaceholderImage'
import { quickActions } from '../../data/dashboardData'
import { DynamicIcon } from '../common/icons'

function WelcomeBanner() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#184dcf] via-[#1543c3] to-[#1e63df] p-4 text-white shadow-xl shadow-blue-950/20 sm:p-5 lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start gap-3">
            <AvatarPlaceholder
              className="h-14 w-14 border-blue-200/40 from-blue-200/35 to-blue-100/20"
              label="Photo"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Welcome back, Marcus! 👋</h1>
              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Your business is growing. Keep the momentum going and let&apos;s turn your vision into impact.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <DynamicIcon name={action.icon} className="h-4 w-4" aria-hidden="true" />
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs text-blue-100">{action.description}</span>
              </button>
            ))}
          </div>
        </div>

        <PlaceholderImage
          label="Hero"
          variant="hero"
          className="h-44 border-blue-200/30 from-blue-200/30 to-blue-100/20"
          ariaLabel="Decorative hero placeholder"
        />
      </div>
    </section>
  )
}

export default WelcomeBanner
