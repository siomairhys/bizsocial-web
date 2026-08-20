import { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, RefreshCw } from 'lucide-react'

import PostCard from '../components/feed/PostCard'
import { MediaViewer } from '../components/feed/MediaViewer'
import { CommentsDialog, EditPostDialog, ProfileDialog, ShareDialog } from '../components/feed/FeedDialogs'
import { useAuth } from '../modules/auth/context/useAuth'
import { removePostEverywhere, updatePostEverywhere } from '../modules/feed/feedCache'
import { feedRepository } from '../repositories/feedRepository'
import { groupsRepository } from '../repositories/groupsRepository'
import { profileRepository } from '../repositories/profileRepository'
import { feedQueryKeys } from '../queryClient'
import CreatePostPage from './CreatePostPage'

const feedTabs = [
  { value: 'for_you', label: 'For You' },
  { value: 'following', label: 'Following' },
  { value: 'bizquest', label: 'BizQuest' },
  { value: 'trending', label: 'Trending' },
]

function currentUserId(user) {
  return Number(user?.id || user?.userId || user?.user_id || 0)
}

function SidebarCard({ title, actionLabel, onAction, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
        {actionLabel ? <button type="button" onClick={onAction} className="min-h-11 rounded-lg px-2 text-xs font-bold text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">{actionLabel}</button> : null}
      </div>
      {children}
    </section>
  )
}

function FeedSkeleton() {
  return [1, 2, 3].map((item) => (
    <article key={item} aria-hidden="true" className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex gap-3"><div className="h-10 w-10 rounded-full bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-4 w-40 rounded bg-slate-200" /><div className="h-3 w-28 rounded bg-slate-100" /></div></div>
      <div className="mt-5 h-4 rounded bg-slate-100" /><div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
    </article>
  ))
}

