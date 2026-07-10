import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../modules/auth/context/useAuth'
import { fundmeRepository } from '../repositories/fundmeRepository'

const TAB_OPTIONS = [
  { id: 'discover', label: 'Discover' },
  { id: 'my-campaigns', label: 'My Campaigns' },
  { id: 'supported', label: 'Supported' },
  { id: 'following', label: 'Following' },
]

function toProgressWidth(value) {
  return Math.max(0, Math.min(Number(value || 0), 100))
}

const INITIAL_CREATE_FORM = {
  title: '',
  summary: '',
  goalAmount: '',
  status: 'draft',
}

function FundMePage({ onNavigate }) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('discover')
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOverview() {
      try {
        setError('')
        const next = await fundmeRepository.getOverview({ token, tab: activeTab })
        if (!active) {
          return
        }

        setPayload(next)
      } catch (loadError) {
        if (!active) {
          return
        }

        setPayload(null)
        setError(loadError?.message || 'Could not load FundMe campaigns.')
      }
    }

    loadOverview()

    return () => {
      active = false
    }
  }, [activeTab, token])

  const campaigns = useMemo(() => (Array.isArray(payload?.campaigns) ? payload.campaigns.slice(0, 3) : []), [payload])

  function handleCreateCampaignClick() {
    if (onNavigate) {
      onNavigate('/fundme/create')
      return
    }

    setCreateForm(INITIAL_CREATE_FORM)
    setCreateError('')
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (isCreatingCampaign) {
      return
    }
    setIsCreateModalOpen(false)
  }

  function updateCreateField(field, value) {
    setCreateForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleCreateCampaign(event) {
    event.preventDefault()
    if (!token || isCreatingCampaign) {
      return
    }

    const title = createForm.title.trim()
    if (!title) {
      setCreateError('Campaign title is required.')
      return
    }

    const goalAmount = Number(createForm.goalAmount)
    if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
      setCreateError('Goal amount must be greater than zero.')
      return
    }

    try {
      setIsCreatingCampaign(true)
      setCreateError('')
      const created = await fundmeRepository.createCampaignApi(token, {
        title,
        summary: createForm.summary.trim() || 'Campaign summary to be updated.',
        goal_amount: goalAmount,
        status: createForm.status,
      })
      setIsCreateModalOpen(false)
      onNavigate(`/fundme/campaign/${created.id}`)
    } catch (submitError) {
      setCreateError(submitError?.message || 'Could not create campaign.')
    } finally {
      setIsCreatingCampaign(false)
    }
  }

  if (error) {
    return <p className="text-sm font-semibold text-red-600">{error}</p>
  }

  if (!payload) {
    return <p className="text-sm text-slate-500">Loading FundMe campaigns...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">FundMe Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500">Discover business ideas worth supporting and raise capital for your next stage.</p>
        </div>
        <button
          type="button"
          onClick={handleCreateCampaignClick}
          disabled={!token}
          className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Create Campaign
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-7 items-center rounded-lg px-3 text-[11px] font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-slate-200 p-3">
              <div className={`mb-3 h-24 overflow-hidden rounded-lg bg-gradient-to-r ${campaign.surface}`}>
                {campaign.imageUrl ? (
                  <img src={campaign.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>
              <p className="text-xl text-blue-900">|</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{campaign.title}</p>
              <p className="text-xs text-slate-500">{campaign.subtitle}</p>

              <div className="mt-4 h-1.5 rounded-full bg-slate-200">
                <div className={`h-1.5 rounded-full ${campaign.accent}`} style={{ width: `${toProgressWidth(campaign.fundedPercent)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                <p className="text-blue-700">{campaign.fundedPercent}% funded</p>
                <p className="text-slate-700">{campaign.raisedLabel}</p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(`/fundme/campaign/${campaign.id}`)}
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
              >
                View Campaign
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,52%)_minmax(0,48%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Featured Campaigns</h2>
            <button type="button" className="text-xs font-semibold text-blue-600">Explore all &gt;</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(payload.featured || []).map((campaign) => (
              <article key={campaign.id} className="rounded-xl border border-slate-200 p-3">
                {campaign.imageUrl ? (
                  <img src={campaign.imageUrl} alt="" className="mb-3 h-20 w-full rounded-lg object-cover" loading="lazy" />
                ) : null}
                <p className="text-sm font-bold text-slate-900">{campaign.title}</p>
                <p className="mt-1 text-xs text-slate-500">{campaign.subtitle}</p>
                <div className="mt-4 h-1.5 rounded-full bg-slate-200">
                  <div className={`h-1.5 rounded-full ${campaign.accent}`} style={{ width: `${toProgressWidth(campaign.percent)}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700">{campaign.progressText}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Funding activity</h2>
            <button type="button" className="text-xs font-semibold text-blue-600">See all &gt;</button>
          </div>

          <div className="space-y-3">
            {(payload.activity || []).map((item) => (
              <article key={item.id}>
                <p className="text-sm font-semibold text-slate-900">{item.text}</p>
                <p className="text-xs text-slate-500">{item.at}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Campaign</h2>
                <p className="mt-1 text-sm text-slate-500">Set up a fundraiser to raise capital for your business goal.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isCreatingCampaign}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close create campaign dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Campaign title</label>
                <input
                  value={createForm.title}
                  onChange={(event) => updateCreateField('title', event.target.value)}
                  placeholder="e.g. EcoWay Apparel Growth Fund"
                  maxLength={255}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Summary</label>
                <textarea
                  value={createForm.summary}
                  onChange={(event) => updateCreateField('summary', event.target.value)}
                  placeholder="Describe your campaign and how funds will be used."
                  rows={3}
                  maxLength={4000}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Goal amount (USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={createForm.goalAmount}
                    onChange={(event) => updateCreateField('goalAmount', event.target.value)}
                    placeholder="10000"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
                  <select
                    value={createForm.status}
                    onChange={(event) => updateCreateField('status', event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              {createError ? <p className="text-sm font-semibold text-red-600">{createError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreatingCampaign}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCampaign}
                  className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingCampaign ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FundMePage
