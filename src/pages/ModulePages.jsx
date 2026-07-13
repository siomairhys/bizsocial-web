import { useMemo, useState, useEffect } from 'react'

import AvatarPlaceholder from '../components/common/AvatarPlaceholder'
import Card from '../components/common/Card'
import ProgressBar from '../components/common/ProgressBar'
import StatusBadge from '../components/common/StatusBadge'
import { DynamicIcon } from '../components/common/icons'
import { seedImages } from '../data/defaultSeedData'
import { useAuth } from '../modules/auth/context/useAuth'
import { analyticsRepository } from '../repositories/analyticsRepository'
import { bizbucksRepository } from '../repositories/bizbucksRepository'
import { bizquestRepository } from '../repositories/bizquestRepository'
import { credtrackRepository } from '../repositories/credtrackRepository'
import { coursesRepository } from '../repositories/coursesRepository'
import { eventsRepository } from '../repositories/eventsRepository'
import { groupsRepository } from '../repositories/groupsRepository'
import { marketplaceRepository } from '../repositories/marketplaceRepository'
import { messagesRepository } from '../repositories/messagesRepository'
import { sponsorImpactRepository } from '../repositories/sponsorImpactRepository'

const tabs = ['Overview', 'Featured', 'Saved', 'Mine']

function PageHeader({ title, description, actionLabel, onAction, actionIcon = 'Plus' }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <DynamicIcon name={actionIcon} className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function PillTabs({ items = tabs, active = items[0], onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange?.(item)}
          className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            active === item ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function StatCard({ label, value, trend, icon = 'BarChart3', children }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-600">
              <DynamicIcon name={icon} className="h-4 w-4" aria-hidden="true" />
            </span>
            {label}
          </div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          {children}
        </div>
        {trend ? <span className="text-xs font-bold text-emerald-600">{trend}</span> : null}
      </div>
    </Card>
  )
}

function SectionTitle({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      {action ? <button type="button" className="text-xs font-bold text-blue-600">{action}</button> : null}
    </div>
  )
}

function EmptyMedia({ className = '', label = 'Preview' }) {
  return (
    <div className={`grid place-items-center rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 text-sm font-bold text-blue-600 ${className}`}>
      {label}
    </div>
  )
}

function Field({ label, placeholder, textarea = false, rows = 3, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-500">{label}</span>
      {textarea ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          {...inputProps}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      ) : (
        <input
          placeholder={placeholder}
          {...inputProps}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      )}
    </label>
  )
}

