import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  Link2,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  Share2,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react'

import { ProfileDialog } from '../components/feed/FeedDialogs'
import { useAuth } from '../modules/auth/context/useAuth'
import { pitchReelQueryKeys } from '../queryClient'
import { pitchReelsRepository } from '../repositories/pitchReelsRepository'

const tabs = [
  { id: 'top', label: 'Top' },
  { id: 'latest', label: 'Latest' },
  { id: 'following', label: 'Following' },
  { id: 'fundable', label: 'Fundable' },
  { id: 'bizquest', label: 'BizQuest Entries' },
]

function formatCount(value) {
  const count = Number(value || 0)
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return `${count}`
}

function summaryPatch(summary = {}) {
  return {
    likes: Number(summary.reactions_count || 0),
    comments: Number(summary.comments_count || 0),
    shares: Number(summary.shares_count || 0),
    views: Number(summary.views_count || 0),
    viewerReacted: Boolean(summary.viewer_reacted),
  }
}

function PitchReelModal({
  item,
  token,
  currentUserId,
  position,
  totalItems,
  onClose,
  onUpdate,
  onPrevious,
  onNext,
  onOpenProfile,
}) {
  const queryClient = useQueryClient()
  const videoRef = useRef(null)
  const closeRef = useRef(null)
  const viewRecordedRef = useRef(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const interactionEnabled = Boolean(item.interactionEnabled && token)
  const viewerIsAuthor = Number(currentUserId) === Number(item.authorUserId)
  const canGoPrevious = position > 0
  const canGoNext = position >= 0 && position < totalItems - 1

  const interactionsQuery = useQuery({
    queryKey: pitchReelQueryKeys.interactions(item.id),
    queryFn: () => pitchReelsRepository.getInteractions(token, item.id),
    enabled: interactionEnabled,
  })

  useEffect(() => {
    if (interactionsQuery.data) onUpdate(item.id, summaryPatch(interactionsQuery.data))
  }, [interactionsQuery.data, item.id, onUpdate])

  const commentsQuery = useQuery({
    queryKey: pitchReelQueryKeys.comments(item.id),
    queryFn: () => pitchReelsRepository.listComments(token, item.id),
    enabled: interactionEnabled && commentsOpen,
  })

  const reactionMutation = useMutation({
    mutationFn: () => pitchReelsRepository.toggleReaction(token, item.id, 'like'),
    onMutate: () => {
      setActionError('')
      setFeedback('')
      onUpdate(item.id, {
        viewerReacted: !item.viewerReacted,
        likes: Math.max(0, item.likes + (item.viewerReacted ? -1 : 1)),
      })
      return { likes: item.likes, viewerReacted: item.viewerReacted }
    },
    onError: (error, _variables, snapshot) => {
      onUpdate(item.id, snapshot)
      setActionError(error?.message || 'Your reaction could not be saved. Please try again.')
    },
    onSuccess: (summary) => {
      queryClient.setQueryData(pitchReelQueryKeys.interactions(item.id), summary)
      onUpdate(item.id, summaryPatch(summary))
    },
  })

  const createCommentMutation = useMutation({
    mutationFn: () => pitchReelsRepository.createComment(token, item.id, commentBody),
    onSuccess: async (comment) => {
      queryClient.setQueryData(pitchReelQueryKeys.comments(item.id), (current = []) => [
        ...current,
        comment,
      ])
      onUpdate(item.id, { comments: item.comments + 1 })
      setCommentBody('')
      setActionError('')
      try {
        const summary = await pitchReelsRepository.getInteractions(token, item.id)
        onUpdate(item.id, summaryPatch(summary))
        queryClient.setQueryData(pitchReelQueryKeys.interactions(item.id), summary)
      } catch {
        // A later refresh reconciles the count; the successful comment remains visible.
      }
    },
    onError: (error) => {
      setActionError(error?.message || 'Your comment could not be posted. Please try again.')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => pitchReelsRepository.deleteComment(token, item.id, commentId),
    onSuccess: (result, commentId) => {
      queryClient.setQueryData(
        pitchReelQueryKeys.comments(item.id),
        (current = []) => current.filter((comment) => Number(comment.id) !== Number(commentId)),
      )
      onUpdate(item.id, { comments: Number(result.comments_count || 0) })
      queryClient.setQueryData(pitchReelQueryKeys.interactions(item.id), (current = {}) => ({
        ...current,
        comments_count: Number(result.comments_count || 0),
      }))
      setActionError('')
    },
    onError: (error) => {
      setActionError(error?.message || 'The comment could not be deleted. Please try again.')
    },
  })

  const shareMutation = useMutation({
    mutationFn: async () => {
      const link = `${window.location.origin}${window.location.pathname}#/pitch-reels/${encodeURIComponent(item.id)}`
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(link)
      if (!interactionEnabled) return { readOnly: true }
      return pitchReelsRepository.createShare(token, item.id, { shareType: 'copy_link' })
    },
    onSuccess: (result) => {
      if (!result.readOnly) {
        onUpdate(item.id, { shares: Number(result.shares_count || 0) })
        queryClient.setQueryData(pitchReelQueryKeys.interactions(item.id), (current = {}) => ({
          ...current,
          shares_count: Number(result.shares_count || 0),
        }))
      }
      setFeedback(result.readOnly ? 'Preview link copied. Read-only shares are not recorded.' : 'Pitch Reels link copied.')
      setActionError('')
      setMenuOpen(false)
    },
    onError: (error) => {
      setActionError(error?.message || 'The Reel link could not be copied. Please try again.')
    },
  })

  const reportMutation = useMutation({
    mutationFn: () => pitchReelsRepository.createReport(token, item.id, {
      reason: reportReason,
      details: reportDetails.trim() || null,
    }),
    onSuccess: () => {
      setReportOpen(false)
      setReportDetails('')
      setFeedback('Report submitted for review.')
      setActionError('')
    },
    onError: (error) => {
      setActionError(error?.message || 'The Reel could not be reported. Please try again.')
    },
  })

  const viewMutation = useMutation({
    mutationFn: ({ watchDurationSeconds, completed }) =>
      pitchReelsRepository.recordView(token, item.id, { watchDurationSeconds, completed }),
    onSuccess: (result) => {
      onUpdate(item.id, { views: Number(result.views_count || 0) })
      queryClient.setQueryData(pitchReelQueryKeys.interactions(item.id), (current = {}) => ({
        ...current,
        views_count: Number(result.views_count || 0),
      }))
      setActionError('')
    },
    onError: () => {
      viewRecordedRef.current = false
    },
  })

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const videoElement = videoRef.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      videoElement?.pause()
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [onClose])

  useEffect(() => {
    function handleArrowKey(event) {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
      if (event.key === 'ArrowLeft' && canGoPrevious) {
        event.preventDefault()
        onPrevious()
      }
      if (event.key === 'ArrowRight' && canGoNext) {
        event.preventDefault()
        onNext()
      }
    }

    window.addEventListener('keydown', handleArrowKey)
    return () => window.removeEventListener('keydown', handleArrowKey)
  }, [canGoNext, canGoPrevious, onNext, onPrevious])

  function recordQualifiedView(completed = false) {
    if (!interactionEnabled || viewRecordedRef.current || viewMutation.isPending) return
    const watched = Number(videoRef.current?.currentTime || 0)
    if (watched < 3 && !completed) return
    viewRecordedRef.current = true
    viewMutation.mutate({ watchDurationSeconds: watched, completed })
  }

  function submitComment(event) {
    event.preventDefault()
    if (commentBody.trim() && !createCommentMutation.isPending) createCommentMutation.mutate()
  }

  function submitReport(event) {
    event.preventDefault()
    if (!reportMutation.isPending) reportMutation.mutate()
  }

  function toggleComments() {
    setCommentsOpen((current) => !current)
    setShareOpen(false)
    setReportOpen(false)
    setMenuOpen(false)
    setFeedback('')
    setActionError('')
  }

  function toggleShare() {
    setShareOpen((current) => !current)
    setCommentsOpen(false)
    setReportOpen(false)
    setMenuOpen(false)
    setFeedback('')
    setActionError('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pitch-reel-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <section
        className="relative my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="More Reel actions"
          aria-expanded={menuOpen}
          aria-controls="pitch-reel-menu"
          onClick={() => setMenuOpen((current) => !current)}
          className="absolute right-16 top-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-slate-900/90 text-white ring-1 ring-white/20 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close Pitch Reel"
          className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-slate-900/90 text-white ring-1 ring-white/20 transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {menuOpen ? (
          <div id="pitch-reel-menu" role="menu" className="absolute right-3 top-16 z-40 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-2 text-sm text-white shadow-2xl">
            <button type="button" role="menuitem" disabled={!item.authorUserId} onClick={() => { setMenuOpen(false); onOpenProfile(item.authorUserId) }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-45">
              <UserRound className="h-4 w-4" aria-hidden="true" />{item.authorUserId ? (viewerIsAuthor ? 'View my profile' : 'View creator profile') : 'Creator profile unavailable'}
            </button>
            <button type="button" role="menuitem" disabled={shareMutation.isPending} onClick={() => shareMutation.mutate()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-45">
              {shareMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}Copy Reel link
            </button>
            {!viewerIsAuthor && interactionEnabled ? (
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setCommentsOpen(false); setShareOpen(false); setReportOpen(true); setFeedback(''); setActionError('') }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold text-red-300 transition hover:bg-red-500/15 focus-visible:ring-2 focus-visible:ring-red-400">
                <Flag className="h-4 w-4" aria-hidden="true" />Report Reel
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="relative flex min-h-72 items-center justify-center bg-black lg:min-h-[36rem]">
          {item.primaryVideoUrl ? (
            <video
              ref={videoRef}
              src={item.primaryVideoUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              onTimeUpdate={() => recordQualifiedView(false)}
              onEnded={() => recordQualifiedView(true)}
              className="max-h-[72dvh] w-full object-contain"
              poster={item.coverImageUrl || undefined}
            />
          ) : item.coverImageUrl ? (
            <img src={item.coverImageUrl} alt={item.title} className="max-h-[72dvh] w-full object-contain" />
          ) : (
            <div className={`flex h-72 w-full items-center justify-center bg-gradient-to-b ${item.gradient}`}>
              <Play className="h-14 w-14 text-white/70" aria-hidden="true" />
            </div>
          )}
          {canGoPrevious ? (
            <button type="button" aria-label="View previous Reel" onClick={onPrevious} className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white ring-1 ring-white/30 transition hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-white">
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>
          ) : null}
          {canGoNext ? (
            <button type="button" aria-label="View next Reel" onClick={onNext} className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white ring-1 ring-white/30 transition hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-white">
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          ) : null}
          {position >= 0 && totalItems > 1 ? <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white">{position + 1} of {totalItems}</span> : null}
        </div>

        <div className="flex min-h-0 flex-col bg-slate-900 text-white">
          <div className="space-y-4 p-5 pr-16">
            <button type="button" disabled={!item.authorUserId} onClick={() => onOpenProfile(item.authorUserId)} className="flex min-h-11 w-full items-center gap-3 rounded-xl text-left transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-default">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">{item.initials}</div>
              <p className="truncate text-sm font-semibold">{item.authorName}</p>
            </button>
            <div>
              <h2 id="pitch-reel-modal-title" className="text-xl font-bold leading-snug">{item.title}</h2>
              {item.subtitle ? <p className="mt-1 text-sm leading-6 text-slate-300">{item.subtitle}</p> : null}
            </div>
            <p className="text-xs font-medium text-slate-400">{formatCount(item.views)} {item.views === 1 ? 'view' : 'views'}</p>
          </div>

          <div className="grid grid-cols-3 border-y border-slate-700 px-2 py-2 text-sm">
            <button
              type="button"
              disabled={!interactionEnabled || reactionMutation.isPending}
              aria-pressed={item.viewerReacted}
              aria-label={`${item.viewerReacted ? 'Unlike' : 'Like'} Reel, ${item.likes} likes`}
              onClick={() => reactionMutation.mutate()}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-45 ${item.viewerReacted ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {reactionMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Heart className={`h-4 w-4 ${item.viewerReacted ? 'fill-current' : ''}`} aria-hidden="true" />}
              {formatCount(item.likes)}
            </button>
            <button
              type="button"
              disabled={!interactionEnabled}
              aria-expanded={commentsOpen}
              aria-controls="pitch-reel-comments"
              aria-label={`Comments, ${item.comments}`}
              onClick={toggleComments}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />{formatCount(item.comments)}
            </button>
            <button
              type="button"
              disabled={!interactionEnabled || shareMutation.isPending}
              aria-expanded={shareOpen}
              aria-controls="pitch-reel-share"
              aria-label={`Share Reel, ${item.shares} shares`}
              onClick={toggleShare}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />{formatCount(item.shares)}
            </button>
          </div>

          {!interactionEnabled ? <p className="mx-5 mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">Presentation preview is read-only. Sign in to the live account to interact.</p> : null}

          {reportOpen ? (
            <form onSubmit={submitReport} className="space-y-4 border-b border-slate-700 p-5" aria-labelledby="pitch-reel-report-title">
              <div><h3 id="pitch-reel-report-title" className="font-bold">Report this Reel</h3><p className="mt-1 text-sm leading-6 text-slate-300">Tell the moderation team what needs review. The creator is not notified who reported it.</p></div>
              <div><label htmlFor="pitch-reel-report-reason" className="mb-1 block text-sm font-semibold text-slate-200">Reason</label><select id="pitch-reel-report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="h-11 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 text-base text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="misleading">Misleading information</option><option value="inappropriate">Inappropriate content</option><option value="copyright">Copyright concern</option><option value="other">Other</option></select></div>
              <div><label htmlFor="pitch-reel-report-details" className="mb-1 block text-sm font-semibold text-slate-200">Details (optional)</label><textarea id="pitch-reel-report-details" rows={3} maxLength={1000} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} className="w-full resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-base text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30" /></div>
              <div className="flex gap-2"><button type="button" onClick={() => setReportOpen(false)} className="min-h-11 flex-1 rounded-xl border border-slate-600 px-4 font-bold text-slate-200 transition hover:bg-slate-800">Cancel</button><button type="submit" disabled={reportMutation.isPending} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 font-bold text-white transition hover:bg-red-500 disabled:bg-red-900">{reportMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Flag className="h-4 w-4" aria-hidden="true" />}{reportMutation.isPending ? 'Submitting…' : 'Submit report'}</button></div>
            </form>
          ) : null}

          {commentsOpen ? (
            <div id="pitch-reel-comments" className="flex min-h-0 flex-1 flex-col" aria-label="Reel comments">
              <div className="max-h-72 flex-1 space-y-3 overflow-y-auto p-4">
                {commentsQuery.isLoading ? <div className="space-y-3" aria-label="Loading Reel comments">{[1, 2].map((key) => <div key={key} className="h-20 animate-pulse rounded-2xl bg-slate-800" />)}</div> : null}
                {commentsQuery.isError ? <div className="rounded-xl bg-red-950/60 p-3 text-sm text-red-200">Comments could not be loaded. <button type="button" onClick={() => commentsQuery.refetch()} className="min-h-11 font-bold underline">Retry</button></div> : null}
                {commentsQuery.data?.length === 0 ? <p className="rounded-2xl bg-slate-800/70 p-4 text-center text-sm text-slate-300">No comments yet. Start the conversation.</p> : null}
                {commentsQuery.data?.map((comment) => (
                  <article key={comment.id} className="rounded-2xl bg-slate-800/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{comment.author_first_name} {comment.author_last_name}</p><p className="truncate text-xs text-slate-400">{comment.author_business_name}</p></div>
                      {comment.viewer_can_delete ? (
                        <button
                          type="button"
                          aria-label="Delete Reel comment"
                          disabled={deleteCommentMutation.isPending && Number(deleteCommentMutation.variables) === Number(comment.id)}
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-500/15 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-45"
                        >
                          {deleteCommentMutation.isPending && Number(deleteCommentMutation.variables) === Number(comment.id) ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{comment.body}</p>
                  </article>
                ))}
              </div>
              <form onSubmit={submitComment} className="border-t border-slate-700 p-4">
                <label htmlFor="pitch-reel-comment-body" className="sr-only">Write a Reel comment</label>
                <div className="flex items-end gap-2">
                  <textarea id="pitch-reel-comment-body" rows={2} maxLength={2000} value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Write a thoughtful comment…" className="min-h-11 flex-1 resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-base text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30" />
                  <button type="submit" disabled={!commentBody.trim() || createCommentMutation.isPending} aria-label="Post Reel comment" className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:bg-blue-900 disabled:text-blue-300">
                    {createCommentMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {shareOpen ? (
            <div id="pitch-reel-share" className="space-y-3 p-5">
              <p className="text-sm leading-6 text-slate-300">Copy the Pitch Reels page link and record this share.</p>
              <button type="button" disabled={shareMutation.isPending} onClick={() => shareMutation.mutate()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:bg-blue-900">
                {shareMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}{shareMutation.isPending ? 'Copying…' : 'Copy Reel link'}
              </button>
            </div>
          ) : null}

          <div aria-live="polite" className="px-5 pb-4">
            {feedback ? <p role="status" className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-200">{feedback}</p> : null}
            {actionError ? <p role="alert" className="rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{actionError}</p> : null}
            {interactionsQuery.isError ? <p className="mt-2 text-xs text-amber-200">Live counts could not be refreshed. Actions will still retry against the server.</p> : null}
          </div>
        </div>
      </section>
    </div>
  )
}

function PitchReelsSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading Pitch Reels">{[1, 2, 3, 4].map((key) => <div key={key} className="animate-pulse overflow-hidden rounded-2xl bg-slate-900"><div className="h-64 bg-slate-800" /><div className="space-y-3 p-4"><div className="h-4 w-2/3 rounded bg-slate-700" /><div className="h-3 rounded bg-slate-800" /></div></div>)}</div>
}

function PitchReelsPage({ onNavigate, reelId = null }) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('top')
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [profileUserId, setProfileUserId] = useState(null)
  const currentUserId = Number(user?.id || user?.userId || user?.user_id || 0)
  const activeReelId = reelId || selectedItemId

  const reelsQuery = useQuery({
    queryKey: pitchReelQueryKeys.list(activeTab),
    queryFn: () => pitchReelsRepository.list(token, { tab: activeTab }),
    enabled: Boolean(token),
  })
  const items = useMemo(() => reelsQuery.data?.items || [], [reelsQuery.data])
  const selectedListItem = items.find((item) => String(item.id) === String(activeReelId)) || null
  const detailQuery = useQuery({
    queryKey: pitchReelQueryKeys.detail(activeReelId),
    queryFn: () => pitchReelsRepository.get(token, activeReelId),
    enabled: Boolean(token && activeReelId && !selectedListItem),
  })
  const selectedItem = selectedListItem || detailQuery.data || null
  const selectedPosition = items.findIndex((item) => String(item.id) === String(activeReelId))

  const updateReel = useCallback((pitchReelId, patch) => {
    queryClient.setQueriesData({ queryKey: pitchReelQueryKeys.lists }, (current) => {
      if (!current?.items) return current
      return {
        ...current,
        items: current.items.map((entry) => String(entry.id) === String(pitchReelId) ? { ...entry, ...patch } : entry),
      }
    })
    queryClient.setQueryData(pitchReelQueryKeys.detail(pitchReelId), (current) => (
      current ? { ...current, ...patch } : current
    ))
  }, [queryClient])

  const openReel = useCallback((pitchReelId) => {
    setSelectedItemId(pitchReelId)
    onNavigate?.(`/pitch-reels/${encodeURIComponent(pitchReelId)}`)
  }, [onNavigate])

  function changeTab(tabId) {
    setSelectedItemId(null)
    setActiveTab(tabId)
    if (reelId) onNavigate?.('/pitch-reels')
  }

  const closeModal = useCallback(() => {
    setSelectedItemId(null)
    onNavigate?.('/pitch-reels')
  }, [onNavigate])

  const openPrevious = useCallback(() => {
    if (selectedPosition > 0) openReel(items[selectedPosition - 1].id)
  }, [items, openReel, selectedPosition])

  const openNext = useCallback(() => {
    if (selectedPosition >= 0 && selectedPosition < items.length - 1) {
      openReel(items[selectedPosition + 1].id)
    }
  }, [items, openReel, selectedPosition])

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-3xl font-bold tracking-tight text-slate-950">Pitch Reels</h1><p className="mt-1 text-sm text-slate-500">Showcase your business in 30 seconds or less.</p></div>
          <button type="button" onClick={() => onNavigate('/create-pitch-reel')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><Upload className="h-4 w-4" aria-hidden="true" />Upload Pitch Reel</button>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div role="tablist" aria-label="Pitch Reel categories" className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => changeTab(tab.id)} className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab.label}</button>)}
          </div>

          {reelsQuery.isLoading ? <PitchReelsSkeleton /> : null}
          {reelsQuery.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p className="font-bold">Pitch Reels could not be loaded.</p><p className="mt-1">{reelsQuery.error?.message}</p><button type="button" onClick={() => reelsQuery.refetch()} className="mt-3 min-h-11 rounded-xl bg-white px-4 font-bold text-red-700 ring-1 ring-red-200">Retry</button></div> : null}
          {!reelsQuery.isLoading && !reelsQuery.isError && items.length === 0 ? <div className="rounded-2xl bg-slate-50 p-8 text-center"><h2 className="text-lg font-bold text-slate-900">No Pitch Reels here yet</h2><p className="mt-1 text-sm text-slate-500">Try another category or upload the first Reel.</p></div> : null}

          {!reelsQuery.isLoading && !reelsQuery.isError ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-label={`Open pitch reel: ${entry.title}`}
                  onClick={() => openReel(entry.id)}
                  className="w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-left shadow-sm transition hover:ring-2 hover:ring-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className={`relative h-64 bg-gradient-to-b ${entry.gradient}`}>
                    {entry.coverImageUrl ? <img src={entry.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : entry.primaryVideoUrl ? <video src={entry.primaryVideoUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition hover:opacity-100"><div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-sm"><Play className="h-6 w-6 text-white" aria-hidden="true" /></div></div>
                  </div>
                  <div className="space-y-3 p-3.5 text-white">
                    <div className="flex items-center gap-2 text-xs text-slate-200"><div className="grid h-7 w-7 place-items-center rounded-full bg-slate-300 font-semibold text-slate-700">{entry.initials}</div><span className="truncate">{entry.authorName}</span></div>
                    <div><p className="text-[1.1rem] font-semibold leading-snug">{entry.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-300">{entry.subtitle}</p></div>
                    <div className="flex items-center gap-3 text-xs text-slate-300" aria-label="Reel engagement"><span className="inline-flex items-center gap-1"><Heart className={`h-3.5 w-3.5 ${entry.viewerReacted ? 'fill-current text-blue-300' : ''}`} aria-hidden="true" />{formatCount(entry.likes)}</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{formatCount(entry.comments)}</span><span className="inline-flex items-center gap-1"><Share2 className="h-3.5 w-3.5" aria-hidden="true" />{formatCount(entry.shares)}</span></div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {activeReelId && !selectedItem && detailQuery.isLoading ? <div role="dialog" aria-modal="true" aria-label="Loading Pitch Reel" className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"><div className="flex min-h-44 w-full max-w-md items-center justify-center gap-3 rounded-3xl border border-white/10 bg-slate-900 text-white"><LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" /><span className="font-semibold">Loading Pitch Reel…</span></div></div> : null}
      {activeReelId && !selectedItem && detailQuery.isError ? <div role="dialog" aria-modal="true" aria-labelledby="reel-load-error-title" className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-900 shadow-2xl"><h2 id="reel-load-error-title" className="text-xl font-extrabold">Pitch Reel could not be opened</h2><p className="mt-2 text-sm leading-6 text-slate-600">{detailQuery.error?.message || 'This Reel may no longer be available.'}</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => detailQuery.refetch()} className="min-h-11 flex-1 rounded-xl bg-blue-600 px-4 font-bold text-white">Retry</button><button type="button" onClick={closeModal} className="min-h-11 flex-1 rounded-xl border border-slate-200 px-4 font-bold text-slate-700">Back to Reels</button></div></section></div> : null}
      {selectedItem && !profileUserId ? <PitchReelModal key={selectedItem.id} item={selectedItem} token={token} currentUserId={currentUserId} position={selectedPosition} totalItems={items.length} onUpdate={updateReel} onClose={closeModal} onPrevious={openPrevious} onNext={openNext} onOpenProfile={setProfileUserId} /> : null}
      {profileUserId ? <ProfileDialog userId={profileUserId} token={token} currentUserId={currentUserId} onClose={() => setProfileUserId(null)} /> : null}
    </>
  )
}

export default PitchReelsPage
