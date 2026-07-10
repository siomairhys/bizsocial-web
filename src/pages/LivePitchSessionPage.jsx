import { useEffect, useState } from 'react'
import { useAuth } from '../modules/auth/context/useAuth'

import {
  livePitchesRepository,
} from '../repositories/livePitchesRepository'

function toProgressWidth(score) {
  return Math.max(0, Math.min(Number(score || 0), 100))
}

const ENABLE_LIVE_PITCHES_API =
  (import.meta.env.VITE_ENABLE_LIVE_PITCHES_API || 'false').toLowerCase() === 'true'

const DEFAULT_LIVE_SESSION_ID = 1
const WATCHER_TOUCH_INTERVAL_MS = 30_000
const LEADERBOARD_REFRESH_INTERVAL_MS = 45_000

function getLiveSessionIdFromHash() {
  const route = window.location.hash.replace('#', '')
  const match = route.match(/\/live-pitches\/session\/(\d+)/)
  return match ? Number(match[1]) : DEFAULT_LIVE_SESSION_ID
}

function getChatName(item) {
  const business = String(item?.author_business_name || '').trim()
  if (business) {
    return business
  }

  const fullName = `${String(item?.author_first_name || '').trim()} ${String(item?.author_last_name || '').trim()}`.trim()
  if (fullName) {
    return fullName
  }

  return 'BizSocials Member'
}