function FeedPage({ onNavigate }) {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const viewerId = currentUserId(user)
  const [activeTab, setActiveTab] = useState('for_you')
  const [topic, setTopic] = useState('')
  const [commentsPost, setCommentsPost] = useState(null)
  const [sharePost, setSharePost] = useState(null)
  const [editPost, setEditPost] = useState(null)
  const [profileUserId, setProfileUserId] = useState(null)
  const [mediaViewer, setMediaViewer] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [joinedGroupIds, setJoinedGroupIds] = useState([])
  const [composerOpen, setComposerOpen] = useState(false)
  const composerOpenerRef = useRef(null)

  useEffect(() => {
    if (!composerOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setComposerOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
      window.requestAnimationFrame(() => composerOpenerRef.current?.focus())
    }
  }, [composerOpen])

  const feedQuery = useInfiniteQuery({
    queryKey: feedQueryKeys.list(activeTab, topic),
    queryFn: ({ pageParam }) => feedRepository.list(token, { tab: activeTab, limit: 10, cursor: pageParam, topic: topic || null }),
    initialPageParam: null,
    getNextPageParam: (page) => page?.next_cursor || undefined,
    enabled: Boolean(token),
  })
  const posts = useMemo(() => feedQuery.data?.pages.flatMap((page) => page.items || []) || [], [feedQuery.data])

  const topicsQuery = useQuery({ queryKey: feedQueryKeys.topics, queryFn: () => feedRepository.listTrendingTopics(token, { limit: 6 }), enabled: Boolean(token) })
  const suggestionsQuery = useQuery({ queryKey: feedQueryKeys.suggestions, queryFn: () => profileRepository.getSuggestions(token, { limit: 4 }), enabled: Boolean(token) })
  const groupsQuery = useQuery({ queryKey: ['groups', 'suggested'], queryFn: () => groupsRepository.getList({ token, limit: 3, offset: 0 }), enabled: Boolean(token) })

  const reactionMutation = useMutation({
    mutationFn: (postId) => feedRepository.toggleReaction(token, postId, 'like'),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all })
      const snapshots = queryClient.getQueriesData({ queryKey: feedQueryKeys.all })
      updatePostEverywhere(queryClient, postId, (post) => {
        const reacted = !post.viewer_reacted
        return { ...post, viewer_reacted: reacted, reactions_count: Math.max(0, Number(post.reactions_count || 0) + (reacted ? 1 : -1)) }
      })
      return { snapshots }
    },
    onError: (error, _postId, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      setStatusMessage(error?.message || 'Reaction could not be saved.')
    },
    onSuccess: (summary, postId) => updatePostEverywhere(queryClient, postId, (post) => ({ ...post, ...summary })),
  })

  const deleteMutation = useMutation({
    mutationFn: (postId) => feedRepository.deletePost(token, postId),
    onSuccess: (_, postId) => {
      removePostEverywhere(queryClient, postId)
      setStatusMessage('Post deleted.')
    },
    onError: (error) => setStatusMessage(error?.message || 'Post could not be deleted.'),
  })

  const followMutation = useMutation({
    mutationFn: (userId) => profileRepository.followUser(token, userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(feedQueryKeys.suggestions, (current = []) => current.filter((profile) => Number(profile.userId) !== Number(userId)))
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.list('following') })
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.profile(userId) })
    },
    onError: (error) => setStatusMessage(error?.message || 'Profile could not be followed.'),
  })

  const joinMutation = useMutation({
    mutationFn: (groupId) => groupsRepository.join(token, groupId),
    onSuccess: (_, groupId) => setJoinedGroupIds((current) => [...new Set([...current, Number(groupId)])]),
    onError: (error) => setStatusMessage(error?.message || 'Group could not be joined.'),
  })

  function changeTab(tab) {
    setActiveTab(tab)
    setTopic('')
  }

  function openComposer(event) {
    composerOpenerRef.current = event.currentTarget
    setComposerOpen(true)
  }

  function closeComposer() {
    setComposerOpen(false)
  }

  function copyPostLink(postId) {
    const link = `${window.location.origin}${window.location.pathname}#/feed/post/${postId}`
    navigator.clipboard.writeText(link).then(() => setStatusMessage('Post link copied.')).catch(() => setStatusMessage('Link could not be copied.'))
  }

  function requestDelete(postId) {
    if (window.confirm('Delete this post? This cannot be undone.')) deleteMutation.mutate(postId)
  }

  const suggestedGroups = groupsQuery.data?.items || []

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,68%)_minmax(18rem,32%)]">
        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><h1 className="text-3xl font-bold tracking-tight text-slate-950">Feed</h1><p className="mt-1 text-sm text-slate-500">Discover business stories, pitch reels, and growth wins from the community.</p></div>
              <button type="button" onClick={openComposer} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Create Post</button>
            </div>

            <button type="button" onClick={openComposer} aria-haspopup="dialog" className="mt-4 flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">{`${user?.firstName?.[0] || user?.first_name?.[0] || ''}${user?.lastName?.[0] || user?.last_name?.[0] || ''}`.toUpperCase() || 'BS'}</span>
              <span className="flex-1 text-sm text-slate-500">Share an update, photo, video, or BizQuest story…</span>
              <ImagePlus className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </button>

            <div role="tablist" aria-label="Feed categories" className="mt-4 flex flex-wrap gap-2">
              {feedTabs.map((tab) => <button key={tab.value} type="button" role="tab" aria-selected={activeTab === tab.value} onClick={() => changeTab(tab.value)} className={`min-h-11 rounded-xl px-4 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === tab.value ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>{tab.label}</button>)}
            </div>
            {topic ? <div className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-blue-50 px-3"><span className="text-sm font-bold text-blue-800">Filtering by #{topic}</span><button type="button" onClick={() => setTopic('')} className="min-h-11 rounded-lg px-3 text-sm font-bold text-blue-700 hover:bg-blue-100">Clear</button></div> : null}
            {statusMessage ? <p role="status" className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">{statusMessage}</p> : null}
          </section>

          {feedQuery.isLoading ? <FeedSkeleton /> : null}
          {feedQuery.isError ? <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p className="font-bold">The feed could not be loaded.</p><p className="mt-1">{feedQuery.error?.message}</p><button type="button" onClick={() => feedQuery.refetch()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-bold text-red-700 ring-1 ring-red-200"><RefreshCw className="h-4 w-4" />Retry</button></section> : null}
          {!feedQuery.isLoading && !feedQuery.isError && posts.length === 0 ? <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="text-lg font-bold text-slate-900">No posts found</h2><p className="mt-1 text-sm text-slate-500">Try another tab or create the first post here.</p><button type="button" onClick={openComposer} className="mt-4 min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white">Create Post</button></section> : null}

          {posts.map((post) => <PostCard key={post.id} post={post} currentUserId={viewerId} onProfile={setProfileUserId} onView={(postId) => onNavigate?.(`/feed/post/${postId}`)} onReact={(postId) => reactionMutation.mutate(postId)} reactionPending={reactionMutation.isPending && Number(reactionMutation.variables) === Number(post.id)} onComments={setCommentsPost} onShare={setSharePost} onEdit={setEditPost} onDelete={requestDelete} onCopyLink={copyPostLink} onOpenMedia={(items, index) => setMediaViewer({ items, index })} />)}

          {feedQuery.hasNextPage ? <button type="button" onClick={() => feedQuery.fetchNextPage()} disabled={feedQuery.isFetchingNextPage} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60">{feedQuery.isFetchingNextPage ? 'Loading more…' : 'Load more posts'}</button> : null}
        </main>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-[86px] xl:self-start">
          <SidebarCard title="Trending Topics" actionLabel="View trending" onAction={() => changeTab('trending')}>
            {topicsQuery.isLoading ? <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />)}</div> : null}
            {topicsQuery.isError ? <button type="button" onClick={() => topicsQuery.refetch()} className="min-h-11 text-sm font-bold text-red-700">Retry topics</button> : null}
            <ul className="space-y-1">{topicsQuery.data?.map((item) => <li key={item.hashtag_id}><button type="button" onClick={() => { setActiveTab('trending'); setTopic(item.normalized_tag) }} className="flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-left transition hover:bg-blue-50"><span className="font-bold text-blue-700">#{item.tag}</span><span className="text-xs text-slate-500">{item.post_count} posts</span></button></li>)}</ul>
          </SidebarCard>

          <SidebarCard title="Who to Follow">
            {suggestionsQuery.isLoading ? <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : null}
            {suggestionsQuery.isError ? <button type="button" onClick={() => suggestionsQuery.refetch()} className="min-h-11 text-sm font-bold text-red-700">Retry suggestions</button> : null}
            <ul className="space-y-2">{suggestionsQuery.data?.map((profile) => <li key={profile.userId} className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50"><button type="button" onClick={() => setProfileUserId(profile.userId)} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-blue-500"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">{profile.photoUrl ? <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" /> : `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}</span><span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-900">{profile.firstName} {profile.lastName}</span><span className="block truncate text-xs text-slate-500">{profile.title || profile.businessName}</span></span></button><button type="button" disabled={followMutation.isPending && Number(followMutation.variables) === Number(profile.userId)} onClick={() => followMutation.mutate(profile.userId)} className="min-h-11 shrink-0 rounded-xl border border-blue-200 px-3 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Follow</button></li>)}</ul>
          </SidebarCard>

          <SidebarCard title="Suggested Groups" actionLabel="View all" onAction={() => onNavigate?.('/groups')}>
            <ul className="space-y-2">{suggestedGroups.map((group) => { const joined = joinedGroupIds.includes(Number(group.id)); return <li key={group.id} className="flex items-center gap-2"><button type="button" onClick={() => onNavigate?.(`/groups/${group.slug || group.id}`)} className="min-h-11 min-w-0 flex-1 truncate rounded-lg text-left text-sm font-bold text-slate-900 hover:text-blue-700">{group.name}</button><button type="button" disabled={joined || (joinMutation.isPending && Number(joinMutation.variables) === Number(group.id))} onClick={() => joinMutation.mutate(group.id)} className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-blue-700 disabled:text-slate-400">{joined ? 'Joined' : 'Join'}</button></li> })}</ul>
          </SidebarCard>
        </aside>
      </div>

      {commentsPost ? <CommentsDialog post={commentsPost} token={token} currentUserId={viewerId} onClose={() => setCommentsPost(null)} /> : null}
      {sharePost ? <ShareDialog post={sharePost} token={token} onClose={() => setSharePost(null)} /> : null}
      {editPost ? <EditPostDialog post={editPost} token={token} onClose={() => setEditPost(null)} /> : null}
      {profileUserId ? <ProfileDialog userId={profileUserId} token={token} currentUserId={viewerId} onClose={() => setProfileUserId(null)} /> : null}
      {mediaViewer ? <MediaViewer items={mediaViewer.items} index={mediaViewer.index} onIndexChange={(index) => setMediaViewer((current) => ({ ...current, index }))} onClose={() => setMediaViewer(null)} /> : null}
      {composerOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="feed-composer-title" className="my-auto w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
            <CreatePostPage
              embedded
              onClose={closeComposer}
              onPublished={() => {
                setStatusMessage('Post published successfully.')
                closeComposer()
              }}
              onNavigate={(route) => {
                closeComposer()
                onNavigate?.(route)
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default FeedPage
