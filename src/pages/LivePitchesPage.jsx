import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../modules/auth/context/useAuth'

import {
  livePitchesRepository,
} from '../repositories/livePitchesRepository'

function toProgressWidth(score) {
  return Math.max(0, Math.min(Number(score || 0), 100))
}

function toBattleMatchups(battles = []) {
  const rows = []
  for (let index = 0; index < battles.length; index += 2) {
    rows.push(battles.slice(index, index + 2))
  }
  return rows
}

function LivePitchesPage({ onNavigate }) {
  const { token } = useAuth()
  const [payload, setPayload] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardItems, setLeaderboardItems] = useState([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')

  const upcomingSectionRef = useRef(null)

  function scrollToUpcoming() {
    upcomingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function toggleLeaderboard() {
    const nextOpen = !showLeaderboard
    setShowLeaderboard(nextOpen)

    if (!nextOpen || leaderboardItems.length > 0 || isLoadingLeaderboard) {
      return
    }

    const sessionId = Number(payload?.event?.sessionId || 0)
    if (payload?.source === 'static') {
      setLeaderboardError('')
      setLeaderboardItems(
        (payload.battles || []).map((item, index) => ({
          id: item.id,
          rank: index + 1,
          name: item.name,
          score: Number(item.score || 0),
          fundsRaised: (index + 1) * 1250,
        })),
      )
      return
    }

    if (!token || !Number.isFinite(sessionId) || sessionId <= 0) {
      setLeaderboardError('Sign in and open a valid live session to load leaderboard.')
      return
    }

    try {
      setIsLoadingLeaderboard(true)
      setLeaderboardError('')
      const response = await livePitchesRepository.leaderboardApi(token, sessionId, { limit: 5, offset: 0 })
      const items = Array.isArray(response?.items) ? response.items : []
      setLeaderboardItems(
        items.map((item, index) => ({
          id: item.id,
          rank: index + 1,
          name: item.display_name || 'Pitch Entry',
          score: Number(item.score || 0),
          fundsRaised: Number(item.funds_raised || 0),
        })),
      )
    } catch {
      setLeaderboardError('Could not load leaderboard right now.')
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadOverview() {
      try {
        setLoadError('')
        const next = await livePitchesRepository.getOverview({ token })
        if (!active) {
          return
        }

        setPayload(next)
      } catch (error) {
        if (!active) {
          return
        }

        setPayload(null)
        setLoadError(error?.message || 'Could not load live pitches from the API.')
      }
    }

    loadOverview()

    return () => {
      active = false
    }
  }, [token])

  if (loadError) {
    return <p className="text-sm font-semibold text-red-600">{loadError}</p>
  }

  if (!payload) {
    return <p className="text-sm text-slate-500">Loading live pitches...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Live Pitches</h1>
          <p className="mt-1 text-sm text-slate-500">Watch founders pitch in real time. Vote, connect, and fund opportunities.</p>
        </div>
        <button
          type="button"
          onClick={scrollToUpcoming}
          className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          View Schedule
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <p className="text-sm font-bold text-rose-500">LIVE NOW - {payload.event.title}</p>
          <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#a9c5e3] to-[#1a377e] p-4 text-white">
            {payload.event.imageUrl ? (
              <img src={payload.event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="relative inline-flex rounded-full bg-blue-900/90 px-3 py-1 text-[11px] font-semibold">LIVE PITCH ARENA</div>
            <div className="relative mt-20 pb-4">
              <p className="text-4xl font-black tracking-tight">Pitch. Vote. Fund.</p>
              <p className="mt-1 text-sm text-blue-100">Watch founders pitch their ventures live and support with BizBucks.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!payload.event.sessionId}
            onClick={() => onNavigate(`/live-pitches/session/${payload.event.sessionId || 1}`)}
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {payload.event.ctaLabel}
          </button>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Pitch Battles</h2>
              <button type="button" onClick={toggleLeaderboard} className="text-xs font-semibold text-blue-600">
                {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
              </button>
            </div>

            <div className="space-y-3">
              {toBattleMatchups(payload.battles).map((matchup, matchupIndex) => (
                <div key={`matchup-${matchupIndex}`} className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <article className="rounded-xl border border-slate-200 p-3">
                    {matchup[0] ? (
                      <>
                        <div className="mb-0.5 flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900">{matchup[0].name}</p>
                          <p className="text-sm font-bold text-slate-700">{matchup[0].score}</p>
                        </div>
                        <p className="mb-2 text-[10px] font-medium text-slate-400">Innovation for small businesses</p>
                        <div className="h-1.5 rounded-full bg-slate-200">
                          <div className={`h-1.5 rounded-full ${matchup[0].accent}`} style={{ width: `${toProgressWidth(matchup[0].score)}%` }} />
                        </div>
                      </>
                    ) : null}
                  </article>

                  <div className="hidden text-center text-2xl font-black text-blue-600 sm:block">VS</div>

                  <article className="rounded-xl border border-slate-200 p-3">
                    {matchup[1] ? (
                      <>
                        <div className="mb-0.5 flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900">{matchup[1].name}</p>
                          <p className="text-sm font-bold text-slate-700">{matchup[1].score}</p>
                        </div>
                        <p className="mb-2 text-[10px] font-medium text-slate-400">Innovation for small businesses</p>
                        <div className="h-1.5 rounded-full bg-slate-200">
                          <div className={`h-1.5 rounded-full ${matchup[1].accent}`} style={{ width: `${toProgressWidth(matchup[1].score)}%` }} />
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">Awaiting challenger</p>
                    )}
                  </article>
                </div>
              ))}
            </div>
            {payload.battles.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No leaderboard entries yet for this session.</p>
            ) : null}

            {showLeaderboard ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Ranking</p>
                {isLoadingLeaderboard ? (
                  <p className="mt-2 text-sm text-slate-500">Loading leaderboard...</p>
                ) : null}
                {leaderboardError ? (
                  <p className="mt-2 text-sm font-semibold text-red-600">{leaderboardError}</p>
                ) : null}
                {!isLoadingLeaderboard && !leaderboardError ? (
                  <div className="mt-2 space-y-2">
                    {leaderboardItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">#{item.rank} {item.name}</p>
                          <p className="text-xs text-slate-500">${item.fundsRaised.toFixed(2)} raised</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{item.score}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-lg font-bold text-slate-900">How it works</h3>
            <ol className="mt-2 space-y-2 text-sm text-slate-600">
              <li>1. Watch founders pitch live.</li>
              <li>2. Vote with BizBucks to boost.</li>
              <li>3. Connect or fund in real time.</li>
            </ol>
          </div>
        </section>
      </div>

      <section ref={upcomingSectionRef} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Live Pitches</h2>
          <button type="button" onClick={scrollToUpcoming} className="text-xs font-semibold text-blue-600">View schedule</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {payload.upcoming.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.date} - {item.time}</p>
              <button
                type="button"
                onClick={() => item.sessionId && onNavigate(`/live-pitches/session/${item.sessionId}`)}
                className="mt-3 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                Set reminder
              </button>
            </article>
          ))}
        </div>
        {payload.upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No upcoming sessions are currently scheduled in the database.</p>
        ) : null}
      </section>
    </div>
  )
}

export default LivePitchesPage
