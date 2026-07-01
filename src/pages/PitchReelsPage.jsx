import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Share2, Upload } from 'lucide-react'

import { useAuth } from '../modules/auth/context/useAuth'
import { pitchReelsRepository } from '../repositories/pitchReelsRepository'

const tabs = [
  { id: 'top', label: 'Top' },
  { id: 'latest', label: 'Latest' },
  { id: 'following', label: 'Following' },
  { id: 'fundable', label: 'Fundable' },
  { id: 'bizquest', label: 'BizQuest Entries' },
]

function formatCount(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }

  return `${value}`
}

function PitchReelsPage({ onNavigate }) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('top')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [endpoint, setEndpoint] = useState('')

  useEffect(() => {
    let active = true

    async function loadPitchReels() {
      setIsLoading(true)
      setError('')

      try {
        const payload = await pitchReelsRepository.list(token, { tab: activeTab })
        if (!active) {
          return
        }

        setItems(Array.isArray(payload?.items) ? payload.items : [])
        setEndpoint(String(payload?.endpoint || ''))
      } catch {
        if (!active) {
          return
        }

        setItems([])
        setError('Could not load pitch reels right now.')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadPitchReels()

    return () => {
      active = false
    }
  }, [activeTab, token])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Pitch Reels</h1>
          <p className="mt-1 text-sm text-slate-500">Showcase your business in 30 seconds or less.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/create-pitch-reel')}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload Pitch Reel
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
          API placeholder ready: {endpoint || '/pitch-reels'}
        </div>

        {error ? <p className="mb-3 text-sm font-semibold text-red-600">{error}</p> : null}

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading pitch reels...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"
              >
                <div className={`h-64 bg-gradient-to-b ${item.gradient}`} />
                <div className="space-y-3 bg-slate-950 p-3.5 text-white">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-300 font-semibold text-slate-700">
                      {item.initials}
                    </div>
                    <span>{item.authorName}</span>
                  </div>

                  <div>
                    <p className="text-[1.1rem] font-semibold leading-snug">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatCount(item.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.comments}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Share
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default PitchReelsPage