function LivePitchSessionPage() {
  const { token } = useAuth()
  const [payload, setPayload] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [fundInput, setFundInput] = useState('250')
  const [voteCredits, setVoteCredits] = useState(10)
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [isSubmittingFund, setIsSubmittingFund] = useState(false)
  const [actionStatus, setActionStatus] = useState('')

  const liveSessionId = getLiveSessionIdFromHash()

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        setLoadError('')
        const next = await livePitchesRepository.getSession({ token, livePitchId: liveSessionId })
        if (!active) {
          return
        }

        setPayload(next)
      } catch (error) {
        if (!active) {
          return
        }

        setPayload(null)
        setLoadError(error?.message || 'Could not load live pitch session from the API.')
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [liveSessionId, token])

  useEffect(() => {
    if (!ENABLE_LIVE_PITCHES_API || !token) {
      return undefined
    }

    let cancelled = false

    async function touchWatcher() {
      try {
        const touched = await livePitchesRepository.touchWatcherApi(token, liveSessionId)
        if (cancelled) {
          return
        }

        setPayload((previous) => {
          if (!previous) {
            return previous
          }

          return {
            ...previous,
            watching: touched.watching_count,
          }
        })
      } catch {
        // Keep UI stable if realtime heartbeat fails.
      }
    }

    async function refreshLeaderboard() {
      try {
        const leaderboard = await livePitchesRepository.leaderboardApi(token, liveSessionId, { limit: 1, offset: 0 })
        if (cancelled || !Array.isArray(leaderboard?.items) || leaderboard.items.length === 0) {
          return
        }

        const top = leaderboard.items[0]
        setPayload((previous) => {
          if (!previous || !previous.currentPitch) {
            return previous
          }

          return {
            ...previous,
            currentPitch: {
              ...previous.currentPitch,
              name: top.display_name || previous.currentPitch.name,
              headline: top.headline || previous.currentPitch.headline,
              summary: top.summary || previous.currentPitch.summary,
              score: Number.isFinite(Number(top.score)) ? Number(top.score) : previous.currentPitch.score,
            },
          }
        })
      } catch {
        // Ignore transient refresh errors.
      }
    }

    touchWatcher()
    refreshLeaderboard()

    const watcherInterval = window.setInterval(touchWatcher, WATCHER_TOUCH_INTERVAL_MS)
    const leaderboardInterval = window.setInterval(refreshLeaderboard, LEADERBOARD_REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(watcherInterval)
      window.clearInterval(leaderboardInterval)
    }
  }, [liveSessionId, token])

  async function handleSendChat(event) {
    event.preventDefault()

    const message = chatInput.trim()
    if (!message || isSendingChat) {
      return
    }

    if (!ENABLE_LIVE_PITCHES_API || !token) {
      setActionStatus('Live Pitches API is disabled. Set VITE_ENABLE_LIVE_PITCHES_API=true.')
      return
    }

    try {
      setIsSendingChat(true)
      const created = await livePitchesRepository.createChatApi(token, liveSessionId, { message })

      setPayload((previous) => {
        if (!previous) {
          return previous
        }

        const nextEntry = {
          id: String(created.id),
          name: getChatName(created),
          text: String(created.message || ''),
        }

        return {
          ...previous,
          chat: [...previous.chat, nextEntry].slice(-50),
        }
      })
      setChatInput('')
      setActionStatus('Chat message sent.')
    } catch {
      setActionStatus('Unable to send chat message right now.')
    } finally {
      setIsSendingChat(false)
    }
  }

  async function handleVote(credits) {
    if (isSubmittingVote || !payload?.currentPitch?.entryId) {
      return
    }

    if (!ENABLE_LIVE_PITCHES_API || !token) {
      setActionStatus('Live Pitches API is disabled. Set VITE_ENABLE_LIVE_PITCHES_API=true.')
      return
    }

    try {
      setIsSubmittingVote(true)
      await livePitchesRepository.voteApi(token, liveSessionId, {
        entry_id: payload.currentPitch.entryId,
        credits,
      })

      setVoteCredits(credits)
      setActionStatus(`Vote submitted: ${credits} BizBucks.`)
    } catch {
      setActionStatus('Unable to submit vote right now.')
    } finally {
      setIsSubmittingVote(false)
    }
  }

  async function handleFund() {
    if (isSubmittingFund || !payload?.currentPitch?.entryId) {
      return
    }

    if (!ENABLE_LIVE_PITCHES_API || !token) {
      setActionStatus('Live Pitches API is disabled. Set VITE_ENABLE_LIVE_PITCHES_API=true.')
      return
    }

    const amount = Number(fundInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionStatus('Enter a valid fund amount greater than zero.')
      return
    }

    try {
      setIsSubmittingFund(true)
      await livePitchesRepository.fundApi(token, liveSessionId, {
        entry_id: payload.currentPitch.entryId,
        amount,
        currency: 'USD',
      })

      setActionStatus(`Fund submitted: $${amount.toFixed(2)}.`)
    } catch {
      setActionStatus('Unable to submit fund right now.')
    } finally {
      setIsSubmittingFund(false)
    }
  }

  if (loadError) {
    return <p className="text-sm font-semibold text-red-600">{loadError}</p>
  }

  if (!payload) {
    return <p className="text-sm text-slate-500">Loading live pitch session...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Live Pitch Session</h1>
        <p className="mt-1 text-sm text-slate-500">Watch, vote, and connect with live business opportunities.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <p className="text-sm font-bold text-rose-500">LIVE - {payload.title}</p>
          <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#a9c5e3] to-[#1a377e] p-4 text-white">
            {payload.heroImageUrl ? (
              <img src={payload.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div className="inline-flex rounded-full bg-blue-900/90 px-3 py-1 text-[11px] font-semibold">
                PITCHING NOW - {payload.currentPitch.name.toUpperCase()}
              </div>
              <div className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
                {payload.watching} watching
              </div>
            </div>
            <div className="relative mt-24 pb-4">
              <p className="text-4xl font-black tracking-tight">{payload.currentPitch.headline}</p>
              <p className="mt-1 text-sm text-blue-100">{payload.currentPitch.summary}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>{payload.watching} viewers</span>
            <span>Live chat</span>
            <span>Share</span>
            <span>Fullscreen</span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-900">Pitch story</p>
            <p className="mt-1 text-sm text-slate-600">{payload.currentPitch.summary}</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h2 className="text-xl font-bold text-slate-900">Vote with BizBucks</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">Balance: 1,250</p>

            <div className="mt-3">
              <p className="text-sm font-bold text-slate-900">{payload.currentPitch.name}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${toProgressWidth(payload.currentPitch.score)}%` }} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[auto_auto_1fr] gap-2">
              <button
                type="button"
                onClick={() => handleVote(10)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => handleVote(25)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-700"
              >
                +25
              </button>
              <button
                type="button"
                onClick={() => handleVote(voteCredits)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {isSubmittingVote ? 'Submitting...' : 'Boost Pitch'}
              </button>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-sm font-bold text-slate-900">Fund this pitch</p>
              <input
                type="number"
                placeholder="$250.00"
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                value={fundInput}
                min="1"
                step="0.01"
                onChange={(event) => setFundInput(event.target.value)}
                readOnly={!ENABLE_LIVE_PITCHES_API || isSubmittingFund}
              />
              <button
                type="button"
                onClick={handleFund}
                className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white"
              >
                {isSubmittingFund ? 'Submitting...' : 'Send Fund'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-lg font-bold text-slate-900">Live chat</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {payload.chat.map((entry) => (
                <p key={entry.id}>
                  <span className="font-semibold">{entry.name}: </span>
                  <span>{entry.text}</span>
                </p>
              ))}
            </div>
            <form onSubmit={handleSendChat}>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Say something..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  readOnly={!ENABLE_LIVE_PITCHES_API || !token || isSendingChat}
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white"
                >
                  {isSendingChat ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
            {actionStatus ? (
              <p className="mt-2 text-xs font-medium text-slate-500">{actionStatus}</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default LivePitchSessionPage
