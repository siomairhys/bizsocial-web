import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Camera,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from 'lucide-react'
import Card from '../components/common/Card'
import { useAuth } from '../modules/auth/context/useAuth'
import { useMediaUpload } from '../modules/media/hooks/useMediaUpload'
import { profileRepository } from '../repositories/profileRepository'

function splitDisplayName(user) {
  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''

  if (firstName || lastName) {
    return { firstName, lastName }
  }

  const parts = (user?.name || user?.fullName || user?.full_name || '').trim().split(' ')
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function getInitialProfile(user) {
  const { firstName, lastName } = splitDisplayName(user)

  return {
    firstName,
    lastName,
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || 'Founder',
    businessName: user?.businessName || user?.business_name || 'BizSocials Account',
    industry: user?.industry || 'Professional Services',
    website: user?.website || '',
    location: user?.location || '',
    photoUrl: user?.avatar_url || user?.avatarUrl || user?.photoUrl || '',
    coverUrl: user?.cover_url || user?.coverUrl || '',
    bio:
      user?.bio ||
      'Tell members what you build, who you help, and what kind of opportunities you are looking for.',
  }
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function ProfileField({ id, label, icon: Icon, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" /> : null}
        {label}
      </span>
      {children}
    </label>
  )
}

function ProfilePage({ user }) {
  const { token } = useAuth()
  const mediaUpload = useMediaUpload(token)
  const defaultProfile = useMemo(() => getInitialProfile(user), [user])
  const [initialProfile, setInitialProfile] = useState(defaultProfile)
  const [profile, setProfile] = useState(defaultProfile)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const isUploadingPhoto = mediaUpload.isUploading
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const photoInputRef = useRef(null)


  useEffect(() => {
    let active = true

    async function loadProfile() {
      if (!token) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const loadedProfile = await profileRepository.getMyProfile(token, defaultProfile)
        if (!active) {
          return
        }

        setInitialProfile(loadedProfile)
        setProfile(loadedProfile)
        setPhotoError('')
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? loadError.message : 'Failed to load profile data.'
        setError(message)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [token, defaultProfile])

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function handlePhotoButtonClick() {
    if (isUploadingPhoto) {
      return
    }

    photoInputRef.current?.click()
  }

  async function handlePhotoSelected(event) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''

    if (!selectedFile) {
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be 5MB or smaller.')
      return
    }

    setPhotoError('')
    setError('')
    setSaved(false)
    mediaUpload.reset()

    try {
      const result = await mediaUpload.upload(selectedFile, {
        mediaType: 'image',
      })

      updateField('photoUrl', result.downloadUrl)
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Failed to upload profile photo.'
      setPhotoError(message)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!token || isSaving) {
      return
    }

    setSaved(false)
    setError('')
    setIsSaving(true)

    profileRepository
      .updateMyProfile(token, profile, initialProfile)
      .then((updatedProfile) => {
        setInitialProfile(updatedProfile)
        setProfile(updatedProfile)
        setSaved(true)
      })
      .catch((saveError) => {
        const message =
          saveError instanceof Error ? saveError.message : 'Failed to save profile.'
        setError(message)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[var(--shadow-card)]">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-5 py-6 text-white sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Profile</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 text-xl font-bold uppercase shadow-lg shadow-blue-950/20">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.firstName?.[0] || profile.email?.[0] || 'B') +
                  (profile.lastName?.[0] || '')
                )}
                <button
                  type="button"
                  onClick={handlePhotoButtonClick}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white text-blue-700 shadow-md transition hover:scale-105 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelected}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
                <p className="mt-1 text-sm text-blue-100">{profile.businessName}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                Profile readiness
              </p>
              <p className="mt-1 text-2xl font-bold">82%</p>
            </div>
          </div>
        </div>
      </section>

      {saved ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Profile updated successfully.
        </div>
      ) : null}

      {error ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {photoError ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {photoError}
        </div>
      ) : null}

      {mediaUpload.error && !photoError ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {mediaUpload.error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep your identity clear for members, founders, and potential partners.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField id="firstName" label="First name" icon={UserRound}>
                <input
                  id="firstName"
                  className={inputClass}
                  value={profile.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  autoComplete="given-name"
                />
              </ProfileField>
              <ProfileField id="lastName" label="Last name" icon={UserRound}>
                <input
                  id="lastName"
                  className={inputClass}
                  value={profile.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  autoComplete="family-name"
                />
              </ProfileField>
              <ProfileField id="email" label="Email address" icon={Mail}>
                <input
                  id="email"
                  className={inputClass}
                  type="email"
                  value={profile.email}
                  readOnly
                  autoComplete="email"
                />
              </ProfileField>
              <ProfileField id="phone" label="Phone number" icon={Phone}>
                <input
                  id="phone"
                  className={inputClass}
                  type="tel"
                  value={profile.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                />
              </ProfileField>
              <ProfileField id="title" label="Professional title" icon={UserRound}>
                <input
                  id="title"
                  className={inputClass}
                  value={profile.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Founder, CEO, Creative Director"
                />
              </ProfileField>
              <ProfileField id="location" label="Location" icon={MapPin}>
                <input
                  id="location"
                  className={inputClass}
                  value={profile.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  placeholder="Atlanta, GA"
                  autoComplete="address-level2"
                />
              </ProfileField>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">Business details</h2>
              <p className="mt-1 text-sm text-slate-500">
                This information powers discovery, referrals, marketplace visibility, and funding readiness.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField id="businessName" label="Business name" icon={Building2}>
                <input
                  id="businessName"
                  className={inputClass}
                  value={profile.businessName}
                  onChange={(event) => updateField('businessName', event.target.value)}
                  autoComplete="organization"
                />
              </ProfileField>
              <ProfileField id="industry" label="Industry" icon={Building2}>
                <select
                  id="industry"
                  className={inputClass}
                  value={profile.industry}
                  onChange={(event) => updateField('industry', event.target.value)}
                >
                  <option>Professional Services</option>
                  <option>Retail</option>
                  <option>Technology</option>
                  <option>Food & Beverage</option>
                  <option>Health & Wellness</option>
                  <option>Media & Creative</option>
                </select>
              </ProfileField>
              <ProfileField id="website" label="Website" icon={Globe}>
                <input
                  id="website"
                  className={inputClass}
                  type="url"
                  value={profile.website}
                  onChange={(event) => updateField('website', event.target.value)}
                  placeholder="https://yourbusiness.com"
                  autoComplete="url"
                />
              </ProfileField>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Public bio</h2>
            <p className="mt-1 text-sm text-slate-500">Give members a fast read on your business and goals.</p>
            <textarea
              id="bio"
              className="mt-4 min-h-36 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={profile.bio}
              onChange={(event) => updateField('bio', event.target.value)}
            />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Profile checklist</h2>
            <div className="mt-4 space-y-3 text-sm">
              {['Personal info completed', 'Business details added', 'Public bio drafted'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => {
            setProfile(initialProfile)
            setSaved(false)
            setError('')
            setPhotoError('')
          }}
          disabled={isLoading || isSaving || isUploadingPhoto}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99]"
        >
          Reset changes
        </button>
        <button
          type="submit"
          disabled={isLoading || isSaving || isUploadingPhoto || !token}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isUploadingPhoto ? 'Uploading photo...' : isSaving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}

export default ProfilePage