function PublishChecklist({ items, title = 'Before you publish' }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-6 space-y-6">
        {items.map((item, index) => (
          <div key={item} className="flex gap-4">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{item}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                A clear, direct action helps people know what to do next.
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FormShell({
  title,
  description,
  status = 'Draft',
  submitLabel,
  children,
  checklist,
  onSubmit,
  submitting = false,
  submitDisabled = false,
}) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} actionLabel={submitLabel} actionIcon="Check" onAction={onSubmit} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <Card className="min-h-[620px] p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            <span className="rounded-full bg-blue-100 px-8 py-2 text-xs font-bold text-blue-700">{status}</span>
          </div>
          <div className="space-y-5">{children}</div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-blue-700 transition hover:bg-slate-50">
              Save Draft
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || submitDisabled}
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </Card>
        <div className="space-y-4">
          <PublishChecklist items={checklist} />
          <Card className="p-5">
            <h2 className="text-lg font-bold text-slate-950">Helpful guidance</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Design should keep the user in control while making the next step obvious and credible.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

const walletTransactions = [
  ['Reward: Pitch Reel View', '+25', 'text-emerald-600'],
  ['Event RSVP bonus', '+50', 'text-emerald-600'],
  ['Boost campaign support', '-100', 'text-rose-600'],
  ['Marketplace listing fee', '-25', 'text-rose-600'],
]

export function BizBucksWalletPage({ onNavigate }) {
  const { token } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transferMode, setTransferMode] = useState(null)
  const [transferForm, setTransferForm] = useState({ recipientUserId: '2', amount: '50', note: '' })
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState(null)
  const [transferSuccess, setTransferSuccess] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [walletData, txData] = await Promise.all([
          bizbucksRepository.getWallet(token),
          bizbucksRepository.listTransactions(token, { limit: 4, offset: 0 }),
        ])
        setWallet(walletData)
        setTransactions(Array.isArray(txData) ? txData : [])
      } catch (err) {
        setError(err.message || 'Failed to load wallet data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  function openTransferModal(mode) {
    setTransferMode(mode)
    setTransferError(null)
    setTransferSuccess(null)
    setTransferForm({
      recipientUserId: '2',
      amount: mode === 'reward' ? '25' : '50',
      note: mode === 'reward' ? 'Reward for helpful support.' : '',
    })
  }

  function closeTransferModal() {
    if (!transferLoading) {
      setTransferMode(null)
      setTransferError(null)
      setTransferSuccess(null)
    }
  }

  async function handleTransferSubmit() {
    if (!token) {
      setTransferError('Sign in before sending BizBucks.')
      return
    }

    const recipientUserId = Number.parseInt(transferForm.recipientUserId, 10)
    const amount = Number.parseInt(transferForm.amount, 10)

    if (!Number.isInteger(recipientUserId) || recipientUserId <= 0) {
      setTransferError('Enter a valid recipient user ID.')
      return
    }

    if (!Number.isInteger(amount) || amount <= 0 || amount > 10000) {
      setTransferError('Enter an amount from 1 to 10,000.')
      return
    }

    try {
      setTransferLoading(true)
      setTransferError(null)
      setTransferSuccess(null)
      const result = await bizbucksRepository.transferBizBucks(
        token,
        recipientUserId,
        amount,
        transferForm.note.trim() || null
      )

      setWallet((current) => current ? {
        ...current,
        balance: result.sender_new_balance,
        lifetime_spent: Number(current.lifetime_spent || 0) + amount,
        updated_at: result.created_at || new Date().toISOString(),
      } : current)
      setTransactions((current) => [
        {
          id: `transfer-${Date.now()}`,
          note: result.note || `${transferMode === 'reward' ? 'Rewarded' : 'Sent'} BizBucks to user #${recipientUserId}`,
          amount: -amount,
        },
        ...current,
      ].slice(0, 4))
      setTransferSuccess(`${amount.toLocaleString()} BizBucks sent to user #${recipientUserId}.`)
      setTransferForm((current) => ({ ...current, amount: '', note: '' }))
    } catch (err) {
      setTransferError(err.message || 'Failed to send BizBucks.')
    } finally {
      setTransferLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="BizBucks Wallet"
          description="Track rewards, purchases, and boosts across the BizSocials economy."
          actionLabel="Buy BizBucks"
          actionIcon="Wallet"
          onAction={() => onNavigate?.('/bizbucks/buy')}
        />
        <Card className="p-6">
          <p className="text-center text-slate-500">Loading wallet data...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="BizBucks Wallet"
          description="Track rewards, purchases, and boosts across the BizSocials economy."
          actionLabel="Buy BizBucks"
          actionIcon="Wallet"
          onAction={() => onNavigate?.('/bizbucks/buy')}
        />
        <Card className="p-6">
          <p className="text-center text-rose-600">Error: {error}</p>
        </Card>
      </div>
    )
  }

  const displayBalance = wallet?.balance ?? 0
  const displayTransactions = transactions.length > 0 ? transactions : walletTransactions.map(([label, amount]) => ({ note: label, amount: parseInt(amount) }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="BizBucks Wallet"
        description="Track rewards, purchases, and boosts across the BizSocials economy."
        actionLabel="Buy BizBucks"
        actionIcon="Wallet"
        onAction={() => onNavigate?.('/bizbucks/buy')}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-gradient-to-r from-[#0f66d7] to-[#06a9c7] p-6 text-white shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-blue-50">Wallet Balance</p>
            <p className="mt-3 text-4xl font-bold">{displayBalance.toLocaleString()}</p>
            <p className="mt-1 text-sm text-blue-50">BizBucks available for boosts, rewards, and campaign perks.</p>
          </section>
          <Card className="p-5">
            <SectionTitle title="Recent Transactions" action="View all" />
            <div className="space-y-3">
              {Array.isArray(displayTransactions) && displayTransactions.map((tx, idx) => {
                const isTransaction = tx.amount !== undefined && tx.note !== undefined
                const [label, amount, color] = !isTransaction ? tx : [tx.note || 'Transaction', tx.amount > 0 ? `+${tx.amount}` : `${tx.amount}`, tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600']
                
                return (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-blue-600">
                        <DynamicIcon name="Wallet" className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${color}`}>{amount}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Quick Actions" />
            {[
              ['Buy BizBucks', () => onNavigate?.('/bizbucks/buy')],
              ['Send BizBucks', () => openTransferModal('send')],
              ['Reward a member', () => openTransferModal('reward')],
            ].map(([item, onClick]) => (
              <button key={item} type="button" onClick={onClick} className="mb-2 h-10 w-full rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-500 last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                {item}
              </button>
            ))}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Ways to Earn" action="View rules" />
            {['Post engagement', 'Complete profile challenge', 'Host an event'].map((item) => (
              <div key={item} className="mb-3 rounded-xl border border-slate-100 p-3 last:mb-0">
                <p className="text-sm font-bold text-slate-900">{item}</p>
                <p className="mt-1 text-xs text-slate-500">Earn rewards when members engage with your business.</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
      {transferMode ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="bizbucks-transfer-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="bizbucks-transfer-title" className="text-lg font-bold text-slate-950">
                  {transferMode === 'reward' ? 'Reward a member' : 'Send BizBucks'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use a recipient user ID until member search is connected.
                </p>
              </div>
              <button
                type="button"
                onClick={closeTransferModal}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close transfer form"
              >
                <DynamicIcon name="X" className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field
                label="Recipient user ID"
                placeholder="2"
                inputMode="numeric"
                value={transferForm.recipientUserId}
                onChange={(event) => setTransferForm((current) => ({ ...current, recipientUserId: event.target.value }))}
              />
              <Field
                label="Amount"
                placeholder="50"
                inputMode="numeric"
                value={transferForm.amount}
                onChange={(event) => setTransferForm((current) => ({ ...current, amount: event.target.value }))}
              />
              <Field
                label="Note"
                placeholder="Helpful feedback on my pitch."
                textarea
                rows={2}
                value={transferForm.note}
                onChange={(event) => setTransferForm((current) => ({ ...current, note: event.target.value }))}
              />

              {transferError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{transferError}</div> : null}
              {transferSuccess ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700" role="status">{transferSuccess}</div> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeTransferModal} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-blue-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTransferSubmit}
                  disabled={transferLoading}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {transferLoading ? 'Sending...' : 'Send BizBucks'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function BuyBizBucksPage() {
  const { token } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const packages = [
    { id: '250', amount: 250, price: 25 },
    { id: '1000', amount: 1000, price: 90 },
    { id: '2500', amount: 2500, price: 200 },
  ]

  const handlePurchase = async (packageId) => {
    if (!token) {
      setError('Please log in to make a purchase')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSelectedPackage(packageId)

      // Create purchase intent with backend
      const intent = await bizbucksRepository.createPurchaseIntent(token, packageId)

      // In a real app, this would redirect to Stripe Checkout
      // For now, show success message
      alert(`Purchase initiated!\n\nPackage: ${packageId} BizBucks\nAmount: $${packages.find(p => p.id === packageId)?.price}\n\nRedirect to Stripe would happen here with client_secret: ${intent.client_secret}`)
      setSelectedPackage(null)
    } catch (err) {
      setError(err.message || 'Failed to create purchase. Please try again.')
      setSelectedPackage(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Buy BizBucks" description="Purchase BizBucks to boost campaigns, reward members, and unlock visibility tools." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Buy BizBucks" />
          
          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            {packages.map(({ id, amount, price }) => (
              <button
                key={id}
                type="button"
                onClick={() => handlePurchase(id)}
                disabled={loading && selectedPackage === id}
                className={`min-h-32 rounded-2xl border-2 p-4 text-center transition ${
                  selectedPackage === id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50'
                } disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
              >
                {loading && selectedPackage === id ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="text-xs text-slate-500">Processing...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-950">{amount.toLocaleString()}</p>
                    <p className="mt-2 text-sm font-bold text-blue-600">${price}</p>
                  </>
                )}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-bold text-slate-500">Payment method</span>
            <input
              type="text"
              placeholder="Visa ending in 4242"
              disabled
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
            <p className="mt-2 text-xs text-slate-500">Payment will be processed through Stripe after selection</p>
          </label>

          <button
            type="button"
            disabled={!selectedPackage || loading}
            className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:opacity-50 transition hover:bg-blue-500"
          >
            {loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Need BizBucks for a boost?" />
          {['Boost a pitch or listing', 'Reward helpful members', 'Promote a campaign'].map((item) => (
            <div key={item} className="mb-3 rounded-xl bg-slate-50 p-4 last:mb-0">
              <p className="text-sm font-bold text-slate-900">{item}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Use credits when the matching backend endpoint is connected.</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function CreateFundMeCampaignPage() {
  return (
    <FormShell
      title="Create FundMe Campaign"
      description="Set a clear goal, tell your story, and invite people to support your growth."
      submitLabel="Review Campaign"
      checklist={['Tell a specific use of funds', 'Verify business details', 'Connect secure payout settings']}
    >
      <Field label="Campaign title" placeholder="Enter campaign title..." />
      <Field label="Short story" placeholder="Describe the opportunity, goal, or value in clear language..." textarea />
      <Field label="Funding goal" placeholder="Select or enter details..." />
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-500">Campaign cover image</span>
        <div className="relative grid min-h-40 overflow-hidden rounded-xl border border-blue-300 bg-slate-50 text-center">
          <img
            src={seedImages.fundMeApparelImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="relative z-10 place-self-center text-white">
            <p className="text-sm font-bold text-white">Upload cover image or preview</p>
            <p className="mt-2 text-xs text-blue-50">Recommended 1600 x 600 px</p>
          </div>
        </div>
      </label>
    </FormShell>
  )
}

function formatCredTrackStatus(status) {
  if (status === 'complete') {
    return 'Done'
  }
  if (status === 'in_progress') {
    return 'In progress'
  }
  if (status === 'blocked') {
    return 'Blocked'
  }
  return 'Start'
}

function getCredTrackNextStatus(status) {
  if (status === 'complete') {
    return 'complete'
  }
  if (status === 'in_progress') {
    return 'complete'
  }
  return 'in_progress'
}

function getCredTrackActionIcon(status) {
  if (status === 'complete') {
    return 'Check'
  }
  if (status === 'in_progress') {
    return 'Clock3'
  }
  return 'ShieldCheck'
}

export function CredTrackOverviewPage({ onNavigate }) {
  const { token } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadOverview() {
      try {
        setLoading(true)
        const payload = await credtrackRepository.getOverview(token)
        if (isMounted) {
          setOverview(payload)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOverview()

    return () => {
      isMounted = false
    }
  }, [token])

  const score = Number(overview?.score || 0)
  const roadmap = Array.isArray(overview?.roadmap) ? overview.roadmap : []
  const checklist = [
    [`${score}/100`, 'Readiness'],
    [`${Number(overview?.verification_percent || 0)}%`, 'Verified'],
    [`${Number(overview?.credit_health_percent || 0)}%`, 'Credit health'],
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="CredTrack"
        description="Monitor business credit readiness and funding preparation in one place."
        actionLabel="Start Action Plan"
        actionIcon="ShieldCheck"
        onAction={() => onNavigate?.('/credtrack/action-plan')}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <SectionTitle title="Funding Readiness Score" />
          <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="grid place-items-center rounded-3xl bg-blue-50 p-6">
              <div className="grid h-40 w-40 place-items-center rounded-full border-[14px] border-blue-600 bg-white">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-950">{loading ? '--' : score}</p>
                  <p className="text-xs font-semibold text-slate-500">Readiness</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold text-slate-950">{overview?.label ? `You are ${String(overview.label).toLowerCase()}.` : 'Funding readiness is loading.'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your profile, documentation, and business history are strong enough to begin lender conversations.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {checklist.map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-lg font-bold text-slate-950">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Your CredTrack Roadmap" action="View full plan" />
          <div className="space-y-3">
            {roadmap.slice(0, 5).map((item) => (
              <div key={item.id || item.title} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${item.status === 'complete' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <DynamicIcon name={getCredTrackActionIcon(item.status)} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{formatCredTrackStatus(item.status)}</span>
              </div>
            ))}
            {!loading && roadmap.length === 0 ? <p className="text-sm font-semibold text-slate-500">No CredTrack actions found.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function CredTrackActionPlanPage() {
  const { token } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingActionId, setUpdatingActionId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadPlan() {
      try {
        setLoading(true)
        setError(null)
        const payload = await credtrackRepository.getActionPlan(token)
        if (isMounted) {
          setPlan(payload)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load CredTrack action plan.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPlan()

    return () => {
      isMounted = false
    }
  }, [token])

  async function handleActionUpdate(action) {
    if (!token) {
      setError('Sign in before updating CredTrack actions.')
      return
    }

    const nextStatus = getCredTrackNextStatus(action.status)
    if (nextStatus === action.status) {
      return
    }

    try {
      setUpdatingActionId(action.id)
      setError(null)
      const updated = await credtrackRepository.updateAction(token, action.id, {
        status: nextStatus,
        notes: action.notes || null,
        evidence_media_ids: [],
      })

      setPlan((current) => {
        const items = (current?.items || []).map((item) => (item.id === updated.id ? updated : item))
        const completedCount = items.filter((item) => item.status === 'complete').length
        const inProgressCount = items.filter((item) => item.status === 'in_progress').length
        const todoCount = items.filter((item) => item.status === 'todo').length
        return {
          ...current,
          items,
          completed_count: completedCount,
          in_progress_count: inProgressCount,
          todo_count: todoCount,
          available_impact_points: items
            .filter((item) => item.status !== 'complete')
            .reduce((sum, item) => sum + Number(item.impact_points || 0), 0),
          missing_document_count: items.filter((item) => item.status !== 'complete' && Number(item.evidence_count || 0) === 0).length,
          estimated_weeks: Math.max(1, Math.round((todoCount + inProgressCount) / 2)),
        }
      })
    } catch (err) {
      setError(err.message || 'Unable to update CredTrack action.')
    } finally {
      setUpdatingActionId(null)
    }
  }

  const actions = Array.isArray(plan?.items) ? plan.items : []

  return (
    <div className="space-y-4">
      <PageHeader title="CredTrack Action Plan" description="Work through the next funding readiness steps with clear priority and status." actionLabel="Apply Filters" actionIcon="Settings" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <SectionTitle title="Action Plan" />
          {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
          <div className="space-y-3">
            {loading ? <p className="text-sm font-semibold text-slate-500">Loading action plan...</p> : null}
            {!loading && actions.length === 0 ? <p className="text-sm font-semibold text-slate-500">No CredTrack actions found.</p> : null}
            {actions.map((action) => (
              <div key={action.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-600">
                    <DynamicIcon name={getCredTrackActionIcon(action.status)} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{action.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Recommended priority: {action.priority} - +{action.impact_points} score points</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={updatingActionId === action.id || action.status === 'complete'}
                  onClick={() => handleActionUpdate(action)}
                  className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingActionId === action.id ? 'Saving...' : formatCredTrackStatus(action.status)}
                </button>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Readiness Impact" />
            <div className="grid grid-cols-3 gap-3">
              {[
                `+${Number(plan?.available_impact_points || 0)}`,
                String(plan?.estimated_weeks || 0),
                String(plan?.missing_document_count || 0),
              ].map((value, index) => (
                <div key={value} className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{['score points', 'weeks', 'missing doc'][index]}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Coach support" />
            <p className="text-sm leading-6 text-slate-500">Book a readiness review when the coach scheduling endpoint is connected.</p>
            <button type="button" className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white">Book Funding Readiness Review</button>
          </Card>
        </div>
      </div>
    </div>
  )
}

const groupTabs = ['Featured', 'My Groups', 'Nearby', 'New']

function getInitials(name = 'Group') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'G'
}

function formatMemberCount(count = 0) {
  return `${Number(count || 0).toLocaleString()} members`
}

function formatActivityDate(value) {
  if (!value) {
    return 'Recently'
  }

  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return 'Recently'
  }
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getTopicText(group) {
  return Array.isArray(group?.topics) && group.topics.length > 0 ? group.topics[0] : 'Community'
}

export function GroupsDirectoryPage({ onNavigate }) {
  const { token } = useAuth()
  const [active, setActive] = useState('Featured')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadGroups() {
      try {
        setLoading(true)
        setError(null)
        const payload = await groupsRepository.getList({ token, limit: 20, offset: 0 })
        if (isMounted) {
          setGroups(Array.isArray(payload?.items) ? payload.items : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load groups.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadGroups()

    return () => {
      isMounted = false
    }
  }, [token])

  const visibleGroups = useMemo(() => {
    if (active === 'New') {
      return [...groups].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    return groups
  }, [active, groups])

  return (
    <div className="space-y-4">
      <PageHeader title="Groups" description="Find people, build community, and collaborate around shared business goals." actionLabel="Create Group" actionIcon="Users" onAction={() => onNavigate?.('/groups/create')} />
      <Card className="p-5">
        <PillTabs items={groupTabs} active={active} onChange={setActive} />

        {error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {visibleGroups.map((group) => (
              <article key={group.id || group.slug} className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{getInitials(group.name)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{group.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatMemberCount(group.member_count)}</p>
                    <p className="mt-1 text-xs font-bold text-blue-600">{getTopicText(group)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.(`/groups/${group.slug || group.id}`)}
                  className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white"
                >
                  Open
                </button>
              </article>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {['Build with peers', 'Share founder updates', 'Find capital-ready members'].map((item) => (
          <Card key={item} className="p-5">
            <p className="text-sm font-bold text-slate-900">{item}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Recommended for your growth stage.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function GroupDetailPage({ groupSlug, onNavigate }) {
  const { token } = useAuth()
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [postBody, setPostBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadGroup() {
      try {
        setLoading(true)
        setError(null)
        const detail = await groupsRepository.getDetail(groupSlug, { token })
        const [postsPayload, eventsPayload] = await Promise.all([
          groupsRepository.getPostList(detail.id, { token, limit: 20, offset: 0 }),
          groupsRepository.getEventList(detail.id, { token, limit: 20, offset: 0 }),
        ])

        if (isMounted) {
          setGroup(detail)
          setPosts(Array.isArray(postsPayload?.items) ? postsPayload.items : [])
          setEvents(Array.isArray(eventsPayload?.items) ? eventsPayload.items : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load group.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadGroup()

    return () => {
      isMounted = false
    }
  }, [groupSlug, token])

  async function handleJoin() {
    if (!token || !group?.id || group.is_member) {
      return
    }

    try {
      setJoining(true)
      setError(null)
      const updated = await groupsRepository.join(token, group.id)
      setGroup(updated)
    } catch (err) {
      setError(err.message || 'Unable to join group.')
    } finally {
      setJoining(false)
    }
  }

  async function handleCreatePost() {
    const body = postBody.trim()
    if (!token || !group?.id || !body) {
      return
    }

    try {
      setPosting(true)
      setError(null)
      const created = await groupsRepository.createPost(token, group.id, {
        body,
        media_ids: [],
        status: 'published',
      })
      setPosts((current) => [created, ...current])
      setPostBody('')
      setGroup((current) => current ? { ...current, posts_count: Number(current.posts_count || 0) + 1 } : current)
    } catch (err) {
      setError(err.message || 'Unable to create post.')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Groups" description="Loading group details and posts." />
        <Card className="h-64 animate-pulse bg-slate-100 p-5" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <PageHeader title="Group not found" description="This group could not be loaded." actionLabel="Back to Groups" actionIcon="Users" onAction={() => onNavigate?.('/groups')} />
        {error ? <Card className="p-5 text-sm font-semibold text-rose-600">{error}</Card> : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title={group.name} description={group.description || 'A community space for founders, creators, and growth-minded business owners.'} actionLabel="Back to Groups" actionIcon="Users" onAction={() => onNavigate?.('/groups')} />
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">{getInitials(group.name)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">{group.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                  <span className="mt-4 inline-flex rounded-full bg-blue-100 px-5 py-2 text-xs font-bold text-blue-700">{formatMemberCount(group.member_count)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleJoin}
                disabled={!token || group.is_member || joining}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {group.is_member ? 'Joined' : joining ? 'Joining...' : 'Join Group'}
              </button>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
              <AvatarPlaceholder className="h-10 w-10" label="Marcus Holloway" />
              <input
                value={postBody}
                onChange={(event) => setPostBody(event.target.value)}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500"
                placeholder={`Share an update with ${group.name}...`}
              />
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={!token || !postBody.trim() || posting}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </Card>
          {posts.length > 0 ? posts.map((post) => {
            const authorName = `${post.first_name || ''} ${post.last_name || ''}`.trim() || 'Group member'

            return (
            <Card key={post.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AvatarPlaceholder className="h-10 w-10" label={authorName} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{authorName}</p>
                    <p className="text-xs text-slate-500">{formatActivityDate(post.created_at)}</p>
                  </div>
                </div>
                <span className="text-slate-400">...</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-800">{post.body}</p>
              {getTopicText(group) ? <p className="mt-5 text-sm font-bold text-blue-600">#{getTopicText(group).replace(/\s+/g, '')}</p> : null}
              <div className="mt-5 flex items-center gap-8 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                <span>{Number(post.reactions_count || 0).toLocaleString()} likes</span>
                <span>{Number(post.comments_count || 0).toLocaleString()} comments</span>
                <span>{Number(group.posts_count || 0).toLocaleString()} posts</span>
              </div>
            </Card>
          )}) : (
            <Card className="p-5 text-sm leading-6 text-slate-500">No group posts yet.</Card>
          )}
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Group Topics" />
            <div className="grid grid-cols-2 gap-3">
              {(Array.isArray(group.topics) && group.topics.length > 0 ? group.topics : ['Community']).map((item) => (
                <span key={item} className="rounded-full bg-blue-100 px-3 py-2 text-center text-xs font-bold text-blue-700">{item}</span>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Upcoming in this group" />
            {events.length > 0 ? events.map((item) => (
              <div key={item.id || item.title} className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 last:mb-0">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.location || 'Virtual'} - {formatActivityDate(item.starts_at || item.start_at)}</p>
                </div>
                <button type="button" className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-600">RSVP</button>
              </div>
            )) : <p className="text-sm leading-6 text-slate-500">No events scheduled yet.</p>}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Membership" />
            <div className="grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-950">{formatMemberCount(group.member_count)}</p>
                <p className="mt-1 text-xs text-slate-500">{group.privacy} group</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">{group.is_admin ? 'Admin access' : group.is_member ? 'Member access' : 'Visitor access'}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{group.welcome_prompt || 'Member role and moderator data will come from the Groups backend.'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CreateGroupPage({ onNavigate }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    privacy: 'public',
    topics: '',
    welcome_prompt: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const resolvedSlug = form.slug.trim() || toSlug(form.name)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateGroup() {
    if (!token || !form.name.trim()) {
      setError(!token ? 'Sign in before creating a group.' : 'Group name is required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const created = await groupsRepository.create(token, {
        name: form.name.trim(),
        slug: resolvedSlug,
        description: form.description.trim() || null,
        privacy: form.privacy,
        topics: form.topics
          .split(',')
          .map((topic) => topic.trim())
          .filter(Boolean),
        welcome_prompt: form.welcome_prompt.trim() || null,
        cover_media_id: null,
      })

      onNavigate?.(`/groups/${created.slug || created.id}`)
    } catch (err) {
      setError(err.message || 'Unable to create group.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormShell
      title="Create a Group"
      description="Create a focused space for people, ideas, and business momentum."
      submitLabel="Create Group"
      checklist={['Set group purpose', 'Add topic guidelines', 'Invite early members']}
      onSubmit={handleCreateGroup}
      submitting={submitting}
      submitDisabled={!form.name.trim() || submitting}
    >
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
      <Field label="Group name" placeholder="Enter group name..." value={form.name} onChange={(event) => updateField('name', event.target.value)} />
      <Field label="Slug" placeholder="founder-circle" value={resolvedSlug} onChange={(event) => updateField('slug', toSlug(event.target.value))} />
      <Field label="Description" placeholder="Describe the audience, goals, and expectations..." textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-500">Privacy</span>
        <select
          value={form.privacy}
          onChange={(event) => updateField('privacy', event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="invite_only">Invite only</option>
        </select>
      </label>
      <Field label="Topics" placeholder="Funding, Marketing, Community" value={form.topics} onChange={(event) => updateField('topics', event.target.value)} />
      <Field label="Welcome prompt" placeholder="What should new members post first?" textarea rows={2} value={form.welcome_prompt} onChange={(event) => updateField('welcome_prompt', event.target.value)} />
    </FormShell>
  )
}

const eventTabs = ['Upcoming', 'My Events', 'Saved', 'Past']
const eventTabToApi = {
  Upcoming: 'upcoming',
  'My Events': 'my-events',
  Saved: 'saved',
  Past: 'past',
}

function formatEventDateParts(dateValue) {
  if (!dateValue) {
    return { month: 'TBD', day: '--', date: 'Date TBD', time: 'Time TBD' }
  }

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) {
    return { month: 'TBD', day: '--', date: 'Date TBD', time: 'Time TBD' }
  }

  return {
    month: parsed.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    day: parsed.toLocaleString(undefined, { day: '2-digit' }),
    date: parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: parsed.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }
}

function getEventDetailRoute(event) {
  return `/events/${event.slug || event.id}`
}

function attendeeSummary(event) {
  const count = Number(event?.attendee_count || 0)
  if (!event?.capacity) {
    return `${count} attending`
  }
  return `${count}/${event.capacity} seats`
}

function initialsFromName(value) {
  return String(value || 'BS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'BS'
}

export function EventsDirectoryPage({ onNavigate }) {
  const { token } = useAuth()
  const [active, setActive] = useState('Upcoming')
  const [eventsPayload, setEventsPayload] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)
        const payload = await eventsRepository.getList({
          token,
          tab: eventTabToApi[active] || 'upcoming',
          limit: 20,
          offset: 0,
        })

        if (isMounted) {
          setEventsPayload(payload)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load events.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      isMounted = false
    }
  }, [active, token])

  const eventItems = Array.isArray(eventsPayload.items) ? eventsPayload.items : []
  const featuredEvent = eventItems[0]
  const rsvpCount = eventItems.filter((event) => event.viewer_rsvp_status).length

  return (
    <div className="space-y-4">
      <PageHeader title="Events" description="Discover networking, workshops, and live sessions built for the BizSocials community." actionLabel="Create Event" actionIcon="CalendarDays" onAction={() => onNavigate?.('/events/create')} />
      <Card className="p-5">
        <PillTabs items={eventTabs} active={active} onChange={setActive} />
        {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm font-semibold text-slate-500">Loading events...</p>
          ) : eventItems.length > 0 ? eventItems.map((event) => {
            const eventDate = formatEventDateParts(event.start_at)
            return (
            <article key={event.id || event.slug} className="rounded-xl border border-slate-200 p-4">
              <EmptyMedia className="h-28" label={eventDate.month} />
              <div className="mt-4 flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 px-3 py-2 text-center text-blue-700">
                  <p className="text-xs font-bold">{eventDate.month}</p>
                  <p className="text-lg font-bold">{eventDate.day}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.location || 'Location TBD'} - {eventDate.time}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{attendeeSummary(event)}</p>
                </div>
              </div>
              <button type="button" onClick={() => onNavigate?.(getEventDetailRoute(event))} className="mt-4 h-9 w-full rounded-lg border border-slate-200 text-xs font-bold text-blue-600">View Event</button>
            </article>
            )
          }) : (
            <p className="text-sm font-semibold text-slate-500">No events found for this tab.</p>
          )}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Featured this week" action="Browse all" />
          <p className="text-sm font-bold text-slate-900">{featuredEvent?.title || 'No featured event yet'}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{featuredEvent?.description || 'Featured events will appear here once published.'}</p>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Your event activity" />
          {[
            `${rsvpCount} active RSVP${rsvpCount === 1 ? '' : 's'}`,
            `${eventItems.filter((event) => event.is_host).length} hosted event${eventItems.filter((event) => event.is_host).length === 1 ? '' : 's'}`,
            `${eventsPayload.total || eventItems.length} event${(eventsPayload.total || eventItems.length) === 1 ? '' : 's'} in this view`,
          ].map((item) => (
            <p key={item} className="mb-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 last:mb-0">{item}</p>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function EventDetailPage({ eventSlug }) {
  const { token } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rsvpSaving, setRsvpSaving] = useState(false)
  const [rsvpError, setRsvpError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadEvent() {
      try {
        setLoading(true)
        setError(null)
        const detail = await eventsRepository.getDetail(eventSlug || 'networking-mixer-innovate-connect', { token })
        if (isMounted) {
          setEvent(detail)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load event.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      isMounted = false
    }
  }, [eventSlug, token])

  async function handleRsvp() {
    if (!token) {
      setRsvpError('Sign in before registering for this event.')
      return
    }

    if (!event?.id) {
      return
    }

    try {
      setRsvpSaving(true)
      setRsvpError(null)
      const result = await eventsRepository.rsvp(token, event.id, {
        status: 'going',
        guest_count: 0,
        note: null,
      })
      setEvent((current) => ({
        ...current,
        viewer_rsvp_status: result.status,
        viewer_guest_count: result.guest_count,
        viewer_note: result.note,
        attendee_count: result.attendee_count,
      }))
    } catch (err) {
      setRsvpError(err.message || 'Unable to register for this event.')
    } finally {
      setRsvpSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-500">Loading event...</p>
      </Card>
    )
  }

  if (error || !event) {
    return (
      <Card className="p-5">
        <p className="text-sm font-semibold text-rose-700">{error || 'Event not found.'}</p>
      </Card>
    )
  }

  const eventDate = formatEventDateParts(event.start_at)
  const attendees = Array.isArray(event.attendees) && event.attendees.length > 0
    ? event.attendees
    : [
        { user_id: 'fallback-1', display_name: 'Alicia Moore' },
        { user_id: 'fallback-2', display_name: 'Marcus Lee' },
        { user_id: 'fallback-3', display_name: 'Dana Cruz' },
      ]

  return (
    <div className="space-y-4">
      <PageHeader title={event.title} description="Event overview, RSVP state, host notes, and attendee context." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-200 to-blue-700 p-8 text-white">
            <span className="rounded-full bg-blue-950/30 px-3 py-1 text-xs font-bold">{String(event.event_type || 'event').toUpperCase()}</span>
            <h2 className="mt-14 text-3xl font-bold">{event.title}</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {[eventDate.date, event.location || event.virtual_url || 'Location TBD', attendeeSummary(event)].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-5">
            <h3 className="text-lg font-bold text-slate-950">About this event</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {event.description || 'Details will be added by the event host.'}
            </p>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Reserve your spot" />
            {rsvpError ? <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{rsvpError}</div> : null}
            <button type="button" onClick={handleRsvp} disabled={rsvpSaving} className="h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {rsvpSaving ? 'Registering...' : event.viewer_rsvp_status === 'going' ? 'Registered' : 'Register Now'}
            </button>
            <button type="button" className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-blue-600">Add to calendar</button>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Who's going" action="View all" />
            <div className="flex -space-x-2">
              {attendees.slice(0, 5).map((item) => (
                <div key={item.user_id || item.display_name} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-700">{initialsFromName(item.display_name)}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CreateEventPage({ onNavigate }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    start_at: '',
    end_at: '',
    timezone: 'UTC',
    location_type: 'physical',
    location: '',
    virtual_url: '',
    capacity: '',
    group_id: '',
    status: 'published',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const resolvedSlug = form.slug.trim() || toSlug(form.title)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreateEvent() {
    if (!token || !form.title.trim() || !form.start_at) {
      setError(!token ? 'Sign in before creating an event.' : 'Event title and start time are required.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const created = await eventsRepository.create(token, {
        title: form.title.trim(),
        slug: resolvedSlug,
        description: form.description.trim() || null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        timezone: form.timezone.trim() || 'UTC',
        location_type: form.location_type,
        location: form.location.trim() || null,
        virtual_url: form.virtual_url.trim() || null,
        capacity: form.capacity ? Number(form.capacity) : null,
        cover_media_id: null,
        group_id: form.group_id ? Number(form.group_id) : null,
        status: form.status,
      })

      onNavigate?.(`/events/${created.slug || created.id}`)
    } catch (err) {
      setError(err.message || 'Unable to create event.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormShell
      title="Create Event"
      description="Create an event that is easy to discover, register for, and manage."
      submitLabel="Publish Event"
      checklist={['Add event details', 'Set registration rules', 'Preview attendee experience']}
      onSubmit={handleCreateEvent}
      submitting={submitting}
      submitDisabled={!form.title.trim() || !form.start_at || submitting}
    >
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div> : null}
      <Field label="Event title" placeholder="Enter event title..." value={form.title} onChange={(event) => updateField('title', event.target.value)} />
      <Field label="Slug" placeholder="networking-mixer" value={resolvedSlug} onChange={(event) => updateField('slug', toSlug(event.target.value))} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Start date and time" type="datetime-local" value={form.start_at} onChange={(event) => updateField('start_at', event.target.value)} />
        <Field label="End date and time" type="datetime-local" value={form.end_at} onChange={(event) => updateField('end_at', event.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Timezone" placeholder="UTC" value={form.timezone} onChange={(event) => updateField('timezone', event.target.value)} />
        <Field label="Capacity" type="number" min="1" placeholder="100" value={form.capacity} onChange={(event) => updateField('capacity', event.target.value)} />
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-500">Location type</span>
        <select
          value={form.location_type}
          onChange={(event) => updateField('location_type', event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </label>
      <Field label="Location" placeholder="Atlanta, GA" value={form.location} onChange={(event) => updateField('location', event.target.value)} />
      <Field label="Virtual link" placeholder="https://meet.example.com/event" value={form.virtual_url} onChange={(event) => updateField('virtual_url', event.target.value)} />
      <Field label="Group ID" type="number" min="1" placeholder="Optional group ID" value={form.group_id} onChange={(event) => updateField('group_id', event.target.value)} />
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-500">Status</span>
        <select
          value={form.status}
          onChange={(event) => updateField('status', event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <Field label="Event description" placeholder="Describe what attendees can expect..." textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
    </FormShell>
  )
}

const courseTabs = ['Recommended', 'In progress', 'Funding', 'Marketing', 'Sales']
const courseTabFilters = {
  Recommended: 'recommended',
  'In progress': 'in_progress',
  Funding: 'funding',
  Marketing: 'marketing',
  Sales: 'sales',
}
const courseTileStyles = [
  'bg-blue-900',
  'bg-fuchsia-800',
  'bg-emerald-800',
  'bg-slate-900',
]

function formatCourseDuration(minutes) {
  const value = Number(minutes) || 0
  return value > 0 ? `${value} min` : 'Self paced'
}

function formatLessonDuration(seconds) {
  const value = Number(seconds) || 0
  if (value <= 0) return 'Open lesson'
  return `${Math.max(1, Math.round(value / 60))} min`
}

export function LearningHubPage({ onNavigate }) {
  const { token } = useAuth()
  const [active, setActive] = useState('Recommended')
  const [courseList, setCourseList] = useState({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const activeFilter = courseTabFilters[active] || 'recommended'

  useEffect(() => {
    let cancelled = false

    async function loadCourses() {
      setIsLoading(true)
      setError('')

      try {
        const data = await coursesRepository.getList({
          token,
          filter: activeFilter,
          limit: 20,
          offset: 0,
        })

        if (!cancelled) {
          setCourseList(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load courses:', loadError)
          setError('Courses are not available right now.')
          setCourseList({ items: [], total: 0 })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCourses()

    return () => {
      cancelled = true
    }
  }, [activeFilter, token])

  const courses = courseList.items || []
  const continueCourse = courses.find((course) => course.enrollment_status === 'in_progress')
    || courses.find((course) => Number(course.progress_percent) > 0)
    || courses[0]

  return (
    <div className="space-y-4">
      <PageHeader title="Learning Hub" description="Build skills, complete lessons, and turn business learning into action." actionLabel="Browse Courses" actionIcon="GraduationCap" />
      <Card className="p-5">
        <PillTabs items={courseTabs} active={active} onChange={setActive} />
        {isLoading ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
            Loading courses...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
        ) : courses.length === 0 ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
            No courses match this tab yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {courses.map((course, index) => {
              const progress = Math.round(Number(course.progress_percent) || 0)
              const targetRoute = `/courses/${course.slug || course.id}`

              return (
                <article key={course.slug || course.id} className="rounded-xl border border-slate-200 p-4">
                  {course.cover_media_url ? (
                    <img src={course.cover_media_url} alt="" className="h-24 w-full rounded-xl object-cover" />
                  ) : (
                    <div className={`grid h-24 place-items-center rounded-xl px-4 text-center text-sm font-bold text-white ${courseTileStyles[index % courseTileStyles.length]}`}>
                      {course.title}
                    </div>
                  )}
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-950">{course.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{course.description}</p>
                    </div>
                    <StatusBadge>{course.level}</StatusBadge>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span>{formatCourseDuration(course.duration_minutes)}</span>
                    <span>{course.lesson_count} lessons</span>
                  </div>
                  <ProgressBar value={progress} className="mt-4" />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-blue-600">{progress}% complete</span>
                    <button type="button" onClick={() => onNavigate?.(targetRoute)} className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white">
                      {progress > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Card>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Continue Learning" action="View progress" />
          {continueCourse ? (
            <>
              <p className="text-sm font-bold text-slate-900">{continueCourse.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{continueCourse.description}</p>
              <ProgressBar value={Number(continueCourse.progress_percent) || 0} className="mt-4" />
              <button type="button" onClick={() => onNavigate?.(`/courses/${continueCourse.slug || continueCourse.id}`)} className="mt-5 h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">
                Resume Course
              </button>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-500">Courses will appear here after the backend returns learning data.</p>
          )}
        </Card>
        <Card className="p-5">
          <SectionTitle title="Become an instructor" />
          <p className="text-sm leading-6 text-slate-500">Instructor applications can connect to a future creator onboarding endpoint.</p>
          <button type="button" className="mt-5 h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-blue-600">Explore instructor tools</button>
        </Card>
      </div>
    </div>
  )
}

export function CoursePlayerPage({ courseSlug = 'funding-101', onNavigate }) {
  const { token } = useAuth()
  const [course, setCourse] = useState(null)
  const [activeLessonKey, setActiveLessonKey] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCourse() {
      setIsLoading(true)
      setError('')
      setNotice('')

      try {
        const data = await coursesRepository.getDetail(courseSlug, { token })
        const modules = data.modules || []
        const firstIncomplete = modules.find((lesson) => !lesson.completed)
        const initialLessonKey = data.current_lesson_key || firstIncomplete?.lesson_key || modules[0]?.lesson_key || ''

        if (!cancelled) {
          setCourse(data)
          setActiveLessonKey(initialLessonKey)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load course detail:', loadError)
          setError('Course detail is not available right now.')
          setCourse(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadCourse()

    return () => {
      cancelled = true
    }
  }, [courseSlug, token])

  const lessons = course?.modules || []
  const activeLesson = lessons.find((lesson) => lesson.lesson_key === activeLessonKey) || lessons[0]
  const progress = Math.round(Number(course?.progress_percent) || 0)
  const completedCount = lessons.filter((lesson) => lesson.completed).length

  async function handleCompleteLesson() {
    if (!course || !activeLesson) return

    setIsSavingProgress(true)
    setNotice('')
    setError('')

    try {
      const result = await coursesRepository.saveProgress(token, course.slug || course.id, {
        lesson_id: activeLesson.lesson_key,
        progress_seconds: activeLesson.duration_seconds || activeLesson.progress_seconds || 0,
        completed: true,
      })

      setCourse((currentCourse) => {
        if (!currentCourse) return currentCourse

        return {
          ...currentCourse,
          enrollment_status: result.status,
          progress_percent: result.progress_percent,
          completed_lessons_count: result.completed_lessons_count,
          current_lesson_id: result.current_lesson_id,
          current_lesson_key: result.current_lesson_key,
          last_activity_at: result.last_activity_at,
          modules: (currentCourse.modules || []).map((lesson) => (
            lesson.lesson_key === activeLesson.lesson_key
              ? {
                  ...lesson,
                  completed: true,
                  progress_seconds: Math.max(lesson.progress_seconds || 0, activeLesson.duration_seconds || 0),
                  completed_at: result.last_activity_at,
                }
              : lesson
          )),
        }
      })
      setNotice('Lesson progress saved.')
    } catch (saveError) {
      console.error('Failed to save lesson progress:', saveError)
      setError('Progress could not be saved.')
    } finally {
      setIsSavingProgress(false)
    }
  }

  async function handleSaveNote(event) {
    event.preventDefault()
    if (!course || !activeLesson || !note.trim()) return

    setIsSavingNote(true)
    setNotice('')
    setError('')

    try {
      await coursesRepository.addNote(token, course.slug || course.id, {
        lesson_id: activeLesson.lesson_key,
        note: note.trim(),
      })
      setNote('')
      setNotice('Lesson note saved.')
    } catch (saveError) {
      console.error('Failed to save lesson note:', saveError)
      setError('Note could not be saved.')
    } finally {
      setIsSavingNote(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Course Player" description="Loading course content and progress." />
        <Card className="grid min-h-80 place-items-center p-5 text-sm font-semibold text-slate-500">Loading course...</Card>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="space-y-4">
        <PageHeader title="Course Player" description="Course content could not be loaded." actionLabel="All Courses" actionIcon="ArrowLeft" onAction={() => onNavigate?.('/courses')} />
        <Card className="p-5 text-sm font-semibold text-red-700">{error}</Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title={course?.title || 'Course Player'} description={course?.description || 'Watch lessons, complete modules, and apply business concepts.'} actionLabel="All Courses" actionIcon="ArrowLeft" onAction={() => onNavigate?.('/courses')} />
      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-0">
          <div className="grid min-h-[360px] place-items-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-950 to-cyan-500 text-white">
            {course?.cover_media_url ? (
              <div className="relative h-full min-h-[360px] w-full">
                <img src={course.cover_media_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-blue-950/45" />
                <div className="relative grid min-h-[360px] place-items-center p-6 text-center">
                  <div>
                    <DynamicIcon name="Play" className="mx-auto h-14 w-14" aria-hidden="true" />
                    <p className="mt-4 text-2xl font-bold">{activeLesson?.title || course?.title}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 text-center">
                <DynamicIcon name="Play" className="mx-auto h-14 w-14" aria-hidden="true" />
                <p className="mt-4 text-2xl font-bold">{activeLesson?.title || course?.title}</p>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-950">{activeLesson?.title || 'Select a lesson'}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{activeLesson?.description || 'Lesson content will appear here once selected.'}</p>
              </div>
              <button
                type="button"
                onClick={handleCompleteLesson}
                disabled={!activeLesson || isSavingProgress || activeLesson.completed}
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {activeLesson?.completed ? 'Completed' : isSavingProgress ? 'Saving...' : 'Mark Complete'}
              </button>
            </div>
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">{activeLesson?.content || 'Course lesson copy will be supplied by the backend content system.'}</p>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Course checklist" />
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{completedCount} of {lessons.length} lessons complete</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} className="mt-3" />
            </div>
            {lessons.map((lesson) => (
              <button
                key={lesson.lesson_key}
                type="button"
                onClick={() => setActiveLessonKey(lesson.lesson_key)}
                className={`mb-3 flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition last:mb-0 ${
                  activeLesson?.lesson_key === lesson.lesson_key ? 'border-blue-200 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">{lesson.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate-400">{formatLessonDuration(lesson.duration_seconds)}</span>
                </span>
                <StatusBadge>{lesson.completed ? 'Done' : activeLesson?.lesson_key === lesson.lesson_key ? 'Now' : 'Next'}</StatusBadge>
              </button>
            ))}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Lesson notes" />
            <form onSubmit={handleSaveNote} className="space-y-3">
              <Field
                label="Note"
                placeholder="Write a reminder, funding insight, or action item."
                textarea
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <button
                type="submit"
                disabled={!note.trim() || isSavingNote}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-blue-600 transition disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isSavingNote ? 'Saving Note...' : 'Save Note'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

const marketplaceTabs = ['All listings', 'Design', 'Funding', 'Services']
const marketplaceTabCategories = {
  'All listings': 'all',
  Design: 'design',
  Funding: 'funding',
  Services: 'services',
}

function formatMarketplacePrice(amount, currency = 'USD') {
  const value = Number(amount) || 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

function marketplaceRoute(listing) {
  return `/marketplace/${listing.slug || listing.id}`
}

function formatRemoteAvailability(listing) {
  return listing.remote_available ? '100% remote' : 'Local delivery'
}

export function MarketplacePage({ onNavigate }) {
  const { token } = useAuth()
  const [active, setActive] = useState('All listings')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [payload, setPayload] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeCategory = marketplaceTabCategories[active] || 'all'

  useEffect(() => {
    let cancelled = false

    async function loadListings() {
      setLoading(true)
      setError('')

      try {
        const data = await marketplaceRepository.getList({
          token,
          category: activeCategory,
          search,
          limit: 20,
          offset: 0,
        })

        if (!cancelled) {
          setPayload(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load marketplace listings:', loadError)
          setError('Marketplace listings are not available right now.')
          setPayload({ items: [], total: 0 })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadListings()

    return () => {
      cancelled = true
    }
  }, [activeCategory, search, token])

  const listings = payload.items || []

  return (
    <div className="space-y-4">
      <PageHeader title="Marketplace" description="Discover business services, products, and partner offers from trusted members." actionLabel="Create Listing" actionIcon="Store" onAction={() => onNavigate?.('/marketplace/create')} />
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form
            className="flex min-w-0 flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              setSearch(searchInput.trim())
            }}
          >
            <input
              className="h-10 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 sm:w-80"
              placeholder="Search marketplace..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-blue-600">Search</button>
          </form>
          <PillTabs items={marketplaceTabs} active={active} onChange={setActive} />
        </div>
        {loading ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
            Loading marketplace...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
        ) : listings.length === 0 ? (
          <div className="mt-5 grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 text-sm font-semibold text-slate-500">
            No listings match this view.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {listings.map((listing) => (
              <article key={listing.slug || listing.id} className="rounded-xl border border-slate-200 p-4">
                {listing.cover_media_url ? (
                  <img src={listing.cover_media_url} alt="" className="h-24 w-full rounded-xl object-cover" />
                ) : (
                  <EmptyMedia className="h-24" label="" />
                )}
                <p className="mt-4 text-sm font-bold text-slate-950">{listing.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{listing.description}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">by {listing.seller_business_name || listing.seller_name}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-blue-600">{formatMarketplacePrice(listing.price_amount, listing.currency)}</span>
                  <button type="button" onClick={() => onNavigate?.(marketplaceRoute(listing))} className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-600">View</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-4">
        {['Branding Design', 'Funding Services', 'Marketing Services', 'Legal & Operations'].map((item) => (
          <Card key={item} className="p-5">
            <p className="text-sm font-bold text-slate-900">{item}</p>
            <p className="mt-2 text-xs text-slate-500">Popular category</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function MarketplaceListingDetailPage({ listingSlug = 'logo-brand-identity', onNavigate }) {
  const { token } = useAuth()
  const [listing, setListing] = useState(null)
  const [buyerNote, setBuyerNote] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPurchase, setSavingPurchase] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadListing() {
      setLoading(true)
      setError('')
      setNotice('')

      try {
        const data = await marketplaceRepository.getDetail(listingSlug, { token })
        if (!cancelled) {
          setListing(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load marketplace listing:', loadError)
          setError('Marketplace listing is not available right now.')
          setListing(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [listingSlug, token])

  async function handlePurchase() {
    if (!listing) return

    setSavingPurchase(true)
    setNotice('')
    setError('')

    try {
      const order = await marketplaceRepository.purchase(token, listing.slug || listing.id, {
        package_id: 'standard',
        buyer_note: buyerNote.trim() || null,
        payment_method_id: 'local-demo',
      })
      setNotice(`Purchase intent created for ${order.listing_title}.`)
    } catch (purchaseError) {
      console.error('Failed to purchase marketplace listing:', purchaseError)
      setError('Purchase intent could not be created.')
    } finally {
      setSavingPurchase(false)
    }
  }

  async function handleMessageSeller(event) {
    event.preventDefault()
    if (!listing || !messageBody.trim()) return

    setSendingMessage(true)
    setNotice('')
    setError('')

    try {
      await marketplaceRepository.messageSeller(token, listing.slug || listing.id, {
        body: messageBody.trim(),
      })
      setMessageBody('')
      setNotice('Message sent to seller.')
    } catch (messageError) {
      console.error('Failed to message marketplace seller:', messageError)
      setError('Message could not be sent.')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Marketplace Listing" description="Loading listing details." />
        <Card className="grid min-h-80 place-items-center p-5 text-sm font-semibold text-slate-500">Loading listing...</Card>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="space-y-4">
        <PageHeader title="Marketplace Listing" description="Listing details could not be loaded." actionLabel="Back to Marketplace" actionIcon="ArrowLeft" onAction={() => onNavigate?.('/marketplace')} />
        <Card className="p-5 text-sm font-semibold text-red-700">{error}</Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Marketplace Listing" description="Review offer details, seller credibility, package options, and purchase intent." actionLabel="Back to Marketplace" actionIcon="ArrowLeft" onAction={() => onNavigate?.('/marketplace')} />
      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          {listing?.cover_media_url ? (
            <img src={listing.cover_media_url} alt="" className="h-72 w-full rounded-xl object-cover" />
          ) : (
            <EmptyMedia className="h-72" label="Listing Preview" />
          )}
          <h2 className="mt-5 text-2xl font-bold text-slate-950">{listing?.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{listing?.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[`${listing?.delivery_time_days || 1} days`, listing?.category, formatRemoteAvailability(listing || {})].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-800">{item}</div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Requirements</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{listing?.requirements || 'The seller will collect requirements after purchase.'}</p>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-500">Starting at</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{formatMarketplacePrice(listing?.price_amount, listing?.currency)}</p>
            <Field
              label="Buyer note"
              placeholder="Share what you need from the seller."
              textarea
              rows={3}
              value={buyerNote}
              onChange={(event) => setBuyerNote(event.target.value)}
            />
            <button type="button" onClick={handlePurchase} disabled={savingPurchase} className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {savingPurchase ? 'Creating Purchase...' : 'Buy Now'}
            </button>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Seller" />
            <div className="flex items-center gap-3">
              <AvatarPlaceholder className="h-11 w-11" label={listing?.seller_business_name || listing?.seller_name || 'Seller'} />
              <div>
                <p className="text-sm font-bold text-slate-900">{listing?.seller_business_name || listing?.seller_name}</p>
                <p className="text-xs text-slate-500">{Number(listing?.avg_rating || 0).toFixed(1)} rating - {listing?.review_count || 0} reviews</p>
              </div>
            </div>
            <form onSubmit={handleMessageSeller} className="mt-5 space-y-3">
              <Field
                label="Message"
                placeholder="Ask about scope, timeline, or deliverables."
                textarea
                rows={3}
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
              />
              <button type="submit" disabled={!messageBody.trim() || sendingMessage} className="h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                {sendingMessage ? 'Sending...' : 'Message Seller'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CreateMarketplaceListingPage({ onNavigate }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Branding Design',
    price_amount: '299',
    currency: 'USD',
    delivery_time_days: '7',
    remote_available: true,
    requirements: '',
    cover_media_id: '',
    status: 'published',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const listing = await marketplaceRepository.create(token, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price_amount: Number(form.price_amount) || 0,
        currency: form.currency.trim().toUpperCase() || 'USD',
        delivery_time_days: Number(form.delivery_time_days) || 7,
        remote_available: form.remote_available,
        requirements: form.requirements.trim() || null,
        cover_media_id: form.cover_media_id ? Number(form.cover_media_id) : null,
        gallery_media_ids: [],
        status: form.status,
      })
      onNavigate?.(`/marketplace/${listing.slug || listing.id}`)
    } catch (submitError) {
      console.error('Failed to create marketplace listing:', submitError)
      setError(submitError.message || 'Marketplace listing could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormShell
      title="Create Marketplace Listing"
      description="Create a listing that explains your offer, price, and fulfillment clearly."
      submitLabel="Publish Listing"
      checklist={['Describe the offer', 'Set clear pricing', 'Add service requirements']}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitDisabled={!form.title.trim() || !form.category.trim()}
      status={form.status === 'published' ? 'Published' : 'Draft'}
    >
      {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
      <Field label="Listing title" placeholder="Logo & Brand Identity" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
      <Field label="Description" placeholder="Describe the offer, deliverables, and audience..." textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Price" type="number" min="0" step="0.01" placeholder="299" value={form.price_amount} onChange={(event) => updateField('price_amount', event.target.value)} />
        <Field label="Currency" placeholder="USD" value={form.currency} onChange={(event) => updateField('currency', event.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-500">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="Branding Design">Branding Design</option>
            <option value="Funding Services">Funding Services</option>
            <option value="Marketing Services">Marketing Services</option>
            <option value="Legal & Operations">Legal & Operations</option>
          </select>
        </label>
        <Field label="Delivery time days" type="number" min="1" placeholder="7" value={form.delivery_time_days} onChange={(event) => updateField('delivery_time_days', event.target.value)} />
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={form.remote_available} onChange={(event) => updateField('remote_available', event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        Remote delivery available
      </label>
      <Field label="Requirements" placeholder="Brand name, audience, examples, preferred colors..." textarea value={form.requirements} onChange={(event) => updateField('requirements', event.target.value)} />
      <Field label="Cover media ID" type="number" min="1" placeholder="Optional media asset ID" value={form.cover_media_id} onChange={(event) => updateField('cover_media_id', event.target.value)} />
      <label className="block">
        <span className="mb-2 block text-xs font-bold text-slate-500">Status</span>
        <select
          value={form.status}
          onChange={(event) => updateField('status', event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
    </FormShell>
  )
}

function formatMessageTime(dateValue) {
  if (!dateValue) {
    return 'now'
  }

  const then = new Date(dateValue).getTime()
  if (Number.isNaN(then)) {
    return 'now'
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  return `${Math.floor(diffHours / 24)}d`
}

function getCurrentUserId(user) {
  return Number(user?.id || user?.user_id || 1)
}

function ConversationList({ conversations = [], activeConversationId, loading = false, onSelect }) {
  return (
    <div className="space-y-2">
      {loading ? <p className="px-2 py-3 text-sm font-semibold text-slate-500">Loading conversations...</p> : null}
      {!loading && conversations.length === 0 ? <p className="px-2 py-3 text-sm font-semibold text-slate-500">No conversations yet.</p> : null}
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onSelect?.(conversation)}
          className={`flex min-h-16 w-full items-center gap-3 rounded-xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            String(activeConversationId) === String(conversation.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
          }`}
        >
          <AvatarPlaceholder className="h-10 w-10" label={conversation.title} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold text-slate-900">{conversation.title}</span>
              <span className="text-xs text-slate-400">{formatMessageTime(conversation.last_message_at || conversation.updated_at)}</span>
            </span>
            <span className="mt-1 block truncate text-xs text-slate-500">{conversation.last_message_body || 'No messages yet.'}</span>
          </span>
          {conversation.unread_count > 0 ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
        </button>
      ))}
    </div>
  )
}

function ChatPanel({ conversation, currentUserId, draft, onDraftChange, onSend, sending = false, error }) {
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : []

  return (
    <Card className="flex min-h-[620px] flex-col p-0">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <AvatarPlaceholder className="h-10 w-10" label={conversation?.title || 'Messages'} />
          <div>
            <p className="text-sm font-bold text-slate-950">{conversation?.title || 'Select a conversation'}</p>
            <p className="text-xs text-emerald-600">{conversation?.participants?.length || 0} participant{conversation?.participants?.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <button type="button" className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-600">View profile</button>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {messages.length > 0 ? messages.map((message) => {
          const isMine = Number(message.sender_user_id) === Number(currentUserId)
          return (
          <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${isMine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="sr-only">{message.sender_name || 'Member'}</p>
              {message.body}
              {message.media_count > 0 ? <p className={`mt-2 text-xs font-semibold ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>{message.media_count} attachment{message.media_count === 1 ? '' : 's'}</p> : null}
            </div>
          </div>
          )
        }) : (
          <p className="text-sm font-semibold text-slate-500">Select a conversation to view messages.</p>
        )}
      </div>
      <div className="border-t border-slate-200 p-4">
        {error ? <p className="mb-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="flex items-center gap-3">
          <input
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500"
            placeholder="Write a message..."
            value={draft}
            onChange={(event) => onDraftChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onSend?.()
              }
            }}
          />
          <button type="button" onClick={onSend} disabled={sending || !draft.trim() || !conversation?.id} className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </Card>
  )
}

export function MessagesPage({ onNavigate }) {
  const { token, user } = useAuth()
  const [conversationList, setConversationList] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [activeConversation, setActiveConversation] = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadConversations() {
      try {
        setLoadingList(true)
        const payload = await messagesRepository.listConversations(token, { limit: 20, offset: 0 })
        const items = Array.isArray(payload.items) ? payload.items : []
        if (!isMounted) {
          return
        }
        setConversationList(items)
        setActiveConversationId((current) => current || items[0]?.id || null)
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load conversations.')
        }
      } finally {
        if (isMounted) {
          setLoadingList(false)
        }
      }
    }

    loadConversations()

    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    if (!activeConversationId) {
      return undefined
    }

    let isMounted = true

    async function loadConversation() {
      try {
        setLoadingThread(true)
        setError(null)
        const detail = await messagesRepository.getConversation(token, activeConversationId, { limit: 50, offset: 0 })
        if (isMounted) {
          setActiveConversation(detail)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load conversation.')
        }
      } finally {
        if (isMounted) {
          setLoadingThread(false)
        }
      }
    }

    loadConversation()

    return () => {
      isMounted = false
    }
  }, [activeConversationId, token])

  async function handleSend() {
    if (!token || !activeConversationId || !activeConversation?.id || !draft.trim()) {
      setError(!token ? 'Sign in before sending a message.' : null)
      return
    }

    try {
      setSending(true)
      setError(null)
      const sent = await messagesRepository.sendMessage(token, activeConversation.id, {
        body: draft.trim(),
        media_ids: [],
        reply_to_message_id: null,
      })
      setActiveConversation((current) => ({
        ...current,
        messages: [...(current?.messages || []), sent],
        last_message_at: sent.created_at,
      }))
      setConversationList((current) => current.map((conversation) => (
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              last_message_id: sent.id,
              last_message_body: sent.body,
              last_message_at: sent.created_at,
              last_sender_user_id: sent.sender_user_id,
              last_sender_name: sent.sender_name,
              unread_count: 0,
            }
          : conversation
      )))
      setDraft('')
    } catch (err) {
      setError(err.message || 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  const currentUserId = getCurrentUserId(user)

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description="Keep conversations with members, partners, and prospects organized." actionLabel="New Message" actionIcon="MessageSquare" onAction={() => onNavigate?.('/messages')} />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4">
          <div className="mb-4 flex gap-2">
            <button type="button" className="h-8 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white">Inbox</button>
            <button type="button" className="h-8 rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-500">Archived</button>
          </div>
          <ConversationList
            conversations={conversationList}
            activeConversationId={activeConversationId}
            loading={loadingList}
            onSelect={(conversation) => {
              setActiveConversationId(conversation.id)
              onNavigate?.(`/messages/${conversation.id}`)
            }}
          />
        </Card>
        {loadingThread ? (
          <Card className="grid min-h-[620px] place-items-center p-5">
            <p className="text-sm font-semibold text-slate-500">Loading conversation...</p>
          </Card>
        ) : (
          <ChatPanel
            conversation={activeConversationId ? activeConversation : null}
            currentUserId={currentUserId}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            sending={sending}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

export function ChatThreadPage({ conversationId, onNavigate }) {
  const { token, user } = useAuth()
  const [conversationList, setConversationList] = useState([])
  const [conversation, setConversation] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadThread() {
      try {
        setLoading(true)
        setError(null)
        const [listPayload, detail] = await Promise.all([
          messagesRepository.listConversations(token, { limit: 20, offset: 0 }),
          messagesRepository.getConversation(token, conversationId || 1, { limit: 50, offset: 0 }),
        ])

        if (isMounted) {
          setConversationList(Array.isArray(listPayload.items) ? listPayload.items : [])
          setConversation(detail)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load conversation.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadThread()

    return () => {
      isMounted = false
    }
  }, [conversationId, token])

  async function handleSend() {
    if (!token || !conversation?.id || !draft.trim()) {
      setError(!token ? 'Sign in before sending a message.' : null)
      return
    }

    try {
      setSending(true)
      setError(null)
      const sent = await messagesRepository.sendMessage(token, conversation.id, {
        body: draft.trim(),
        media_ids: [],
        reply_to_message_id: null,
      })
      setConversation((current) => ({
        ...current,
        messages: [...(current?.messages || []), sent],
        last_message_at: sent.created_at,
      }))
      setDraft('')
    } catch (err) {
      setError(err.message || 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  const currentUserId = getCurrentUserId(user)

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description="Thread view with persistent conversation context and reply controls." actionLabel="Back to Inbox" actionIcon="MessageSquare" onAction={() => onNavigate?.('/messages')} />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4">
          <ConversationList
            conversations={conversationList}
            activeConversationId={conversation?.id || conversationId}
            onSelect={(item) => onNavigate?.(`/messages/${item.id}`)}
          />
        </Card>
        {loading ? (
          <Card className="grid min-h-[620px] place-items-center p-5">
            <p className="text-sm font-semibold text-slate-500">Loading conversation...</p>
          </Card>
        ) : (
          <ChatPanel
            conversation={conversation}
            currentUserId={currentUserId}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            sending={sending}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

function MiniLine({ color = '#155dfc', points = '0,36 40,28 80,34 120,20 160,26 200,16 240,22 280,12' }) {
  return (
    <svg viewBox="0 0 280 44" className="mt-3 h-10 w-full" role="img" aria-label="Trend line">
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function buildChartPoints(items, key, { width = 760, height = 220, padding = 20 } = {}) {
  if (!items.length) {
    return ''
  }

  const values = items.map((item) => Number(item[key]) || 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  const step = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0

  return values
    .map((value, index) => {
      const x = padding + index * step
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function LargeLineChart({ items = [] }) {
  const followerPoints = buildChartPoints(items, 'followers')
  const engagementPoints = buildChartPoints(items, 'engagement')

  return (
    <svg viewBox="0 0 760 260" className="h-[280px] w-full" role="img" aria-label="Audience growth chart">
      {[50, 100, 150, 200].map((y) => (
        <line key={y} x1="0" x2="760" y1={y} y2={y} stroke="#e2e8f0" />
      ))}
      {followerPoints ? <polyline points={followerPoints} fill="none" stroke="#155dfc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {engagementPoints ? <polyline points={engagementPoints} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  )
}

export function AnalyticsPage() {
  const { token } = useAuth()
  const [period, setPeriod] = useState('last_30_days')
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const periodOptions = [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Last 30 days', value: 'last_30_days' },
    { label: 'Last 90 days', value: 'last_90_days' },
  ]
  const activePeriodLabel = periodOptions.find((item) => item.value === period)?.label || 'Last 30 days'

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      setLoading(true)
      setError('')
      setNotice('')

      try {
        const data = await analyticsRepository.getOverview(token, { period })
        if (!cancelled) {
          setOverview(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load analytics overview:', loadError)
          setError('Analytics are not available right now.')
          setOverview(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [period, token])

  async function handleExport() {
    setExporting(true)
    setNotice('')
    setError('')

    try {
      const report = await analyticsRepository.exportReport(token, { period })
      setNotice(`${report.report_name} is ready with ${report.rows?.length || 0} rows.`)
    } catch (exportError) {
      console.error('Failed to export analytics report:', exportError)
      setError('Analytics export could not be generated.')
    } finally {
      setExporting(false)
    }
  }

  const metrics = overview?.metrics || {}
  const audienceGrowth = overview?.audience_growth || []
  const topContent = overview?.top_content || []
  const insights = overview?.audience_insights || {}
  const fundingBars = audienceGrowth.slice(-6)
  const maxFunding = Math.max(...fundingBars.map((item) => Number(item.funding_activity) || 0), 1)
  const stats = [
    ['Profile Views', metrics.profile_views?.value || 0, metrics.profile_views?.trend_percent || 0, 'Eye', false],
    ['Pitch Reel Views', metrics.pitch_reel_views?.value || 0, metrics.pitch_reel_views?.trend_percent || 0, 'Play', false],
    ['New Followers', metrics.new_followers?.value || 0, metrics.new_followers?.trend_percent || 0, 'Users', false],
    ['Funding Activity', metrics.funding_activity?.value || 0, metrics.funding_activity?.trend_percent || 0, 'CircleDollarSign', true],
  ]

  function formatMetric(value, currency = false) {
    const number = Number(value) || 0
    if (currency) {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number)
    }
    if (number >= 10000) {
      return `${(number / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat().format(number)
  }

  function formatTrend(value) {
    const number = Number(value) || 0
    return `${number >= 0 ? '+' : ''}${number.toFixed(1)}%`
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" description="Understand what content, connections, and funding activity are moving your business forward." actionLabel={exporting ? 'Exporting...' : 'Export Report'} actionIcon="BarChart3" onAction={handleExport} />
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <PillTabs
            items={periodOptions.map((item) => item.label)}
            active={activePeriodLabel}
            onChange={(label) => setPeriod(periodOptions.find((item) => item.label === label)?.value || 'last_30_days')}
          />
          <p className="text-xs font-semibold text-slate-500">{loading ? 'Loading analytics...' : `Showing ${activePeriodLabel.toLowerCase()}`}</p>
        </div>
        {notice ? <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
        {error ? <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div> : null}
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, trend, icon, currency]) => (
          <StatCard key={label} label={label} value={loading ? '--' : formatMetric(value, currency)} trend={loading ? '' : formatTrend(trend)} icon={icon}>
            <p className="mt-1 text-xs text-slate-500">vs last 30 days</p>
            <MiniLine />
          </StatCard>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Audience growth" action="Last 30 days" />
          <div className="mb-2 flex gap-4 text-xs font-semibold text-slate-500">
            <span>Followers</span>
            <span>Engagement</span>
          </div>
          {loading ? (
            <div className="grid h-[280px] place-items-center text-sm font-semibold text-slate-500">Loading chart...</div>
          ) : (
            <LargeLineChart items={audienceGrowth} />
          )}
        </Card>
        <Card className="p-5">
          <SectionTitle title="Top content" action="View all" />
          {loading ? <p className="text-sm font-semibold text-slate-500">Loading top content...</p> : null}
          {!loading && topContent.length === 0 ? <p className="text-sm font-semibold text-slate-500">No content metrics yet.</p> : null}
          {topContent.map((item) => (
            <div key={`${item.content_type}-${item.id}`} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4 last:mb-0">
              <p className="text-sm font-bold text-slate-900">"{item.title}"</p>
              <p className="mt-1 text-xs text-slate-500">{formatMetric(item.views_count)} views - {Number(item.engagement_rate || 0).toFixed(1)}% engagement</p>
            </div>
          ))}
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_1fr]">
        <Card className="p-5">
          <SectionTitle title="Funding activity" action="Last 30 days" />
          <div className="flex h-56 items-end gap-6 px-6">
            {(fundingBars.length ? fundingBars : Array.from({ length: 6 }, (_, index) => ({ funding_activity: index + 1 }))).map((item, index) => (
              <div
                key={`${item.date || index}-${item.funding_activity}`}
                className="w-12 rounded-t-xl bg-blue-600"
                style={{ height: `${Math.max(24, ((Number(item.funding_activity) || 0) / maxFunding) * 160)}px` }}
                aria-label={`Funding bar ${index + 1}`}
              />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Audience insights" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [`${insights.entrepreneurs || 0}%`, 'Entrepreneurs'],
              [`${insights.creators || 0}%`, 'Creators'],
              [`${insights.funders || 0}%`, 'Funders'],
            ].map(([value, label]) => {
              return (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ToggleRow({ title, description, checked = true }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} className={`relative h-6 w-11 rounded-full ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Manage account settings, visibility controls, and notifications." actionLabel="Save Settings" actionIcon="Check" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Account settings" />
          <ToggleRow title="Public BizCard visibility" description="Allow members to discover your business profile." />
          <ToggleRow title="Two-factor prompt" description="Prompt for extra verification on sensitive actions." />
          <ToggleRow title="Show growth milestones" description="Display recent wins on your public profile." />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Notifications" />
          <ToggleRow title="Message alerts" description="Notify me when members send direct messages." />
          <ToggleRow title="Live event reminders" description="Send reminders before registered sessions." />
          <ToggleRow title="Funding updates" description="Alert me when funding activity changes." />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Privacy & security" action="Review" />
          <p className="text-sm leading-6 text-slate-500">Security and privacy controls are staged for backend connection.</p>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Data export" />
          <p className="text-sm leading-6 text-slate-500">Export actions can connect to account and analytics APIs later.</p>
        </Card>
      </div>
    </div>
  )
}

export function BizCardProfilePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Marcus Holloway" description="Business profile, credibility snapshot, and public activity." actionLabel="Edit BizCard" actionIcon="UserRound" />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]">
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarPlaceholder className="h-20 w-20 border-4 border-white/40" label="Marcus Holloway" />
              <div>
                <h2 className="text-3xl font-bold">Marcus Holloway</h2>
                <p className="mt-1 text-sm text-blue-50">Founder - Holloway Designs LLC</p>
              </div>
            </div>
            <button type="button" className="h-10 rounded-xl bg-white px-4 text-sm font-bold text-blue-700">View Public BizCard</button>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Profile Views', '3,764', '+12.6%', 'Eye'],
          ['Followers', '2,764', '+8.4%', 'Users'],
          ['Engagement', '9.7%', '+15.3%', 'Heart'],
          ['Funding Raised', '$24,850', '+18.7%', 'CircleDollarSign'],
        ].map(([label, value, trend, icon]) => (
          <StatCard key={label} label={label} value={value} trend={trend} icon={icon} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="p-5">
          <SectionTitle title="About Holloway Designs" action="Edit" />
          <p className="text-sm leading-6 text-slate-500">
            Holloway Designs helps growth-stage businesses clarify their brand, investor story, and customer experience.
          </p>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Growth badges" />
          {['Pitch Deck Approved', 'Seller Verified', 'Credit Ready'].map((item) => (
            <span key={item} className="mb-2 mr-2 inline-flex rounded-full bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700">{item}</span>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function BizQuestChallengeDetailPage() {
  const { token } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [entrySummary, setEntrySummary] = useState('')
  const [pitchReelId, setPitchReelId] = useState('')
  const [currentTime] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false

    async function loadChallenge() {
      try {
        setLoading(true)
        setError('')
        const payload = await bizquestRepository.getChallenge(token, 'pitch-to-win')

        if (!cancelled) {
          setChallenge(payload)
          setEntrySummary((current) => current || payload.viewer_latest_entry?.summary || '')
          setPitchReelId((current) => current || (payload.viewer_latest_entry?.pitch_reel_id ? String(payload.viewer_latest_entry.pitch_reel_id) : ''))
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load BizQuest challenge:', loadError)
          setError('BizQuest challenge could not be loaded.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadChallenge()

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleJoin() {
    if (!challenge?.slug) {
      return
    }

    try {
      setJoining(true)
      setError('')
      const participant = await bizquestRepository.joinChallenge(token, challenge.slug)
      setChallenge((current) => ({
        ...current,
        viewer_status: participant.status,
        viewer_points: Math.max(Number(current?.viewer_points || 0), Number(participant.points || 0)),
        progress_percent: Math.max(Number(current?.progress_percent || 0), 9),
        tasks: (current?.tasks || []).map((task) => (
          task.task_key === 'join-challenge' ? { ...task, viewer_completed: true } : task
        )),
      }))
      setNotice('Challenge joined. Your BizQuest progress is ready.')
    } catch (joinError) {
      console.error('Failed to join BizQuest challenge:', joinError)
      setError('Challenge join could not be saved.')
    } finally {
      setJoining(false)
    }
  }

  async function handleSubmitEntry(event) {
    event.preventDefault()

    if (!challenge?.slug) {
      return
    }

    if (!entrySummary.trim()) {
      setError('Add a short summary before submitting your BizQuest entry.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const entry = await bizquestRepository.submitEntry(token, challenge.slug, {
        pitch_reel_id: pitchReelId ? Number(pitchReelId) : null,
        summary: entrySummary.trim(),
        media_ids: [],
      })

      setChallenge((current) => ({
        ...current,
        viewer_status: 'submitted',
        viewer_entry_count: Math.max(Number(current?.viewer_entry_count || 0), 1),
        viewer_latest_entry: entry,
        viewer_points: Math.max(Number(current?.viewer_points || 0), pitchReelId ? 900 : 400),
        progress_percent: Math.max(Number(current?.progress_percent || 0), pitchReelId ? 82 : 36),
        tasks: (current?.tasks || []).map((task) => (
          task.task_key === 'submit-entry' || (pitchReelId && task.task_key === 'create-pitch-reel')
            ? { ...task, viewer_completed: true }
            : task
        )),
      }))
      setNotice('BizQuest entry submitted for review.')
    } catch (submitError) {
      console.error('Failed to submit BizQuest entry:', submitError)
      setError('BizQuest entry could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(value) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return 'Date TBD'
    }
    return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function daysLeft(value) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return 'Schedule TBD'
    }
    const days = Math.ceil((parsed.getTime() - currentTime) / 86400000)
    if (days <= 0) {
      return 'Closing soon'
    }
    return `${days} day${days === 1 ? '' : 's'} left`
  }

  const tasks = Array.isArray(challenge?.tasks) ? challenge.tasks : []
  const leaderboard = Array.isArray(challenge?.leaderboard) ? challenge.leaderboard : []
  const completedTasks = tasks.filter((task) => task.viewer_completed).length
  const imageUrl = challenge?.imageUrl || challenge?.cover_media_url || seedImages.pitchReelStudioImage
  const openTasks = Math.max(Number(challenge?.task_count || tasks.length || 0) - completedTasks, 0)

  return (
    <div className="space-y-4">
      <PageHeader
        title="BizQuest Challenge"
        description="Join a business growth challenge, complete tasks, and compete for rewards."
        actionLabel={joining ? 'Joining...' : challenge?.viewer_status ? 'Joined' : 'Join Challenge'}
        actionIcon="Trophy"
        onAction={handleJoin}
      />
      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden p-0">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-8 text-white">
              <p className="text-sm font-bold text-blue-100">{loading ? 'Loading challenge' : challenge?.title || 'Pitch to Win'}</p>
              <h2 className="mt-3 text-3xl font-bold">{challenge?.description || 'Turn your business story into a stronger pitch.'}</h2>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-100">
                  <span>Your Progress</span>
                  <span>{Math.round(Number(challenge?.progress_percent || 0))}%</span>
                </div>
                <ProgressBar value={Number(challenge?.progress_percent || 0)} className="bg-white/15" />
              </div>
            </div>
            <div className="h-64 bg-slate-100 lg:h-auto">
              <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            {[
              [`${openTasks} task${openTasks === 1 ? '' : 's'} due`, `${completedTasks} of ${challenge?.task_count || tasks.length || 0} complete`],
              [daysLeft(challenge?.ends_at), `${formatDate(challenge?.starts_at)} - ${formatDate(challenge?.ends_at)}`],
              [`${challenge?.participant_count || 0} participants`, `${challenge?.entry_count || 0} entries submitted`],
            ].map(([value, label]) => (
              <div key={value} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Your challenge status" />
            <div className="space-y-3">
              {loading ? <p className="text-sm font-semibold text-slate-500">Loading tasks...</p> : null}
              {tasks.map((task) => (
                <div key={task.id || task.task_key} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                  <span className={`grid h-8 w-8 flex-none place-items-center rounded-full ${task.viewer_completed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <DynamicIcon name={task.viewer_completed ? 'Check' : 'Circle'} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{task.description}</p>
                    <p className="mt-1 text-xs font-bold text-blue-600">+{task.points} points</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Challenge sponsor" />
            <p className="text-sm font-bold text-slate-900">{challenge?.sponsor_name || 'Sponsor pending'}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{challenge?.reward_summary || 'Sponsor rewards will appear here when connected.'}</p>
          </Card>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <SectionTitle title="Submit entry" action={challenge?.viewer_latest_entry ? 'Submitted' : 'Draft'} />
          <form className="mt-4 space-y-4" onSubmit={handleSubmitEntry}>
            <label className="block">
              <span className="text-sm font-bold text-slate-900">Pitch reel ID</span>
              <input
                type="number"
                min="1"
                value={pitchReelId}
                onChange={(event) => setPitchReelId(event.target.value)}
                placeholder="Optional until pitch reel backend is connected"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-900">Entry summary</span>
              <textarea
                value={entrySummary}
                onChange={(event) => setEntrySummary(event.target.value)}
                placeholder="Describe what you improved, learned, or want reviewers to notice."
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DynamicIcon name="Send" className="h-4 w-4" aria-hidden="true" />
              {submitting ? 'Submitting...' : 'Submit Entry'}
            </button>
          </form>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Leaderboard" />
          <div className="mt-4 space-y-3">
            {leaderboard.map((item, index) => (
              <div key={item.user_id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.display_name}</p>
                    <p className="truncate text-xs text-slate-500">{item.business_name || 'BizSocials member'}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-blue-600">{Number(item.points || 0).toLocaleString()}</p>
              </div>
            ))}
            {!loading && leaderboard.length === 0 ? <p className="text-sm font-semibold text-slate-500">No leaderboard activity yet.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function SponsorImpactPage() {
  const { token } = useAuth()
  const [period, setPeriod] = useState('last_30_days')
  const [overview, setOverview] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const periodOptions = [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Last 30 days', value: 'last_30_days' },
    { label: 'Last 90 days', value: 'last_90_days' },
  ]
  const activePeriodLabel = periodOptions.find((item) => item.value === period)?.label || 'Last 30 days'

  useEffect(() => {
    let cancelled = false

    async function loadSponsorImpact() {
      try {
        setLoading(true)
        setNotice('')
        setError('')
        const [overviewPayload, campaignsPayload] = await Promise.all([
          sponsorImpactRepository.getOverview(token, { period }),
          sponsorImpactRepository.listCampaigns(token, { status: 'active', limit: 6, offset: 0 }),
        ])

        if (!cancelled) {
          setOverview(overviewPayload)
          setCampaigns(Array.isArray(campaignsPayload.items) ? campaignsPayload.items : [])
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load sponsor impact:', loadError)
          setError('Sponsor impact data could not be loaded.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSponsorImpact()

    return () => {
      cancelled = true
    }
  }, [period, token])

  async function handleExport() {
    try {
      setExporting(true)
      setError('')
      setNotice('')
      const report = await sponsorImpactRepository.exportReport(token, { period })
      setNotice(`${report.report_name} is ready with ${report.rows?.length || 0} rows.`)
    } catch (exportError) {
      console.error('Failed to export sponsor impact:', exportError)
      setError('Sponsor impact export could not be generated.')
    } finally {
      setExporting(false)
    }
  }

  function formatMetric(value, { currency = false } = {}) {
    const number = Number(value) || 0
    if (currency) {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(number)
    }
    if (number >= 10000) {
      return `${(number / 1000).toFixed(number >= 100000 ? 0 : 1)}K`
    }
    return new Intl.NumberFormat().format(number)
  }

  function formatTrend(value) {
    const number = Number(value) || 0
    return `${number >= 0 ? '+' : ''}${number.toFixed(1).replace('.0', '')}%`
  }

  const metrics = overview?.metrics || {}
  const founderOutcomes = Array.isArray(overview?.founder_outcomes) ? overview.founder_outcomes : []
  const founderStories = Array.isArray(overview?.featured_founder_stories) ? overview.featured_founder_stories : []
  const statCards = [
    ['Founders supported', metrics.founders_supported, 'Users', false],
    ['Campaign reach', metrics.campaign_reach, 'Radio', false],
    ['Funding facilitated', metrics.funding_facilitated, 'CircleDollarSign', true],
    ['Active sponsors', metrics.active_sponsors, 'ShieldCheck', false],
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sponsor Impact Dashboard"
        description="Measure campaign reach, founder support, and real-time sponsorship outcomes."
        actionLabel={exporting ? 'Exporting...' : 'Export Report'}
        actionIcon="BarChart3"
        onAction={handleExport}
      />
      {notice ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div> : null}
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      <section className="rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-500 p-6 text-white shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-50">Measurable impact in real time.</p>
            <h2 className="mt-2 text-3xl font-bold">Track funded futures, visibility, and community lift.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50/90">Sponsor reporting now reads from campaign, event, and daily impact tables with local fallback data for frontend testing.</p>
          </div>
          <div className="flex-none">
            <PillTabs
              items={periodOptions.map((item) => item.label)}
              active={activePeriodLabel}
              onChange={(label) => setPeriod(periodOptions.find((item) => item.label === label)?.value || 'last_30_days')}
            />
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(([label, metric, icon, currency]) => (
          <StatCard
            key={label}
            label={label}
            value={loading ? '--' : formatMetric(metric?.value, { currency })}
            trend={loading ? '' : formatTrend(metric?.trend_percent)}
            icon={icon}
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Founder outcomes" />
          {loading ? <p className="text-sm font-semibold text-slate-500">Loading founder outcomes...</p> : null}
          {!loading && founderOutcomes.length === 0 ? <p className="text-sm font-semibold text-slate-500">No outcome metrics found.</p> : null}
          {founderOutcomes.map((item) => (
            <div key={item.outcome_key || item.label} className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 p-3 last:mb-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{formatMetric(item.value)} recorded outcomes</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">{formatTrend(item.trend_percent)}</span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <SectionTitle title="Featured founder stories" action="View all" />
          {loading ? <p className="text-sm font-semibold text-slate-500">Loading founder stories...</p> : null}
          {!loading && founderStories.length === 0 ? <p className="text-sm font-semibold text-slate-500">No founder stories found.</p> : null}
          {founderStories.map((item) => (
            <div key={item.id} className="mb-4 flex items-center gap-3 last:mb-0">
              <AvatarPlaceholder className="h-10 w-10" label={item.display_name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{item.display_name}</p>
                <p className="truncate text-xs text-slate-500">{item.milestone} - {item.sponsor_name}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card className="p-5">
        <SectionTitle title="Active sponsor campaigns" action={loading ? 'Loading' : `${campaigns.length} shown`} />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <article key={campaign.id || campaign.slug} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">{campaign.sponsor_name}</p>
                  <h3 className="mt-2 text-base font-bold text-slate-950">{campaign.title}</h3>
                </div>
                <StatusBadge status={campaign.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{campaign.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-950">{formatMetric(campaign.founders_supported)}</p>
                  <p className="mt-1 text-xs text-slate-500">founders</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-950">{formatMetric(campaign.funding_facilitated, { currency: true })}</p>
                  <p className="mt-1 text-xs text-slate-500">funding lift</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Founder target</span>
                  <span>{Math.round(Number(campaign.founder_progress_percent || 0))}%</span>
                </div>
                <ProgressBar value={Number(campaign.founder_progress_percent || 0)} />
              </div>
            </article>
          ))}
          {!loading && campaigns.length === 0 ? <p className="text-sm font-semibold text-slate-500">No sponsor campaigns found.</p> : null}
        </div>
      </Card>
    </div>
  )
}
