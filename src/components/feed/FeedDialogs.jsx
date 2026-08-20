import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Link2, MapPin, Repeat2, Send, Trash2, X } from 'lucide-react'

import { feedRepository } from '../../repositories/feedRepository'
import { profileRepository } from '../../repositories/profileRepository'
import { feedQueryKeys } from '../../queryClient'
import { updatePostEverywhere } from '../../modules/feed/feedCache'

function DialogFrame({ titleId, title, onClose, children, maxWidth = 'max-w-xl' }) {
  const closeRef = useRef(null)
  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <section className={`my-auto max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-3xl border border-white/60 bg-white shadow-2xl ${maxWidth}`} onClick={(event) => event.stopPropagation()}>
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 id={titleId} className="text-xl font-extrabold text-slate-950">{title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={`Close ${title}`} className="grid h-11 w-11 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function CommentsDialog({ post, token, currentUserId, onClose }) {
  const [body, setBody] = useState('')
  const queryClient = useQueryClient()
  const commentsQuery = useQuery({
    queryKey: feedQueryKeys.comments(post.id),
    queryFn: () => feedRepository.listComments(token, post.id),
    enabled: Boolean(token && post.id),
  })
  const createMutation = useMutation({
    mutationFn: () => feedRepository.createComment(token, post.id, body.trim()),
    onSuccess: (comment) => {
      queryClient.setQueryData(feedQueryKeys.comments(post.id), (current = []) => [...current, comment])
      updatePostEverywhere(queryClient, post.id, (item) => ({ ...item, comments_count: Number(item.comments_count || 0) + 1 }))
      setBody('')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (commentId) => feedRepository.deleteComment(token, post.id, commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(feedQueryKeys.comments(post.id), (current = []) => current.filter((comment) => Number(comment.id) !== Number(commentId)))
      updatePostEverywhere(queryClient, post.id, (item) => ({ ...item, comments_count: Math.max(0, Number(item.comments_count || 0) - 1) }))
    },
  })

  function submit(event) {
    event.preventDefault()
    if (body.trim() && !createMutation.isPending) createMutation.mutate()
  }

  return (
    <DialogFrame titleId="comments-title" title={`Comments (${commentsQuery.data?.length ?? post.comments_count ?? 0})`} onClose={onClose}>
      <div className="space-y-3 p-5">
        {commentsQuery.isLoading ? <div className="space-y-3" aria-label="Loading comments">{[1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div> : null}
        {commentsQuery.isError ? <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">Comments could not be loaded. <button type="button" onClick={() => commentsQuery.refetch()} className="font-bold underline">Retry</button></div> : null}
        {commentsQuery.data?.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No comments yet. Start the conversation.</p> : null}
        {commentsQuery.data?.map((comment) => {
          const canDelete = Number(comment.author_user_id) === Number(currentUserId) || Number(post.author_user_id) === Number(currentUserId)
          return (
            <article key={comment.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-bold text-slate-900">{comment.author_first_name} {comment.author_last_name}</p><p className="text-xs text-slate-500">{comment.author_business_name}</p></div>
                {canDelete ? <button type="button" aria-label="Delete comment" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(comment.id)} className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button> : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
            </article>
          )
        })}
      </div>
      <form onSubmit={submit} className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <label htmlFor="comment-body" className="sr-only">Write a comment</label>
        <div className="flex items-end gap-2">
          <textarea id="comment-body" rows={2} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a thoughtful comment…" className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          <button type="submit" disabled={!body.trim() || createMutation.isPending} className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:bg-blue-300" aria-label="Post comment"><Send className="h-4 w-4" /></button>
        </div>
        {createMutation.isError ? <p role="alert" className="mt-2 text-sm font-medium text-red-700">{createMutation.error?.message || 'Comment could not be posted.'}</p> : null}
      </form>
    </DialogFrame>
  )
}

export function ShareDialog({ post, token, onClose }) {
  const [shareText, setShareText] = useState('')
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => feedRepository.sharePost(token, post.id, { share_type: 'repost', share_text: shareText.trim() || null }),
    onSuccess: () => {
      updatePostEverywhere(queryClient, post.id, (item) => ({ ...item, shares_count: Number(item.shares_count || 0) + 1 }))
      onClose()
    },
  })
  const link = `${window.location.origin}${window.location.pathname}#/feed/post/${post.id}`
  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  return (
    <DialogFrame titleId="share-title" title="Share post" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 p-5">
        <div><label htmlFor="share-text" className="mb-1 block text-sm font-bold text-slate-700">Add a note (optional)</label><textarea id="share-text" rows={3} maxLength={500} value={shareText} onChange={(event) => setShareText(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></div>
        <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white hover:bg-blue-500 disabled:bg-blue-300"><Repeat2 className="h-4 w-4" />{mutation.isPending ? 'Reposting…' : 'Repost to feed'}</button>
        <button type="button" onClick={copyLink} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 font-bold text-blue-700 hover:bg-blue-50"><Link2 className="h-4 w-4" />{copied ? 'Link copied' : 'Copy post link'}</button>
        {mutation.isError ? <p role="alert" className="text-sm font-medium text-red-700">{mutation.error?.message || 'Post could not be shared.'}</p> : null}
      </div>
    </DialogFrame>
  )
}

export function EditPostDialog({ post, token, onClose }) {
  const [content, setContent] = useState(post.content || '')
  const [visibility, setVisibility] = useState(post.visibility || 'public')
  const [isBizQuest, setIsBizQuest] = useState(Boolean(post.is_bizquest))
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => feedRepository.updatePost(token, post.id, { content: content.trim() || null, visibility, is_bizquest: isBizQuest }),
    onSuccess: (updated) => {
      updatePostEverywhere(queryClient, post.id, () => updated)
      onClose()
    },
  })
  return (
    <DialogFrame titleId="edit-post-title" title="Edit post" onClose={onClose}>
      <form onSubmit={(event) => { event.preventDefault(); mutation.mutate() }} className="space-y-4 p-5">
        <div><label htmlFor="edit-post-content" className="mb-1 block text-sm font-bold text-slate-700">Post text</label><textarea id="edit-post-content" rows={5} value={content} onChange={(event) => setContent(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></div>
        <div><label htmlFor="edit-post-visibility" className="mb-1 block text-sm font-bold text-slate-700">Visibility</label><select id="edit-post-visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-base"><option value="public">Public</option><option value="followers">Followers</option><option value="private">Private</option></select></div>
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3"><input type="checkbox" checked={isBizQuest} onChange={(event) => setIsBizQuest(event.target.checked)} className="h-5 w-5 rounded border-slate-300" /><span className="text-sm font-semibold text-slate-700">Include in BizQuest</span></label>
        {mutation.isError ? <p role="alert" className="text-sm font-medium text-red-700">{mutation.error?.message || 'Post could not be updated.'}</p> : null}
        <button type="submit" disabled={mutation.isPending || (!content.trim() && !(post.media?.length > 0))} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 font-bold text-white hover:bg-blue-500 disabled:bg-blue-300">{mutation.isPending ? 'Saving…' : 'Save changes'}</button>
      </form>
    </DialogFrame>
  )
}

export function ProfileDialog({ userId, token, currentUserId, onClose }) {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({ queryKey: feedQueryKeys.profile(userId), queryFn: () => profileRepository.getPublicProfile(userId, { token }), enabled: Boolean(userId) })
  const profile = profileQuery.data
  const mutation = useMutation({
    mutationFn: () => profile.viewerFollowing ? profileRepository.unfollowUser(token, userId) : profileRepository.followUser(token, userId),
    onSuccess: () => {
      const nextFollowing = !profile.viewerFollowing
      queryClient.setQueryData(feedQueryKeys.profile(userId), (current) => ({ ...current, viewerFollowing: nextFollowing, followerCount: Math.max(0, Number(current?.followerCount || 0) + (nextFollowing ? 1 : -1)) }))
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.suggestions })
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.list('following') })
    },
  })

  return (
    <DialogFrame titleId="profile-title" title={profile ? `${profile.firstName} ${profile.lastName}` : 'Member profile'} onClose={onClose} maxWidth="max-w-md">
      {profileQuery.isLoading ? <div className="space-y-3 p-5"><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /><div className="h-32 animate-pulse rounded-2xl bg-slate-100" /></div> : null}
      {profileQuery.isError ? <div className="p-5 text-sm font-medium text-red-700">Profile could not be loaded. <button type="button" onClick={() => profileQuery.refetch()} className="font-bold underline">Retry</button></div> : null}
      {profile ? (
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-4"><span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-blue-100 text-xl font-extrabold text-blue-700">{profile.photoUrl ? <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" /> : `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}</span><div><p className="text-xl font-extrabold text-slate-950">{profile.firstName} {profile.lastName}</p><p className="text-sm font-semibold text-blue-700">{profile.title || profile.role || 'BizSocials Member'}</p></div></div>
          <div className="grid grid-cols-2 rounded-2xl bg-slate-50 p-3 text-center"><div><p className="text-lg font-extrabold">{profile.followerCount}</p><p className="text-xs text-slate-500">Followers</p></div><div className="border-l border-slate-200"><p className="text-lg font-extrabold">{profile.followingCount}</p><p className="text-xs text-slate-500">Following</p></div></div>
          {profile.bio ? <p className="text-sm leading-6 text-slate-600">{profile.bio}</p> : null}
          {profile.businessName ? <p className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm text-slate-600"><Building2 className="h-4 w-4" />{profile.businessName}</p> : null}
          {profile.location ? <p className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-50 px-3 text-sm text-slate-600"><MapPin className="h-4 w-4" />{profile.location}</p> : null}
          {Number(userId) !== Number(currentUserId) ? <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} aria-pressed={profile.viewerFollowing} className={`min-h-11 w-full rounded-xl px-4 font-bold ${profile.viewerFollowing ? 'border border-blue-200 bg-blue-50 text-blue-700' : 'bg-blue-600 text-white'}`}>{mutation.isPending ? 'Working…' : profile.viewerFollowing ? 'Following' : 'Follow'}</button> : null}
        </div>
      ) : null}
    </DialogFrame>
  )
}
