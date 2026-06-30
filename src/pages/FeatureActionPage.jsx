import Card from '../components/common/Card'
import { DynamicIcon } from '../components/common/icons'

function FeatureActionPage({ eyebrow, title, description, icon, primaryAction, checklist = [] }) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[var(--shadow-card)]">
        <div className="relative bg-gradient-to-r from-[#0737c6] via-[#1155e8] to-[#2139d6] px-5 py-8 text-white sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
            <div className="absolute bottom-0 right-12 h-24 w-72 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-blue-50 sm:text-base">{description}</p>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-3xl border border-white/25 bg-white/14 shadow-xl shadow-blue-950/20 backdrop-blur-sm">
              <DynamicIcon name={icon} className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Workspace shell</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This tab is wired into the dashboard navigation. Add the backend workflow here when the API and database tables are ready.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {primaryAction}
          </button>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">Suggested fields</h2>
          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <DynamicIcon name="Check" className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default FeatureActionPage
