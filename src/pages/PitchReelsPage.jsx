import { useEffect, useRef, useState } from 'react'
import { Heart, MessageCircle, Play, Share2, Upload, X } from 'lucide-react'

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

function PitchReelModal({ item, onClose }) {
  const videoRef = useRef(null)

  // Pause video when modal closes
  useEffect(() => {
    const videoElement = videoRef.current
    return () => {
      videoElement?.pause()
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-slate-800/80 text-white transition hover:bg-red-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Video / Cover */}
        {item.primaryVideoUrl ? (
          <video
            ref={videoRef}
            src={item.primaryVideoUrl}
            controls
            autoPlay
            playsInline
            className="max-h-[60vh] w-full object-contain bg-black"
            poster={item.coverImageUrl || undefined}
          />
        ) : item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="max-h-[50vh] w-full object-contain bg-black"
          />
        ) : (
          <div className={`flex h-56 items-center justify-center bg-gradient-to-b ${item.gradient}`}>
            <Play className="h-14 w-14 text-white/60" aria-hidden="true" />
          </div>
        )}

        {/* Info */}
        <div className="space-y-3 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-300 text-sm font-bold text-slate-700">
              {item.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{item.authorName}</p>
            </div>
          </div>

          <div>
            <p className="text-xl font-bold leading-snug">{item.title}</p>
            {item.subtitle ? <p className="mt-1 text-sm text-slate-300">{item.subtitle}</p> : null}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-700 pt-3 text-sm text-slate-300">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition hover:bg-slate-800"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              {formatCount(item.likes)}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition hover:bg-slate-800"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {item.comments}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PitchReelsPage({ onNavigate }) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('top')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

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
    <>
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

        {error ? <p className="mb-3 text-sm font-semibold text-red-600">{error}</p> : null}

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading pitch reels...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open pitch reel: ${item.title}`}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedItem(item) }}
                className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className={`relative h-64 bg-gradient-to-b ${item.gradient}`}>
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : item.primaryVideoUrl ? (
                    <video
                      src={item.primaryVideoUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition hover:opacity-100">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                </div>
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

    {selectedItem ? (
      <PitchReelModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    ) : null}
    </>
  )
}

export default PitchReelsPage

