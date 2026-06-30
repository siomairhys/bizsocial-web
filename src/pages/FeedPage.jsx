import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, MessageCircle, PlayCircle, Radio, Search, ThumbsUp } from 'lucide-react'

import { useAuth } from '../modules/auth/context/useAuth'
import { useMediaUpload } from '../modules/media/hooks/useMediaUpload'
import { feedRepository } from '../repositories/feedRepository'

const quickComposerActions = [
  { label: 'Photo / Video', icon: PlayCircle },
  { label: 'Pitch Reel', icon: PlayCircle },
  { label: 'Live', icon: Radio },
  { label: 'Event', icon: CalendarDays },
]

const feedTabs = [
  { label: 'For You', value: 'for_you' },
  { label: 'Following', value: 'following' },
  { label: 'BizQuest', value: 'bizquest' },
  { label: 'Trending', value: 'trending' },
]

const whoToFollow = [
  { name: 'Alicia Moore', role: 'Growth Coach', initials: 'AM' },
  { name: 'Tiffany Grant', role: 'Style Maven', initials: 'TG' },
  { name: 'Michael Lee', role: 'Investor', initials: 'ML' },
]

const suggestedGroups = [
  { name: 'Entrepreneurs Unite', members: '12.4K members', initials: 'EU' },
  { name: 'Women Founders Hub', members: '8.7K members', initials: 'WF' },
  { name: 'Startup Founders', members: '9.3K members', initials: 'SF' },
]

function toRelativeTime(isoValue) {
  if (!isoValue) {
    return 'now'
  }

  const then = new Date(isoValue).getTime()
  const now = Date.now()
  const diffMinutes = Math.max(1, Math.floor((now - then) / (1000 * 60)))

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function getAuthorInitials(post) {
  const first = String(post.author_first_name || '').trim()
  const last = String(post.author_last_name || '').trim()
  const initials = `${first[0] || ''}${last[0] || ''}`.toUpperCase()
  return initials || 'BS'
}

function getAuthorRole(post) {
  return post.author_title || post.author_business_name || 'BizSocials Member'
}

function getPrimaryMedia(post) {
  return Array.isArray(post.media) && post.media.length > 0 ? post.media[0] : null
}

function formatTopicCount(value) {
  const count = Number(value || 0)
  return `${count.toLocaleString()} posts`
}

function SidebarCard({ title, actionLabel, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 transition hover:text-blue-500"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FeedPage() {
  const { token, user } = useAuth()
  const mediaUpload = useMediaUpload(token)
  const mediaInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('for_you')
  const [posts, setPosts] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [composerText, setComposerText] = useState('')
  const [attachedMedia, setAttachedMedia] = useState([])
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedError, setFeedError] = useState('')

  const composerPlaceholder = useMemo(() => {
    const firstName = user?.firstName || user?.first_name || 'there'
    return `What's on your mind, ${firstName}?`
  }, [user])

  useEffect(() => {
    let active = true

    async function loadFeed() {
      if (!token) {
        return
      }

      setIsLoadingFeed(true)
      setFeedError('')

      try {
        const payload = await feedRepository.list(token, { tab: activeTab, limit: 20, offset: 0 })
        if (!active) {
          return
        }

        setPosts(Array.isArray(payload?.items) ? payload.items : [])
      } catch (error) {
        if (!active) {
          return
        }

        console.error('Failed to load feed:', error)
        setPosts([])
        setFeedError('Unable to load feed right now.')
      } finally {
        if (active) {
          setIsLoadingFeed(false)
        }
      }
    }

    loadFeed()

    return () => {
      active = false
    }
  }, [activeTab, token])

  useEffect(() => {
    let active = true

    async function loadTrendingTopics() {
      if (!token) {
        return
      }

      try {
        const topics = await feedRepository.listTrendingTopics(token, { limit: 5 })
        if (!active) {
          return
        }

        setTrendingTopics(Array.isArray(topics) ? topics : [])
      } catch (error) {
        if (!active) {
          return
        }

        console.error('Failed to load trending topics:', error)
        setTrendingTopics([])
      }
    }

    loadTrendingTopics()

    return () => {
      active = false
    }
  }, [token])

  function handleComposerMediaButtonClick() {
    if (mediaUpload.isUploading) {
      return
    }

    mediaInputRef.current?.click()
  }

  async function handleMediaSelected(event) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (!selectedFile || !token) {
      return
    }

    setFeedError('')

    try {
      const result = await mediaUpload.upload(selectedFile)

      setAttachedMedia((current) => [
        ...current,
        {
          mediaId: Number(result.mediaId),
          name: selectedFile.name,
          mediaType: result.mediaType,
        },
      ])
    } catch (error) {
      console.error('Failed to upload composer media:', error)
      setFeedError(error?.message || 'Unable to upload media right now.')
    }
  }

  function removeAttachedMedia(mediaId) {
    setAttachedMedia((current) => current.filter((item) => item.mediaId !== mediaId))
  }

  async function handleCreatePost() {
    const nextContent = composerText.trim()
    if (!nextContent || !token || isCreatingPost || mediaUpload.isUploading) {
      return
    }

    setIsCreatingPost(true)
    setFeedError('')

    try {
      const createdPost = await feedRepository.createPost(token, {
        content: nextContent,
        visibility: 'public',
        is_bizquest: false,
        media_ids: attachedMedia.map((item) => item.mediaId),
      })

      setComposerText('')
      setAttachedMedia([])
      setPosts((current) => [createdPost, ...current])
      setActiveTab('for_you')
    } catch (error) {
      console.error('Failed to create post:', error)
      setFeedError(error?.message || 'Unable to create post right now.')
    } finally {
      setIsCreatingPost(false)
    }
  }

  async function handleToggleReaction(postId) {
    if (!token) {
      return
    }

    try {
      const summary = await feedRepository.toggleReaction(token, postId, 'like')

      setPosts((current) =>
        current.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                reactions_count: Number(summary?.reactions_count || 0),
                comments_count: Number(summary?.comments_count || 0),
                shares_count: Number(summary?.shares_count || 0),
                viewer_reacted: Boolean(summary?.viewer_reacted),
              },
        ),
      )
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,68%)_minmax(0,32%)] 2xl:grid-cols-[minmax(0,70%)_minmax(0,30%)]">
      <div className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Feed</h1>
              <p className="mt-1 text-sm text-slate-500">
                Discover business stories, pitch reels, and growth wins from the community.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreatePost}
              disabled={isCreatingPost || mediaUpload.isUploading || !composerText.trim()}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isCreatingPost ? 'Posting...' : '+ Create Post'}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                MH
              </div>
              <label htmlFor="feed-composer" className="sr-only">
                Share an update
              </label>
              <div className="relative w-full">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="feed-composer"
                  type="text"
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                  placeholder={composerPlaceholder}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickComposerActions.map((action) => {
                const Icon = action.icon
                const isMediaAction = action.label === 'Photo / Video'
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={isMediaAction ? handleComposerMediaButtonClick : undefined}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.label}
                  </button>
                )
              })}
            </div>

            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleMediaSelected}
            />

            {mediaUpload.isUploading ? (
              <p className="mt-2 text-xs font-semibold text-blue-700">
                Uploading media... {mediaUpload.progress}%
              </p>
            ) : null}

            {attachedMedia.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachedMedia.map((item) => (
                  <button
                    key={item.mediaId}
                    type="button"
                    onClick={() => removeAttachedMedia(item.mediaId)}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    title="Click to remove"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {feedTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition ${
                  activeTab === tab.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {feedError ? <p className="mt-3 text-xs font-semibold text-red-600">{feedError}</p> : null}
        </section>

        {isLoadingFeed ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-[var(--shadow-card)] sm:p-5">
            Loading feed...
          </article>
        ) : null}

        {!isLoadingFeed && posts.length === 0 ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-[var(--shadow-card)] sm:p-5">
            No posts yet in this tab.
          </article>
        ) : null}

        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5"
          >
            <header className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {getAuthorInitials(post)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {post.author_first_name} {post.author_last_name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {getAuthorRole(post)} · {toRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>
              <button type="button" className="text-slate-400 transition hover:text-slate-600">
                ...
              </button>
            </header>

            <p className="text-sm leading-6 text-slate-700">{post.content || ''}</p>

            {getPrimaryMedia(post) ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <div className="relative h-44 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-800">
                  <button
                    type="button"
                    className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-700 shadow"
                    aria-label="Play pitch reel"
                  >
                    <PlayCircle className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-bold">Media Attachment</p>
                    <p className="text-xs text-blue-100">
                      {getPrimaryMedia(post)?.media_type || 'file'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <footer className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleReaction(post.id)}
                    className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition ${
                      post.viewer_reacted ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.reactions_count || 0}
                  </button>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                  {post.comments_count || 0}
                </span>
                <span>{post.shares_count || 0}</span>
              </div>
              <span>{post.media_count || 0} media</span>
            </footer>
          </article>
        ))}
      </div>

      <aside className="min-w-0 space-y-4 xl:self-start">
        <SidebarCard title="Trending Topics" actionLabel="See all >">
          <ul className="space-y-3">
            {trendingTopics.map((item) => (
              <li key={item.hashtag_id || item.normalized_tag}>
                <p className="text-sm font-bold text-blue-700">#{item.tag}</p>
                <p className="text-xs text-slate-500">{formatTopicCount(item.post_count)}</p>
              </li>
            ))}
            {trendingTopics.length === 0 ? (
              <li>
                <p className="text-xs text-slate-500">No trending topics yet.</p>
              </li>
            ) : null}
          </ul>
        </SidebarCard>

        <SidebarCard title="Who to Follow" actionLabel="View all >">
          <ul className="space-y-3">
            {whoToFollow.map((person) => (
              <li key={person.name} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                    {person.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{person.name}</p>
                    <p className="truncate text-xs text-slate-500">{person.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Follow
                </button>
              </li>
            ))}
          </ul>
        </SidebarCard>

        <SidebarCard title="Suggested Groups" actionLabel="View all >">
          <ul className="space-y-3">
            {suggestedGroups.map((group) => (
              <li key={group.name} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {group.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{group.name}</p>
                    <p className="truncate text-xs text-slate-500">{group.members}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </SidebarCard>
      </aside>
    </div>
  )
}

export default FeedPage