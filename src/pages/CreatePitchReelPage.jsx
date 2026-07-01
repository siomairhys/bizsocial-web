import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Upload, X } from 'lucide-react'

import { useAuth } from '../modules/auth/context/useAuth'
import { useMediaUpload } from '../modules/media/hooks/useMediaUpload'
import { mediaRepository } from '../repositories/mediaRepository'
import {
  PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER,
  PITCH_REELS_PUBLISH_ENDPOINT_PLACEHOLDER,
  pitchReelsRepository,
} from '../repositories/pitchReelsRepository'

function CreatePitchReelPage({ onNavigate }) {
  const { token } = useAuth()
  const mediaUpload = useMediaUpload(token)
  const primaryInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState([])
  const [visibility, setVisibility] = useState('public')
  const [isBizquest, setIsBizquest] = useState(false)
  const [primaryMedia, setPrimaryMedia] = useState(null)
  const [coverMedia, setCoverMedia] = useState(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDraft() {
      if (!token) {
        return
      }

      setIsLoadingDraft(true)
      try {
        const draft = await pitchReelsRepository.getDraft(token)
        if (!active || !draft) {
          return
        }

        setTitle(String(draft.title || ''))
        setCaption(String(draft.caption || ''))
        setCategory(String(draft.category || ''))
        setVisibility(String(draft.visibility || 'public'))
        setTags(Array.isArray(draft.tags) ? draft.tags : [])
        setIsBizquest(Boolean(draft.is_bizquest))

        const nextPrimaryId = Number(draft.primary_media_id || 0)
        const nextCoverId = Number(draft.cover_media_id || 0)

        if (nextPrimaryId > 0) {
          setPrimaryMedia((current) =>
            current?.mediaId === nextPrimaryId
              ? current
              : {
                  mediaId: nextPrimaryId,
                  name: `Media #${nextPrimaryId}`,
                  type: 'video/*',
                },
          )
        }

        if (nextCoverId > 0) {
          setCoverMedia((current) =>
            current?.mediaId === nextCoverId
              ? current
              : {
                  mediaId: nextCoverId,
                  name: `Media #${nextCoverId}`,
                  type: 'image/*',
                },
          )
        }
      } catch {
        if (!active) {
          return
        }
      } finally {
        if (active) {
          setIsLoadingDraft(false)
        }
      }
    }

    loadDraft()

    return () => {
      active = false
    }
  }, [token])

  const payload = useMemo(
    () => ({
      title,
      caption,
      category,
      visibility,
      primary_media_id: primaryMedia?.mediaId || null,
      cover_media_id: coverMedia?.mediaId || null,
      tags,
      is_bizquest: isBizquest,
    }),
    [caption, category, coverMedia?.mediaId, isBizquest, primaryMedia?.mediaId, tags, title, visibility],
  )

  function toUniqueTags(values) {
    const seen = new Set()
    const output = []

    values.forEach((value) => {
      const cleaned = String(value || '').replace(/^#+/, '').trim()
      if (!cleaned) {
        return
      }

      const key = cleaned.toLowerCase()
      if (seen.has(key)) {
        return
      }

      seen.add(key)
      output.push(cleaned)
    })

    return output
  }

  function addTagsFromInput() {
    const rawValues = tagsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (rawValues.length === 0) {
      return
    }

    setTags((current) => toUniqueTags([...current, ...rawValues]))
    setTagsInput('')
  }

  function removeTag(target) {
    setTags((current) => current.filter((tag) => tag.toLowerCase() !== target.toLowerCase()))
  }

  async function uploadPitchMedia(file, mediaKind) {
    const isPrimary = mediaKind === 'primary'

    if (!token) {
      setError('You must be signed in to upload files.')
      return
    }

    setError('')

    try {
      const result = await mediaUpload.upload(file)
      const item = {
        mediaId: Number(result.mediaId),
        name: file.name,
        type: file.type || (isPrimary ? 'video/*' : 'image/*'),
        downloadUrl: result.downloadUrl,
      }

      if (isPrimary) {
        setPrimaryMedia(item)
      } else {
        setCoverMedia(item)
      }
    } catch (uploadError) {
      setError(uploadError?.message || 'Failed to upload media.')
    }
  }

  async function handlePickPrimary(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    await uploadPitchMedia(file, 'primary')
  }

  async function handlePickCover(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    await uploadPitchMedia(file, 'cover')
  }

  async function removeSelectedMedia(mediaKind) {
    const isPrimary = mediaKind === 'primary'
    const current = isPrimary ? primaryMedia : coverMedia

    if (!current?.mediaId || !token) {
      if (isPrimary) {
        setPrimaryMedia(null)
      } else {
        setCoverMedia(null)
      }
      return
    }

    if (isPrimary) {
      setPrimaryMedia(null)
    } else {
      setCoverMedia(null)
    }

    try {
      await mediaRepository.remove(token, current.mediaId)
    } catch {
      // Keep editing flow uninterrupted if cleanup fails.
    }
  }

  async function handleSaveDraft() {
    if (!token) {
      setError('Your session is missing. Please sign in again.')
      return
    }

    setIsSavingDraft(true)
    setError('')

    try {
      const response = await pitchReelsRepository.saveDraft(token, payload)
      setNotice(response?.message || 'Draft saved.')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save draft right now.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handlePublish() {
    if (!title.trim()) {
      setError('Add a pitch title before publishing.')
      return
    }

    if (!token) {
      setError('Your session is missing. Please sign in again.')
      return
    }

    if (!payload.primary_media_id) {
      setError('Upload a pitch reel video before publishing.')
      return
    }

    setIsPublishing(true)
    setError('')

    try {
      await pitchReelsRepository.publish(token, payload)
      await pitchReelsRepository.deleteDraft(token).catch(() => {})
      setNotice('Pitch reel published.')
      onNavigate('/pitch-reels')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to publish pitch reel right now.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create Pitch Reel</h1>
          <p className="mt-1 text-sm text-slate-500">Record or upload a short, high-impact business pitch.</p>
        </div>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isPublishing ? 'Publishing...' : 'Publish Pitch Reel'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,68%)_minmax(0,32%)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Pitch Reel</h2>
            <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Draft
            </div>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Record or upload a pitch reel</label>
          <button
            type="button"
            onClick={() => primaryInputRef.current?.click()}
            disabled={mediaUpload.isUploading}
            className="grid h-24 w-full place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
          >
            <span className="text-center">
              <Play className="mx-auto h-7 w-7" aria-hidden="true" />
              <span className="mt-2 block text-sm font-semibold">
                {mediaUpload.isUploading ? `Uploading... ${mediaUpload.progress}%` : 'Record or upload a pitch reel'}
              </span>
            </span>
          </button>
          <input
            ref={primaryInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handlePickPrimary}
          />

          {primaryMedia ? (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <span className="truncate pr-2">Primary video: {primaryMedia.name} (#{primaryMedia.mediaId})</span>
              <button
                type="button"
                onClick={() => removeSelectedMedia('primary')}
                className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Remove primary media"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="pitch-title">
                Pitch title
              </label>
              <input
                id="pitch-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Select or enter details..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="pitch-caption">
                Caption
              </label>
              <input
                id="pitch-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Select or enter details..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="pitch-category">
                Pitch category
              </label>
              <input
                id="pitch-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Select or enter details..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="pitch-visibility">
                Visibility
              </label>
              <select
                id="pitch-visibility"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Upload cover image or preview</label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={mediaUpload.isUploading}
              className="grid h-24 w-full place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
            >
              <span className="text-center">
                <Upload className="mx-auto h-7 w-7" aria-hidden="true" />
                <span className="mt-2 block text-sm font-semibold">Upload cover image or preview</span>
                <span className="mt-0.5 block text-xs text-blue-600">Recommended 1600 x 600 px</span>
              </span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickCover}
            />

            {coverMedia ? (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <span className="truncate pr-2">Cover image: {coverMedia.name} (#{coverMedia.mediaId})</span>
                <button
                  type="button"
                  onClick={() => removeSelectedMedia('cover')}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Remove cover media"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 space-y-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="pitch-tags">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="pitch-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTagsFromInput()
                  }
                }}
                placeholder="Add tags separated by commas"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={addTagsFromInput}
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Add
              </button>
            </div>

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">BizQuest entry</p>
              <p className="text-xs text-slate-500">Mark this pitch reel as a BizQuest challenge submission.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isBizquest}
                onChange={(event) => setIsBizquest(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Enabled
            </label>
          </div>

          {isLoadingDraft ? <p className="mt-2 text-xs font-medium text-slate-500">Loading draft...</p> : null}

          {error ? <p className="mt-3 text-xs font-semibold text-red-600">{error}</p> : null}
          {notice ? <p className="mt-3 text-xs font-semibold text-emerald-600">{notice}</p> : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isPublishing ? 'Publishing...' : 'Publish Pitch Reel'}
            </button>
          </div>
        </section>

        <div className="space-y-4 xl:sticky xl:top-[86px] xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Before you publish</h3>
            <div className="mt-3 space-y-3">
              <div className="flex gap-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Open with the problem</p>
                  <p className="text-xs text-slate-500">A clear first line helps people know what to do next.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Explain your solution</p>
                  <p className="text-xs text-slate-500">Keep your value proposition focused and easy to remember.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Close with a clear ask</p>
                  <p className="text-xs text-slate-500">Tell viewers exactly what action you want from them.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Integration placeholders</h3>
            <div className="mt-3 space-y-2 text-xs font-medium text-blue-700">
              <p className="rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-2">
                Draft endpoint: {PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER}
              </p>
              <p className="rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-2">
                Publish endpoint: {PITCH_REELS_PUBLISH_ENDPOINT_PLACEHOLDER}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CreatePitchReelPage
