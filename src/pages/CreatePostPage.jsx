import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Hash, ImagePlus, PlayCircle, UserRound, X } from 'lucide-react'

import { useAuth } from '../modules/auth/context/useAuth'
import { useMediaUpload } from '../modules/media/hooks/useMediaUpload'
import { feedRepository } from '../repositories/feedRepository'
import { mediaRepository } from '../repositories/mediaRepository'

const AUTO_SAVE_DELAY_MS = 900

function getDisplayName(user) {
  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName || user?.name || user?.email || 'BizSocials Member'
}

function getBusinessName(user) {
  return user?.businessName || user?.business_name || 'BizSocials Account'
}

function formatSavedTime(timestamp, isLoadingDraft) {
  if (isLoadingDraft) {
    return 'Loading draft...'
  }

  if (!timestamp) {
    return 'Draft not saved yet'
  }

  const value = new Date(timestamp)
  return `Saved ${value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

function toUniqueList(values, marker = '') {
  const seen = new Set()
  const output = []

  values.forEach((value) => {
    let normalized = String(value || '').trim()
    while (marker && normalized.startsWith(marker)) {
      normalized = normalized.slice(1)
    }

    normalized = normalized.trim()
    if (!normalized) {
      return
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    output.push(normalized)
  })

  return output
}

function CreatePostPage({ onNavigate }) {
  const { token, user } = useAuth()
  const mediaUpload = useMediaUpload(token)
  const fileInputRef = useRef(null)
  const composerRef = useRef(null)
  const autoSaveTimeoutRef = useRef(null)
  const draftHydratedRef = useRef(false)

  const [postText, setPostText] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [topics, setTopics] = useState([])
  const [mentions, setMentions] = useState([])
  const [topicInput, setTopicInput] = useState('')
  const [mentionInput, setMentionInput] = useState('')
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [formError, setFormError] = useState('')

  const displayName = useMemo(() => getDisplayName(user), [user])
  const businessName = useMemo(() => getBusinessName(user), [user])

  const hasContent = Boolean(postText.trim())
  const hasDraftData = hasContent || topics.length > 0 || mentions.length > 0 || attachedFiles.length > 0

  useEffect(() => {
    let active = true

    async function loadDraft() {
      if (!token) {
        return
      }

      setIsLoadingDraft(true)

      try {
        const draft = await feedRepository.getMyDraft(token)
        if (!active || !draft) {
          return
        }

        setPostText(String(draft.content || ''))
        setVisibility(String(draft.visibility || 'public'))
        setTopics(Array.isArray(draft.topics) ? toUniqueList(draft.topics, '#') : [])
        setMentions(Array.isArray(draft.mentions) ? toUniqueList(draft.mentions, '@') : [])
        setDraftSavedAt(draft.updated_at ? new Date(draft.updated_at).getTime() : null)
      } catch {
        if (!active) {
          return
        }
      } finally {
        if (active) {
          setIsLoadingDraft(false)
          draftHydratedRef.current = true
        }
      }
    }

    loadDraft()

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    function onShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        handlePublish()
      }
    }

    document.addEventListener('keydown', onShortcut)
    return () => {
      document.removeEventListener('keydown', onShortcut)
    }
  })

  useEffect(() => {
    if (!token || isLoadingDraft || !draftHydratedRef.current) {
      return
    }

    if (!hasDraftData) {
      return
    }

    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      setIsSavingDraft(true)
      try {
        const saved = await feedRepository.saveMyDraft(token, {
          content: postText,
          visibility,
          is_bizquest: false,
          topics,
          mentions,
        })

        setDraftSavedAt(saved?.updated_at ? new Date(saved.updated_at).getTime() : Date.now())
      } catch {
        // Keep editing flow uninterrupted if autosave fails.
      } finally {
        setIsSavingDraft(false)
      }
    }, AUTO_SAVE_DELAY_MS)

    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [token, isLoadingDraft, hasDraftData, postText, visibility, topics, mentions])

  function handleAttachmentClick() {
    if (mediaUpload.isUploading) {
      return
    }

    fileInputRef.current?.click()
  }

  async function handleFileSelected(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (files.length === 0) {
      return
    }

    if (!token) {
      setFormError('You must be signed in to attach files.')
      return
    }

    setFormError('')

    const uploaded = []
    for (const file of files) {
      try {
        const result = await mediaUpload.upload(file)
        uploaded.push({
          id: `${result.mediaId}-${file.name}-${file.lastModified}`,
          name: file.name,
          type: file.type || 'file',
          size: file.size,
          mediaId: Number(result.mediaId),
          mediaType: result.mediaType,
          downloadUrl: result.downloadUrl,
        })
      } catch (error) {
        setFormError(error?.message || 'Failed to upload one or more files.')
        break
      }
    }

    if (uploaded.length === 0) {
      return
    }

    setAttachedFiles((current) => {
      const ids = toUniqueList([...current.map((item) => item.id), ...uploaded.map((item) => item.id)])
      return ids
        .map((id) => current.find((item) => item.id === id) || uploaded.find((item) => item.id === id))
        .filter(Boolean)
    })
  }

  async function handleRemoveFile(fileId) {
    const target = attachedFiles.find((item) => item.id === fileId)

    setAttachedFiles((current) => current.filter((item) => item.id !== fileId))

    if (!target?.mediaId || !token) {
      return
    }

    try {
      await mediaRepository.remove(token, target.mediaId)
    } catch {
      // Keep UI responsive even if cleanup fails.
    }
  }

  function addTopic() {
    const cleaned = topicInput.replace(/^#+/, '').trim()
    if (!cleaned) {
      return
    }

    setTopics((current) => toUniqueList([...current, cleaned], '#'))
    setTopicInput('')
  }

  function removeTopic(value) {
    setTopics((current) => current.filter((item) => item.toLowerCase() !== value.toLowerCase()))
  }

  function addMention() {
    const cleaned = mentionInput.replace(/^@+/, '').trim()
    if (!cleaned) {
      return
    }

    setMentions((current) => toUniqueList([...current, cleaned], '@'))
    setMentionInput('')
  }

  function removeMention(value) {
    setMentions((current) => current.filter((item) => item.toLowerCase() !== value.toLowerCase()))
  }

  async function persistDraftNow() {
    if (!hasDraftData) {
      setFormError('Add content, a topic, or a mention before saving a draft.')
      composerRef.current?.focus()
      return
    }

    if (!token) {
      setFormError('Your session is missing. Please sign in again.')
      return
    }

    setIsSavingDraft(true)
    try {
      const saved = await feedRepository.saveMyDraft(token, {
        content: postText,
        visibility,
        is_bizquest: false,
        topics,
        mentions,
      })

      setDraftSavedAt(saved?.updated_at ? new Date(saved.updated_at).getTime() : Date.now())
      setFormError('')
    } catch (error) {
      setFormError(error?.message || 'Unable to save draft right now.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handlePublish() {
    const content = postText.trim()

    if (!content) {
      setFormError('Write something before publishing.')
      composerRef.current?.focus()
      return
    }

    if (!token) {
      setFormError('Your session is missing. Please sign in again.')
      return
    }

    setIsPublishing(true)
    setFormError('')

    try {
      await feedRepository.createPost(token, {
        content,
        visibility,
        is_bizquest: false,
        media_ids: attachedFiles
          .map((item) => Number(item.mediaId || 0))
          .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0),
        topics,
        mentions,
      })

      await feedRepository.deleteMyDraft(token).catch(() => {})

      setPostText('')
      setAttachedFiles([])
      setTopics([])
      setMentions([])
      setDraftSavedAt(null)
      onNavigate('/feed')
    } catch (error) {
      setFormError(error?.message || 'Unable to publish post right now.')
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleCancel() {
    if (hasDraftData) {
      const shouldDiscard = window.confirm('Discard your current draft?')
      if (!shouldDiscard) {
        return
      }

      if (token) {
        await feedRepository.deleteMyDraft(token).catch(() => {})
      }
    }

    onNavigate('/feed')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create Post</h1>
          <p className="mt-1 text-sm text-slate-500">
            Share your progress, insight, or business opportunity with the community.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,68%)_minmax(0,32%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Start a new post</h2>
            <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {visibility === 'public' ? 'Public' : visibility === 'followers' ? 'Followers' : 'Private'}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {displayName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{businessName}</p>
            </div>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="create-post-text">
            Post text
          </label>
          <textarea
            ref={composerRef}
            id="create-post-text"
            value={postText}
            onChange={(event) => setPostText(event.target.value)}
            rows={6}
            placeholder="Share a business win, question, update, or idea with the BizSocials community..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="create-post-visibility">
                Visibility
              </label>
              <select
                id="create-post-visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Draft status</p>
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
                {isSavingDraft ? 'Saving draft...' : formatSavedTime(draftSavedAt, isLoadingDraft)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={mediaUpload.isUploading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              {mediaUpload.isUploading ? `Uploading... ${mediaUpload.progress}%` : 'Add photo/video'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/pitch-reels')}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Create Pitch Reel
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelected}
          />

          {attachedFiles.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  {file.name}
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          {mediaUpload.error ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{mediaUpload.error}</p>
          ) : null}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="post-topic-input">
                Add topic
              </label>
              <div className="flex gap-2">
                <input
                  id="post-topic-input"
                  value={topicInput}
                  onChange={(event) => setTopicInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addTopic()
                    }
                  }}
                  placeholder="e.g. FundingReady"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={addTopic}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              {topics.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      #{topic}
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="post-mention-input">
                Add mention
              </label>
              <div className="flex gap-2">
                <input
                  id="post-mention-input"
                  value={mentionInput}
                  onChange={(event) => setMentionInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addMention()
                    }
                  }}
                  placeholder="e.g. BizSocials"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={addMention}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              {mentions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentions.map((mention) => (
                    <button
                      key={mention}
                      type="button"
                      onClick={() => removeMention(mention)}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      @{mention}
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {formError ? <p className="mt-3 text-xs font-semibold text-red-600">{formError}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
            <p className="text-xs text-slate-500">Tip: Press Ctrl/Cmd + Enter to publish.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={persistDraftNow}
                disabled={isSavingDraft || isLoadingDraft}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || mediaUpload.isUploading}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isPublishing ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-4 xl:sticky xl:top-[86px] xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Post for impact</h3>

            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">Tip: Add your business goal</p>
                <p className="mt-1 text-xs text-slate-500">
                  Posts with a specific call to action receive more helpful responses and higher visibility in the Feed.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">Suggested hashtags</p>
                <p className="mt-1 text-xs text-slate-500">#BuildInPublic #FundingReady #BizSocials</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">Best posting windows</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Weekdays between 9 AM and 1 PM
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CreatePostPage
