import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { isAudio, isVideo, mediaUrl } from './mediaUtils'

export function MediaPreview({ media, className = '' }) {
  const url = mediaUrl(media)
  const label = media?.original_name || 'Post media'

  if (isVideo(media)) {
    return <video src={url} muted playsInline preload="metadata" aria-label={label} className={className} />
  }
  if (isAudio(media)) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 p-4 ${className}`}>
        <audio src={url} controls preload="metadata" aria-label={label} className="w-full" />
      </div>
    )
  }
  return <img src={url} alt={label} loading="lazy" className={className} />
}

export function MediaViewer({ items, index, onIndexChange, onClose }) {
  const closeRef = useRef(null)
  const active = items[index]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (items.length > 1 && event.key === 'ArrowLeft') {
        event.preventDefault()
        onIndexChange((index - 1 + items.length) % items.length)
      }
      if (items.length > 1 && event.key === 'ArrowRight') {
        event.preventDefault()
        onIndexChange((index + 1) % items.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [index, items.length, onClose, onIndexChange])

  if (!active || !mediaUrl(active)) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post media viewer"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 px-4 py-16 sm:px-20"
      onClick={onClose}
    >
      <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-sm font-semibold text-white">
        {index + 1} / {items.length}
      </span>
      <button ref={closeRef} type="button" aria-label="Close media viewer" onClick={onClose} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/30 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      {items.length > 1 ? (
        <>
          <button type="button" aria-label="View previous media" onClick={(event) => { event.stopPropagation(); onIndexChange((index - 1 + items.length) % items.length) }} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/30 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white sm:left-6">
            <ChevronLeft className="h-7 w-7" aria-hidden="true" />
          </button>
          <button type="button" aria-label="View next media" onClick={(event) => { event.stopPropagation(); onIndexChange((index + 1) % items.length) }} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white ring-1 ring-white/30 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white sm:right-6">
            <ChevronRight className="h-7 w-7" aria-hidden="true" />
          </button>
        </>
      ) : null}
      <div className="flex max-h-full max-w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
        {isVideo(active) ? (
          <video key={mediaUrl(active)} src={mediaUrl(active)} controls autoPlay playsInline className="max-h-[calc(100dvh-8rem)] max-w-full rounded-xl bg-black object-contain" />
        ) : isAudio(active) ? (
          <audio key={mediaUrl(active)} src={mediaUrl(active)} controls autoPlay className="w-[min(36rem,80vw)]" />
        ) : (
          <img key={mediaUrl(active)} src={mediaUrl(active)} alt={active.original_name || 'Post media'} className="max-h-[calc(100dvh-8rem)] max-w-full rounded-xl object-contain" />
        )}
      </div>
    </div>
  )
}
