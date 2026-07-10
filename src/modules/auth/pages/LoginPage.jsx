import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import AuthTextField from '../components/AuthTextField'
import { useAuth } from '../context/useAuth'

const initialValues = {
  email: '',
  password: '',
}

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function LoginPage({ onAuthenticated }) {
  const { signIn, signInDefault } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningInDefault, setIsSigningInDefault] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await signIn({
        email: values.email.trim(),
        password: values.password,
      })
      onAuthenticated()
    } catch (error) {
      setFormError(error.message || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDefaultSignIn() {
    setErrors({})
    setFormError('')
    setIsSigningInDefault(true)

    try {
      await signInDefault()
      onAuthenticated()
    } catch (error) {
      setFormError(error.message || 'Unable to sign in to the default account.')
    } finally {
      setIsSigningInDefault(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Access your dashboard with your BizSocials account."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </div>
        ) : null}

        <AuthTextField
          id="login-email"
          label="Email address"
          icon={Mail}
          type="email"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="name@company.com"
        />

        <AuthTextField
          id="login-password"
          label="Password"
          icon={LockKeyhole}
          type="password"
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <button
          type="submit"
          disabled={isSubmitting || isSigningInDefault}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDefaultSignIn}
          disabled={isSubmitting || isSigningInDefault}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {isSigningInDefault ? 'Signing in default account...' : 'Sign in to the default account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to BizSocials?{' '}
        <a
          href="#/signup"
          className="font-semibold text-blue-600 transition hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Create an account
        </a>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
