import { ShieldCheck } from 'lucide-react'
import heroArt from '../../../assets/hero.png'
import { appConfig } from '../../../config/appConfig'

function getDomainLabel() {
  try {
    return new URL(appConfig.appDomain).host || 'bizsocials.com'
  } catch {
    return appConfig.appDomain || 'bizsocials.com'
  }
}

function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#082c9a] via-[#0f3ecf] to-[#021840] px-10 py-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-x-10 top-20 h-px bg-white/15" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">BizSocials</p>
              <p className="mt-1 text-sm text-blue-100">{getDomainLabel()}</p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100/80">
              Business network
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Build, fund, and grow from one secure workspace.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50/85">
              Keep founder activity, funding tools, events, messages, and marketplace workflows
              connected behind authenticated access.
            </p>
          </div>

          <img
            src={heroArt}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 right-8 h-56 w-56 opacity-80"
          />
        </section>

        <section className="flex min-h-screen items-start justify-center px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:px-10">
          <div className="w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-7">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthLayout
