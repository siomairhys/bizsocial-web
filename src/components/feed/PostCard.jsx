import { Eye, Link2, MessageCircle, MoreHorizontal, Pencil, Repeat2, ThumbsUp, Trash2 } from 'lucide-react'
import { MediaPreview } from './MediaViewer'

function relativeTime(value) {
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000))
  if (seconds < 60) return 'now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return new Date(value).toLocaleDateString()
}

function initials(post) {
  return `${post.author_first_name?.[0] || ''}${post.author_last_name?.[0] || ''}`.toUpperCase() || 'BS'
}

function PostMediaGrid({ post, onOpenMedia }) {
  const media = Array.isArray(post.media) ? post.media.filter(Boolean) : []
  if (!media.length) return null
  const visible = media.slice(0, 4)

  return (
    <div className={`mt-4 grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 ${visible.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
      {visible.map((item, index) => (
        <button
          key={item.attachment_id || item.media_id || index}
          type="button"
          onClick={() => onOpenMedia(media, index)}
          aria-label={`Open media ${index + 1} of ${media.length}`}
          className={`relative block min-h-44 overflow-hidden focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${visible.length === 1 ? 'max-h-[34rem]' : 'h-56 sm:h-72'}`}
        >
          <MediaPreview media={item} className="h-full w-full object-cover" />
          {index === 3 && media.length > 4 ? (
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-3xl font-bold text-white">+{media.length - 4}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}

export default function PostCard({
  post,
  currentUserId,
  onProfile,
  onView,
  onReact,
  onComments,
  onShare,
  onEdit,
  onDelete,
  onCopyLink,
  onOpenMedia,
  reactionPending = false,
}) {
  const isOwner = Number(post.author_user_id) === Number(currentUserId)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onProfile(post.author_user_id)} className="-m-1 flex min-h-11 min-w-0 items-center gap-3 rounded-xl p-1 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={`View ${post.author_first_name} ${post.author_last_name} profile`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {post.author_avatar_url ? <img src={post.author_avatar_url} alt="" className="h-full w-full object-cover" /> : initials(post)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-950">{post.author_first_name} {post.author_last_name}</span>
            <span className="block truncate text-xs text-slate-500">{post.author_title || post.author_business_name || 'BizSocials Member'} · {relativeTime(post.created_at)}</span>
          </span>
        </button>

        <details className="relative">
          <summary aria-label="Open post menu" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <button type="button" onClick={() => onView(post.id)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" />View post</button>
            <button type="button" onClick={() => onCopyLink(post.id)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Link2 className="h-4 w-4" />Copy link</button>
            {isOwner ? <button type="button" onClick={() => onEdit(post)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil className="h-4 w-4" />Edit post</button> : null}
            {isOwner ? <button type="button" onClick={() => onDelete(post.id)} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete post</button> : null}
          </div>
        </details>
      </header>

      <div className="mt-3 flex flex-wrap gap-2">
        {post.is_bizquest ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">BizQuest</span> : null}
        {post.visibility !== 'public' ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{post.visibility}</span> : null}
      </div>
      {post.content ? <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.content}</p> : null}
      <PostMediaGrid post={post} onOpenMedia={onOpenMedia} />

      <footer className="mt-4 grid grid-cols-3 border-t border-slate-100 pt-2 text-sm text-slate-600">
        <button type="button" disabled={reactionPending} aria-pressed={Boolean(post.viewer_reacted)} onClick={() => onReact(post.id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 ${post.viewer_reacted ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 hover:text-blue-700'}`}>
          <ThumbsUp className="h-4 w-4" aria-hidden="true" /> {post.reactions_count || 0}
        </button>
        <button type="button" onClick={() => onComments(post)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition hover:bg-slate-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> {post.comments_count || 0}
        </button>
        <button type="button" onClick={() => onShare(post)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-semibold transition hover:bg-slate-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">
          <Repeat2 className="h-4 w-4" aria-hidden="true" /> {post.shares_count || 0}
        </button>
      </footer>
    </article>
  )
}
