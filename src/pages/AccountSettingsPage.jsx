import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import Card from '../components/common/Card'
import { useAuth } from '../modules/auth/context/useAuth'
import { settingsRepository } from '../repositories/settingsRepository'

const fieldClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function Field({ id, label, children, helper }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  )
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-none rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

function PasswordInput({ id, value, onChange, autoComplete, visible, onToggle }) {
  return (
    <div className="relative">
      <input
        id={id}
        className={`${fieldClass} pr-12`}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  )
}

function AccountSettingsPage({ user }) {
  const { token } = useAuth()

  const defaultAccount = useMemo(
    () => ({
    email: user?.email || '',
    timezone: 'Eastern Time (ET)',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    }),
    [user]
  )

  const defaultNotifications = useMemo(
    () => ({
    emailDigest: true,
    pitchActivity: true,
    marketplaceMessages: true,
    eventReminders: false,
    }),
    []
  )

  const defaultPrivacy = useMemo(
    () => ({
    profileVisibility: 'members_only',
    showEmail: false,
    allowMessages: true,
    }),
    []
  )

  const [account, setAccount] = useState(defaultAccount)
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [privacy, setPrivacy] = useState(defaultPrivacy)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [initialAccount, setInitialAccount] = useState(defaultAccount)
  const [initialNotifications, setInitialNotifications] = useState(defaultNotifications)
  const [initialPrivacy, setInitialPrivacy] = useState(defaultPrivacy)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)


  useEffect(() => {
    let active = true

    async function loadSettings() {
      if (!token) {
        return
      }

      setIsLoading(true)
      setSaved(false)
      setError('')

      try {
        const [loadedAccount, loadedNotifications, loadedPrivacy] = await Promise.all([
          settingsRepository.getAccount(token, defaultAccount),
          settingsRepository.getNotifications(token, defaultNotifications),
          settingsRepository.getPrivacy(token, defaultPrivacy),
        ])

        if (!active) {
          return
        }

        setAccount(loadedAccount)
        setInitialAccount(loadedAccount)
        setNotifications(loadedNotifications)
        setInitialNotifications(loadedNotifications)
        setPrivacy(loadedPrivacy)
        setInitialPrivacy(loadedPrivacy)
      } catch (loadError) {
        if (!active) {
          return
        }

        const message =
          loadError instanceof Error ? loadError.message : 'Failed to load account settings.'
        setError(message)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      active = false
    }
  }, [token, defaultAccount, defaultNotifications, defaultPrivacy])

  function updateAccount(field, value) {
    setAccount((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function updateNotification(field, value) {
    setNotifications((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function updatePrivacy(field, value) {
    setPrivacy((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function updateSecurity(field, value) {
    setSecurity((current) => ({ ...current, [field]: value }))
    setPasswordSaved(false)
    setPasswordError('')
  }

  function togglePasswordVisibility(field) {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!token || isSaving || isLoading) {
      return
    }

    setSaved(false)
    setError('')
    setIsSaving(true)

    try {
      const [updatedAccount, updatedNotifications, updatedPrivacy] = await Promise.all([
        settingsRepository.updateAccount(token, account, initialAccount),
        settingsRepository.updateNotifications(token, notifications, initialNotifications),
        settingsRepository.updatePrivacy(token, privacy, initialPrivacy),
      ])

      setAccount(updatedAccount)
      setInitialAccount(updatedAccount)
      setNotifications(updatedNotifications)
      setInitialNotifications(updatedNotifications)
      setPrivacy(updatedPrivacy)
      setInitialPrivacy(updatedPrivacy)
      setSaved(true)
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to save account settings.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordChange() {
    if (!token || isChangingPassword) {
      return
    }

    setPasswordSaved(false)
    setPasswordError('')
    setIsChangingPassword(true)

    try {
      await settingsRepository.changePassword(token, security)
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setVisiblePasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      })
      setPasswordSaved(true)
    } catch (changeError) {
      const message =
        changeError instanceof Error ? changeError.message : 'Failed to change password.'
      setPasswordError(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Settings</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Account Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage sign-in details, notification preferences, privacy, and security controls for your BizSocials account.
            </p>
          </div>
          {saved ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" role="status">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Settings saved successfully.
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Account basics</h2>
              <p className="mt-1 text-sm text-slate-500">Control account identity and regional preferences.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="settings-email" label="Login email">
              <input
                id="settings-email"
                className={fieldClass}
                type="email"
                value={account.email}
                onChange={(event) => updateAccount('email', event.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field id="settings-language" label="Language">
              <select
                id="settings-language"
                className={fieldClass}
                value={account.language}
                onChange={(event) => updateAccount('language', event.target.value)}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </Field>
            <Field id="settings-timezone" label="Timezone">
              <select
                id="settings-timezone"
                className={fieldClass}
                value={account.timezone}
                onChange={(event) => updateAccount('timezone', event.target.value)}
              >
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
                <option>Pacific Time (PT)</option>
              </select>
            </Field>
            <Field id="settings-date-format" label="Date format">
              <select
                id="settings-date-format"
                className={fieldClass}
                value={account.dateFormat}
                onChange={(event) => updateAccount('dateFormat', event.target.value)}
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </Field>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Notifications</h2>
              <p className="mt-1 text-sm text-slate-500">Choose which updates should reach you.</p>
            </div>
          </div>
          <div className="space-y-3">
            <ToggleField
              label="Weekly email digest"
              description="Receive a summary of profile views, events, and business opportunities."
              checked={notifications.emailDigest}
              onChange={(value) => updateNotification('emailDigest', value)}
            />
            <ToggleField
              label="Pitch and profile activity"
              description="Notify me when members react to pitches, posts, and profile updates."
              checked={notifications.pitchActivity}
              onChange={(value) => updateNotification('pitchActivity', value)}
            />
            <ToggleField
              label="Marketplace messages"
              description="Alert me when someone contacts me about products or services."
              checked={notifications.marketplaceMessages}
              onChange={(value) => updateNotification('marketplaceMessages', value)}
            />
            <ToggleField
              label="Event reminders"
              description="Send reminders before saved events and networking sessions."
              checked={notifications.eventReminders}
              onChange={(value) => updateNotification('eventReminders', value)}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Privacy</h2>
              <p className="mt-1 text-sm text-slate-500">Manage discoverability and member contact controls.</p>
            </div>
          </div>
          <div className="space-y-4">
            <Field id="profile-visibility" label="Profile visibility">
              <select
                id="profile-visibility"
                className={fieldClass}
                value={privacy.profileVisibility}
                onChange={(event) => updatePrivacy('profileVisibility', event.target.value)}
              >
                <option value="public">Public</option>
                <option value="members_only">Members only</option>
                <option value="private">Private</option>
              </select>
            </Field>
            <ToggleField
              label="Show email on profile"
              description="Allow members to see your account email on your public profile."
              checked={privacy.showEmail}
              onChange={(value) => updatePrivacy('showEmail', value)}
            />
            <ToggleField
              label="Allow member messages"
              description="Let other BizSocials members send direct messages to this account."
              checked={privacy.allowMessages}
              onChange={(value) => updatePrivacy('allowMessages', value)}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Security</h2>
              <p className="mt-1 text-sm text-slate-500">Password fields are ready for backend connection.</p>
            </div>
          </div>
          <div className="grid gap-4">
            <Field id="current-password" label="Current password">
              <PasswordInput
                id="current-password"
                value={security.currentPassword}
                onChange={(event) => updateSecurity('currentPassword', event.target.value)}
                autoComplete="current-password"
                visible={visiblePasswords.currentPassword}
                onToggle={() => togglePasswordVisibility('currentPassword')}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="new-password" label="New password" helper="Use at least 8 characters.">
                <PasswordInput
                  id="new-password"
                  value={security.newPassword}
                  onChange={(event) => updateSecurity('newPassword', event.target.value)}
                  autoComplete="new-password"
                  visible={visiblePasswords.newPassword}
                  onToggle={() => togglePasswordVisibility('newPassword')}
                />
              </Field>
              <Field id="confirm-new-password" label="Confirm new password">
                <PasswordInput
                  id="confirm-new-password"
                  value={security.confirmPassword}
                  onChange={(event) => updateSecurity('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                  visible={visiblePasswords.confirmPassword}
                  onToggle={() => togglePasswordVisibility('confirmPassword')}
                />
              </Field>
            </div>
            {passwordSaved ? (
              <div
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
                role="status"
              >
                Password updated successfully.
              </div>
            ) : null}
            {passwordError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">
                {passwordError}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={isChangingPassword || isSaving || isLoading || !token}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              {isChangingPassword ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </Card>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-500">
          <Mail className="h-4 w-4 flex-none" aria-hidden="true" />
          Changes are saved to your account.
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setAccount(initialAccount)
              setNotifications(initialNotifications)
              setPrivacy(initialPrivacy)
              setSecurity({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              })
              setVisiblePasswords({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
              })
              setSaved(false)
              setError('')
              setPasswordError('')
              setPasswordSaved(false)
            }}
            disabled={isLoading || isSaving || isChangingPassword}
            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto"
          >
            Reset changes
          </button>
          <button
            type="submit"
            disabled={isLoading || isSaving || isChangingPassword || !token}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default AccountSettingsPage
