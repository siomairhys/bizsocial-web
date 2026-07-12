import { useMemo, useState, useEffect } from 'react'

import AvatarPlaceholder from '../components/common/AvatarPlaceholder'
import Card from '../components/common/Card'
import ProgressBar from '../components/common/ProgressBar'
import StatusBadge from '../components/common/StatusBadge'
import { DynamicIcon } from '../components/common/icons'
import { seedImages } from '../data/defaultSeedData'
import { useAuth } from '../modules/auth/context/useAuth'
import { bizbucksRepository } from '../repositories/bizbucksRepository'
import { groupsRepository } from '../repositories/groupsRepository'

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

const creditActions = [
  ['Register with major business credit bureaus', 'High', 'Start'],
  ['Separate personal and business finances', 'Medium', 'Start'],
  ['Update your funding profile', 'Medium', 'Start'],
  ['Build a revolving vendor account', 'Low', 'Start'],
]

export function CredTrackOverviewPage({ onNavigate }) {
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
                  <p className="text-4xl font-bold text-slate-950">82</p>
                  <p className="text-xs font-semibold text-slate-500">Readiness</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold text-slate-950">You are funding ready.</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your profile, documentation, and business history are strong enough to begin lender conversations.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['82/100', 'Readiness'],
                  ['100%', 'Verified'],
                  ['75%', 'Credit health'],
                ].map(([value, label]) => (
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
            {['Business verified', 'Payment data connected', 'Funding profile complete', 'Review next lender match'].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${index < 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <DynamicIcon name={index < 3 ? 'Check' : 'Clock3'} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{index < 3 ? 'Done' : 'Next'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function CredTrackActionPlanPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="CredTrack Action Plan" description="Work through the next funding readiness steps with clear priority and status." actionLabel="Apply Filters" actionIcon="Settings" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <SectionTitle title="Action Plan" />
          <div className="space-y-3">
            {creditActions.map(([title, priority, action]) => (
              <div key={title} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-600">
                    <DynamicIcon name="Check" className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">Recommended priority: {priority}</p>
                  </div>
                </div>
                <button type="button" className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-blue-600">{action}</button>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Readiness Impact" />
            <div className="grid grid-cols-3 gap-3">
              {['+8', '2', '1'].map((value, index) => (
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

const events = [
  ['Networking Mixer: Innovate & Connect', 'MAY', '22', 'Atlanta, GA', '6:00 PM EST'],
  ['Live Pitch Night', 'MAY', '29', 'Virtual Event', '7:00 PM EST'],
  ['Capital Access Workshop', 'JUN', '05', 'Dallas, TX', '6:30 PM EST'],
]

export function EventsDirectoryPage({ onNavigate }) {
  const [active, setActive] = useState('Upcoming')
  return (
    <div className="space-y-4">
      <PageHeader title="Events" description="Discover networking, workshops, and live sessions built for the BizSocials community." actionLabel="Create Event" actionIcon="CalendarDays" onAction={() => onNavigate?.('/events/create')} />
      <Card className="p-5">
        <PillTabs items={['Upcoming', 'My Events', 'Saved', 'Past']} active={active} onChange={setActive} />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {events.map(([title, month, day, location, time]) => (
            <article key={title} className="rounded-xl border border-slate-200 p-4">
              <EmptyMedia className="h-28" label={month} />
              <div className="mt-4 flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 px-3 py-2 text-center text-blue-700">
                  <p className="text-xs font-bold">{month}</p>
                  <p className="text-lg font-bold">{day}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{location} - {time}</p>
                </div>
              </div>
              <button type="button" onClick={() => onNavigate?.('/events/networking-mixer')} className="mt-4 h-9 w-full rounded-lg border border-slate-200 text-xs font-bold text-blue-600">View Event</button>
            </article>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Featured this week" action="Browse all" />
          <p className="text-sm font-bold text-slate-900">Networking for People Worth Meeting</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">A curated event block that can later pull from event recommendations.</p>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Your event activity" />
          {['4 upcoming RSVPs', '1 host invite', '2 saved workshops'].map((item) => (
            <p key={item} className="mb-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 last:mb-0">{item}</p>
          ))}
        </Card>
      </div>
    </div>
  )
}

export function EventDetailPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Event Detail" description="Event overview, RSVP state, host notes, and attendee context." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-200 to-blue-700 p-8 text-white">
            <span className="rounded-full bg-blue-950/30 px-3 py-1 text-xs font-bold">NETWORKING</span>
            <h2 className="mt-14 text-3xl font-bold">Networking Mixer: Innovate & Connect</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {['Thu, May 22, 2025', 'Atlanta, GA', '24 attending'].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-5">
            <h3 className="text-lg font-bold text-slate-950">About this event</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Meet founders, funders, and operators for intentional conversations around traction, capital, and partnerships.
            </p>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Reserve your spot" />
            <button type="button" className="h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white">Register Now</button>
            <button type="button" className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-blue-600">Add to calendar</button>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Who's going" action="View all" />
            <div className="flex -space-x-2">
              {['AM', 'ML', 'DC', 'RJ', 'SP'].map((item) => (
                <div key={item} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-700">{item}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CreateEventPage() {
  return (
    <FormShell title="Create Event" description="Create an event that is easy to discover, register for, and manage." submitLabel="Publish Event" checklist={['Add event details', 'Set registration rules', 'Preview attendee experience']}>
      <Field label="Event title" placeholder="Enter event title..." />
      <Field label="Date and time" placeholder="Select date, time, and timezone" />
      <Field label="Location or virtual link" placeholder="Add address or meeting link" />
      <Field label="Event description" placeholder="Describe what attendees can expect..." textarea />
    </FormShell>
  )
}

const courses = [
  ['Funding 101', 'The complete guide to raising capital.', '42 min'],
  ['Build Business Credit', 'Create stronger credibility for lenders.', '36 min'],
  ['Pitch Like a Pro', 'Clarify your story and ask.', '28 min'],
]

export function LearningHubPage({ onNavigate }) {
  const [active, setActive] = useState('Recommended')
  return (
    <div className="space-y-4">
      <PageHeader title="Learning Hub" description="Build skills, complete lessons, and turn business learning into action." actionLabel="Browse Courses" actionIcon="GraduationCap" />
      <Card className="p-5">
        <PillTabs items={['Recommended', 'In progress', 'Funding', 'Marketing', 'Sales']} active={active} onChange={setActive} />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {courses.map(([title, description, duration], index) => (
            <article key={title} className="rounded-xl border border-slate-200 p-4">
              <div className={`grid h-24 place-items-center rounded-xl text-sm font-bold text-white ${index === 0 ? 'bg-blue-900' : index === 1 ? 'bg-fuchsia-800' : 'bg-emerald-800'}`}>
                {title}
              </div>
              <p className="mt-4 text-sm font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{duration}</span>
                <button type="button" onClick={() => onNavigate?.('/courses/funding-101')} className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white">Start</button>
              </div>
            </article>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Continue Learning" action="View progress" />
          <p className="text-sm font-bold text-slate-900">Business Funding Fundamentals</p>
          <ProgressBar value={68} className="mt-4" />
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

export function CoursePlayerPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Funding 101" description="Watch lessons, complete modules, and apply funding concepts to your business." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-0">
          <div className="grid min-h-[360px] place-items-center rounded-t-2xl bg-gradient-to-br from-blue-950 to-cyan-500 text-white">
            <div className="text-center">
              <DynamicIcon name="Play" className="mx-auto h-14 w-14" aria-hidden="true" />
              <p className="mt-4 text-2xl font-bold">Capital Sources That Match Your Stage</p>
            </div>
          </div>
          <div className="p-5">
            <button type="button" className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Continue Lesson</button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle title="Course checklist" />
            {['Introduction to funding', 'Match capital to stage', 'Prepare lender documents'].map((item, index) => (
              <div key={item} className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 p-3 last:mb-0">
                <span className="text-sm font-semibold text-slate-800">{item}</span>
                <StatusBadge>{index === 0 ? 'Done' : 'Next'}</StatusBadge>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <SectionTitle title="Lesson notes" action="Open full notes" />
            <p className="text-sm leading-6 text-slate-500">Notes and worksheets can save to a course progress endpoint later.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

const products = [
  ['Logo & Brand Identity', 'DesignPro Studio', '$299'],
  ['Pitch Deck Design', 'SlideGenius', '$499'],
  ['Business Formation', 'LegalEase', '$199'],
  ['Local SEO Audit', 'Growth Studio', '$149'],
]

export function MarketplacePage({ onNavigate }) {
  const [active, setActive] = useState('All listings')
  return (
    <div className="space-y-4">
      <PageHeader title="Marketplace" description="Discover business services, products, and partner offers from trusted members." actionLabel="Create Listing" actionIcon="Store" onAction={() => onNavigate?.('/marketplace/create')} />
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input className="h-10 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 md:w-80" placeholder="Search marketplace..." />
          <PillTabs items={['All listings', 'Design', 'Funding', 'Services']} active={active} onChange={setActive} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {products.map(([title, seller, price], index) => (
            <article key={title} className="rounded-xl border border-slate-200 p-4">
              <EmptyMedia className={`h-20 ${index === 0 ? 'from-cyan-100 to-blue-100' : ''}`} label="" />
              <p className="mt-4 text-sm font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-xs text-slate-500">by {seller}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">{price}</span>
                <button type="button" onClick={() => onNavigate?.('/marketplace/logo-brand-identity')} className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-600">View</button>
              </div>
            </article>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-4">
        {['Branding Design', 'Funding & Finance', 'Marketing & Sales', 'Legal & Operations'].map((item) => (
          <Card key={item} className="p-5">
            <p className="text-sm font-bold text-slate-900">{item}</p>
            <p className="mt-2 text-xs text-slate-500">Popular category</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function MarketplaceListingDetailPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Marketplace Listing" description="Review offer details, seller credibility, package options, and purchase intent." />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <EmptyMedia className="h-72" label="Listing Preview" />
          <h2 className="mt-5 text-2xl font-bold text-slate-950">Logo & Brand Identity</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            A complete visual identity package for founders who need a professional brand foundation.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['3-7 days', 'Branding', '100% remote'].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-800">{item}</div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-500">Starting at</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">$299</p>
            <button type="button" className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-bold text-white">Buy Now</button>
            <button type="button" className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-sm font-bold text-blue-600">Message seller</button>
          </Card>
          <Card className="p-5">
            <SectionTitle title="Seller" />
            <div className="flex items-center gap-3">
              <AvatarPlaceholder className="h-11 w-11" label="DesignPro Studio" />
              <div>
                <p className="text-sm font-bold text-slate-900">DesignPro Studio</p>
                <p className="text-xs text-slate-500">Verified seller</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function CreateMarketplaceListingPage() {
  return (
    <FormShell title="Create Marketplace Listing" description="Create a listing that explains your offer, price, and fulfillment clearly." submitLabel="Publish Listing" checklist={['Describe the offer', 'Set clear pricing', 'Add service requirements']}>
      <Field label="Listing title" placeholder="Enter listing title..." />
      <Field label="Description" placeholder="Describe the offer, deliverables, and audience..." textarea />
      <Field label="Price" placeholder="$299" />
      <Field label="Category" placeholder="Select a category" />
    </FormShell>
  )
}

const conversations = [
  ['Sarah Johnson', 'Let us connect about your pitch.', '2m', true],
  ['Investor Network', 'New event: Live Pitch Night', '1h', false],
  ['Michael Lee', 'Thanks for reaching out.', '3h', false],
  ['Entrepreneurs Unite', 'Alicia posted a new prompt.', '4h', false],
]

function ConversationList({ active = 'Sarah Johnson', onSelect }) {
  return (
    <div className="space-y-2">
      {conversations.map(([name, message, time, unread]) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect?.(name)}
          className={`flex min-h-16 w-full items-center gap-3 rounded-xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            active === name ? 'bg-blue-50' : 'hover:bg-slate-50'
          }`}
        >
          <AvatarPlaceholder className="h-10 w-10" label={name} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-bold text-slate-900">{name}</span>
              <span className="text-xs text-slate-400">{time}</span>
            </span>
            <span className="mt-1 block truncate text-xs text-slate-500">{message}</span>
          </span>
          {unread ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
        </button>
      ))}
    </div>
  )
}

function ChatPanel() {
  const bubbles = [
    ['Sarah Johnson', 'Hey Marcus, I loved the way you framed the funding use case.', 'left'],
    ['Marcus Holloway', 'Thank you. I am tightening the ask before I share it more broadly.', 'right'],
    ['Sarah Johnson', 'The next version should lead with traction and the customer story.', 'left'],
    ['Marcus Holloway', 'That helps. I will update the deck today.', 'right'],
  ]

  return (
    <Card className="flex min-h-[620px] flex-col p-0">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <AvatarPlaceholder className="h-10 w-10" label="Sarah Johnson" />
          <div>
            <p className="text-sm font-bold text-slate-950">Sarah Johnson</p>
            <p className="text-xs text-emerald-600">Online now</p>
          </div>
        </div>
        <button type="button" className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-blue-600">View profile</button>
      </div>
      <div className="flex-1 space-y-4 p-4">
        {bubbles.map(([name, text, side]) => (
          <div key={text} className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${side === 'right' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="sr-only">{name}</p>
              {text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <input className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500" placeholder="Write a message..." />
          <button type="button" className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white">Send</button>
        </div>
      </div>
    </Card>
  )
}

export function MessagesPage({ onNavigate }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description="Keep conversations with members, partners, and prospects organized." actionLabel="New Message" actionIcon="MessageSquare" onAction={() => onNavigate?.('/messages/sarah-johnson')} />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4">
          <div className="mb-4 flex gap-2">
            <button type="button" className="h-8 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white">Inbox</button>
            <button type="button" className="h-8 rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-500">Archived</button>
          </div>
          <ConversationList onSelect={() => onNavigate?.('/messages/sarah-johnson')} />
        </Card>
        <ChatPanel />
      </div>
    </div>
  )
}

export function ChatThreadPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description="Thread view with persistent conversation context and reply controls." actionLabel="Back to Inbox" actionIcon="MessageSquare" />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="p-4">
          <ConversationList />
        </Card>
        <ChatPanel />
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

function LargeLineChart() {
  return (
    <svg viewBox="0 0 760 260" className="h-[280px] w-full" role="img" aria-label="Audience growth chart">
      {[50, 100, 150, 200].map((y) => (
        <line key={y} x1="0" x2="760" y1={y} y2={y} stroke="#e2e8f0" />
      ))}
      <polyline points="0,190 80,180 160,150 240,142 320,120 400,80 500,75 610,55 690,40 760,185" fill="none" stroke="#155dfc" strokeWidth="4" strokeLinecap="round" />
      <polyline points="0,220 120,195 260,170 400,145 540,120 680,95 760,85" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function AnalyticsPage() {
  const stats = useMemo(
    () => [
      ['Profile Views', '3,482', '+12.6%', 'Eye'],
      ['Pitch Reel Views', '12.9K', '+24.8%', 'Play'],
      ['New Followers', '426', '+8.4%', 'Users'],
      ['Funding Activity', '$24,850', '+18.7%', 'CircleDollarSign'],
    ],
    []
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" description="Understand what content, connections, and funding activity are moving your business forward." actionLabel="Export Report" actionIcon="BarChart3" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, trend, icon]) => (
          <StatCard key={label} label={label} value={value} trend={trend} icon={icon}>
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
          <LargeLineChart />
        </Card>
        <Card className="p-5">
          <SectionTitle title="Top content" action="View all" />
          {['Design that drives growth', 'Studio growth fund update', 'My #BizDropChallenge'].map((item) => (
            <div key={item} className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4 last:mb-0">
              <p className="text-sm font-bold text-slate-900">"{item}"</p>
              <p className="mt-1 text-xs text-slate-500">2.4K views - 8.6% engagement</p>
            </div>
          ))}
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_1fr]">
        <Card className="p-5">
          <SectionTitle title="Funding activity" action="Last 30 days" />
          <div className="flex h-56 items-end gap-8 px-6">
            {[42, 68, 34, 88, 76, 104].map((height, index) => (
              <div key={height} className="w-12 rounded-t-xl bg-blue-600" style={{ height }} aria-label={`Funding bar ${index + 1}`} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Audience insights" />
          <div className="grid gap-4 md:grid-cols-3">
            {['44% Entrepreneurs', '28% Creators', '16% Funders'].map((item) => {
              const [value, label] = item.split(' ')
              return (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
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
  return (
    <div className="space-y-4">
      <PageHeader title="BizQuest Challenge" description="Join a business growth challenge, complete tasks, and compete for rewards." actionLabel="Join Challenge" actionIcon="Trophy" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-8 text-white">
            <p className="text-sm font-bold text-blue-100">Pitch to Win</p>
            <h2 className="mt-3 text-3xl font-bold">Turn your business story into a stronger pitch.</h2>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            {['1 task due', '8 days left', '32 groups'].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-800">{item}</div>
            ))}
          </div>
          <div className="p-5 pt-0">
            <SectionTitle title="Top entries" />
            {['Alicia Moore', 'David Chen', 'Marcus Holloway'].map((item, index) => (
              <div key={item} className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 p-3 last:mb-0">
                <span className="text-sm font-bold text-slate-900">{index + 1}. {item}</span>
                <span className="text-xs font-bold text-blue-600">{1200 - index * 140} pts</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <PublishChecklist title="Your challenge status" items={['Create pitch reel', 'Submit application', 'Promote your entry']} />
          <Card className="p-5">
            <SectionTitle title="Challenge sponsor" />
            <p className="text-sm leading-6 text-slate-500">Sponsor blocks can later pull from sponsor campaign APIs.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function SponsorImpactPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Sponsor Impact Dashboard" description="Measure campaign reach, founder support, and real-time sponsorship outcomes." actionLabel="Export Report" actionIcon="BarChart3" />
      <section className="rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-500 p-6 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-blue-50">Measurable impact in real time.</p>
        <h2 className="mt-2 text-3xl font-bold">Track funded futures, visibility, and community lift.</h2>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Founders supported', '300', '+44%'],
          ['Campaign reach', '82K', '+29%'],
          ['Funding facilitated', '$240K', '+18%'],
          ['Active sponsors', '21', '+8%'],
        ].map(([label, value, trend]) => (
          <StatCard key={label} label={label} value={value} trend={trend} icon="BarChart3" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <SectionTitle title="Founder outcomes" />
          {['Pitch readiness unlocked', 'Funding profile completed', 'Capital access workshop attended'].map((item) => (
            <div key={item} className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 p-3 last:mb-0">
              <span className="text-sm font-semibold text-slate-800">{item}</span>
              <span className="text-xs font-bold text-emerald-600">+12%</span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <SectionTitle title="Featured founder stories" action="View all" />
          {['Alicia Moore', 'David Chen', 'Tanya Grant'].map((item) => (
            <div key={item} className="mb-4 flex items-center gap-3 last:mb-0">
              <AvatarPlaceholder className="h-10 w-10" label={item} />
              <div>
                <p className="text-sm font-bold text-slate-900">{item}</p>
                <p className="text-xs text-slate-500">Growth milestone reached</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
