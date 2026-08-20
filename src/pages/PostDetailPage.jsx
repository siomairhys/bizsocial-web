import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw } from 'lucide-react'

import PostCard from '../components/feed/PostCard'
import { MediaViewer } from '../components/feed/MediaViewer'
import { CommentsDialog, EditPostDialog, ProfileDialog, ShareDialog } from '../components/feed/FeedDialogs'
import { useAuth } from '../modules/auth/context/useAuth'
import { removePostEverywhere, updatePostEverywhere } from '../modules/feed/feedCache'
import { feedRepository } from '../repositories/feedRepository'
import { feedQueryKeys } from '../queryClient'

export default function PostDetailPage({ postId, onNavigate }) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const viewerId = Number(user?.id || user?.userId || user?.user_id || 0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState(null)
  const [mediaViewer, setMediaViewer] = useState(null)
  const postQuery = useQuery({ queryKey: feedQueryKeys.post(postId), queryFn: () => feedRepository.getPost(token, postId), enabled: Boolean(token && postId) })
  const post = postQuery.data

  const reactionMutation = useMutation({
    mutationFn: () => feedRepository.toggleReaction(token, postId, 'like'),
    onSuccess: (summary) => updatePostEverywhere(queryClient, postId, (current) => ({ ...current, ...summary })),
  })
  const deleteMutation = useMutation({
    mutationFn: () => feedRepository.deletePost(token, postId),
    onSuccess: () => { removePostEverywhere(queryClient, postId); onNavigate?.('/feed') },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button type="button" onClick={() => onNavigate?.('/feed')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"><ArrowLeft className="h-4 w-4" />Back to feed</button>
      {postQuery.isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-white" /> : null}
      {postQuery.isError ? <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><h1 className="font-bold">Post could not be loaded</h1><p className="mt-1 text-sm">{postQuery.error?.message}</p><button type="button" onClick={() => postQuery.refetch()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold"><RefreshCw className="h-4 w-4" />Retry</button></section> : null}
      {post ? <PostCard post={post} currentUserId={viewerId} onProfile={setProfileUserId} onView={() => {}} onReact={() => reactionMutation.mutate()} reactionPending={reactionMutation.isPending} onComments={() => setCommentsOpen(true)} onShare={() => setShareOpen(true)} onEdit={() => setEditOpen(true)} onDelete={() => { if (window.confirm('Delete this post?')) deleteMutation.mutate() }} onCopyLink={() => navigator.clipboard.writeText(window.location.href)} onOpenMedia={(items, index) => setMediaViewer({ items, index })} /> : null}
      {post && commentsOpen ? <CommentsDialog post={post} token={token} currentUserId={viewerId} onClose={() => setCommentsOpen(false)} /> : null}
      {post && shareOpen ? <ShareDialog post={post} token={token} onClose={() => setShareOpen(false)} /> : null}
      {post && editOpen ? <EditPostDialog post={post} token={token} onClose={() => setEditOpen(false)} /> : null}
      {profileUserId ? <ProfileDialog userId={profileUserId} token={token} currentUserId={viewerId} onClose={() => setProfileUserId(null)} /> : null}
      {mediaViewer ? <MediaViewer items={mediaViewer.items} index={mediaViewer.index} onIndexChange={(index) => setMediaViewer((current) => ({ ...current, index }))} onClose={() => setMediaViewer(null)} /> : null}
    </div>
  )
}
