import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../modules/auth/context/useAuth'
import { fundmeRepository } from '../repositories/fundmeRepository'

const DEFAULT_CAMPAIGN_ID = '1'

function getCampaignIdFromHash() {
  const route = window.location.hash.replace('#', '')
  const match = route.match(/\/fundme\/campaign\/(\w+)/)
  return match ? String(match[1]) : DEFAULT_CAMPAIGN_ID
}

function toProgressWidth(value) {
  return Math.max(0, Math.min(Number(value || 0), 100))
}

function getOwnerInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  return `${first}${last}`.toUpperCase() || 'BS'
}

function FundMeCampaignDetailPage() {
  const { token, user } = useAuth()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [selectionMessage, setSelectionMessage] = useState('')
  const [isFunding, setIsFunding] = useState(false)
  const [isPostingUpdate, setIsPostingUpdate] = useState(false)
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateText, setUpdateText] = useState('')
  const [selectedContribution, setSelectedContribution] = useState(null)

  const campaignId = getCampaignIdFromHash()

  const isOwner = useMemo(() => {
    if (!payload?.ownerUserId || !user?.id) {
      return false
    }
    return Number(payload.ownerUserId) === Number(user.id)
  }, [payload?.ownerUserId, user?.id])

  const suggestedContributions = payload?.suggestedContributions || []
  const hasSelectedContribution = suggestedContributions.some(
    (option) => Number(option.amount) === Number(selectedContribution),
  )
  const activeContribution = hasSelectedContribution ? selectedContribution : null

  useEffect(() => {
    let active = true

    async function loadDetail() {
      try {
        setError('')
        const next = await fundmeRepository.getCampaignDetail({ token, campaignId })
        if (!active) {
          return
        }

        setPayload(next)
      } catch (loadError) {
        if (!active) {
          return
        }

        setPayload(null)
        setError(loadError?.message || 'Could not load campaign detail.')
      }
    }

    loadDetail()

    return () => {
      active = false
    }
  }, [campaignId, token])

  async function refreshDetail() {
    const next = await fundmeRepository.getCampaignDetail({ token, campaignId })
    setPayload(next)
  }

  async function handleShareCampaign() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/fundme/campaign/${campaignId}`

    try {
      setError('')
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setActionMessage('Campaign link copied to clipboard.')
      } else {
        setActionMessage(`Share this link: ${shareUrl}`)
      }
    } catch {
      setActionMessage(`Share this link: ${shareUrl}`)
    }
  }

  async function handleFundCampaign(amount) {
    if (!token || isFunding || !amount) {
      return
    }

    try {
      setError('')
      setActionMessage('')
      setSelectionMessage('')
      setIsFunding(true)
      await fundmeRepository.contributeApi(token, campaignId, {
        amount,
        note: 'FundMe contribution from campaign page',
      })
      await refreshDetail()
      setActionMessage(`Contribution of $${Number(amount).toLocaleString()} submitted.`)
    } catch (actionError) {
      setError(actionError?.message || 'Could not submit contribution.')
    } finally {
      setIsFunding(false)
    }
  }

  async function handlePostUpdate(event) {
    event.preventDefault()
    if (!token || !isOwner || isPostingUpdate) {
      return
    }

    if (!updateTitle.trim() || !updateText.trim()) {
      setError('Update title and text are required.')
      return
    }

    try {
      setError('')
      setActionMessage('')
      setIsPostingUpdate(true)
      await fundmeRepository.createCampaignUpdateApi(token, campaignId, {
        title: updateTitle.trim(),
        text: updateText.trim(),
      })
      setUpdateTitle('')
      setUpdateText('')
      await refreshDetail()
      setActionMessage('Campaign update posted.')
    } catch (actionError) {
      setError(actionError?.message || 'Could not post campaign update.')
    } finally {
      setIsPostingUpdate(false)
    }
  }

  const circleStyle = useMemo(() => {
    const value = toProgressWidth(payload?.progressPercent)
    return {
      background: `conic-gradient(#2563eb ${value}%, #e2e8f0 ${value}% 100%)`,
    }
  }, [payload?.progressPercent])

  if (error) {
    return <p className="text-sm font-semibold text-red-600">{error}</p>
  }

  if (!payload) {
    return <p className="text-sm text-slate-500">Loading campaign detail...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Campaign Detail</h1>
        <p className="mt-1 text-sm text-slate-500">Review the opportunity, follow updates, and fund the next milestone.</p>
        {actionMessage ? <p className="mt-2 text-sm font-semibold text-emerald-700">{actionMessage}</p> : null}
        {selectionMessage ? <p className="mt-2 text-sm font-semibold text-blue-700">{selectionMessage}</p> : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,62%)_minmax(0,38%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#dbe8f7] to-[#1e3a8a] p-5 text-white">
            {payload.imageUrl ? (
              <img src={payload.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
            <div className="relative h-52" />
            <p className="relative text-4xl text-blue-900">|</p>
            <p className="relative mt-2 text-4xl font-black tracking-tight text-white">{payload.title}</p>
            <p className="relative mt-1 text-sm text-blue-100">{payload.subtitle}</p>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                {payload.ownerAvatarUrl ? (
                  <img src={payload.ownerAvatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  getOwnerInitials(payload.ownerName)
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{payload.ownerName}</p>
                <p className="text-xs text-slate-500">{payload.ownerMeta}</p>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Verified Business</div>
          </div>

          <p className="mt-4 text-sm text-slate-700">{payload.summary}</p>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Updates</h2>
              <button type="button" className="text-xs font-semibold text-blue-600">See all &gt;</button>
            </div>

            {(payload.updates || []).map((update) => (
              <article key={update.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-bold text-slate-900">{update.title}</p>
                <p className="mt-1 text-sm text-slate-600">{update.text}</p>
              </article>
            ))}

            {isOwner ? (
              <form onSubmit={handlePostUpdate} className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-500">Post update</p>
                <input
                  value={updateTitle}
                  onChange={(event) => setUpdateTitle(event.target.value)}
                  placeholder="Update title"
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm"
                />
                <textarea
                  value={updateText}
                  onChange={(event) => setUpdateText(event.target.value)}
                  placeholder="Update text"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={isPostingUpdate}
                  className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white"
                >
                  {isPostingUpdate ? 'Posting...' : 'Post update'}
                </button>
              </form>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Campaign Progress</h2>
              <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{payload.daysLeft} days left</div>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-full p-2" style={circleStyle}>
                <div className="grid h-full w-full place-items-center rounded-full bg-white text-3xl font-bold text-slate-700">
                  {payload.progressPercent}%
                </div>
              </div>
              <div>
                <p className="text-5xl font-black text-slate-900">${payload.raised.toLocaleString()}</p>
                <p className="text-xs font-semibold text-slate-500">raised of ${payload.goal.toLocaleString()} goal</p>
                <p className="mt-2 text-sm font-bold text-slate-700">{payload.supporters} supporters</p>
              </div>
            </div>

            <div className="mt-4 h-1.5 rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${toProgressWidth(payload.progressPercent)}%` }} />
            </div>

            <button
              type="button"
              onClick={() => handleFundCampaign(activeContribution)}
              disabled={isFunding || !activeContribution}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white"
            >
              {isFunding
                ? 'Processing...'
                : activeContribution
                  ? `Fund This Campaign ($${Number(activeContribution).toLocaleString()})`
                  : 'Select an amount'}
            </button>
            <button
              type="button"
              onClick={handleShareCampaign}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Share Campaign
            </button>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-xl font-bold text-slate-900">Fund in a way that works for you</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(payload.suggestedContributions || []).map((option) => (
                <div
                  key={option.amount}
                  className={`rounded-xl border p-3 ${
                    Number(activeContribution) === Number(option.amount)
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200'
                  }`}
                >
                  <p className="text-4xl font-black text-slate-900">${option.amount}</p>
                  <p className="text-xs text-slate-500">{option.caption}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedContribution(Number(option.amount))
                      setActionMessage('')
                      setError('')
                      setSelectionMessage(
                        `Selected $${Number(option.amount).toLocaleString()} contribution. Click Fund This Campaign to continue.`,
                      )
                    }}
                    disabled={isFunding}
                    className="mt-3 inline-flex h-7 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    {Number(activeContribution) === Number(option.amount) ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}

export default FundMeCampaignDetailPage
