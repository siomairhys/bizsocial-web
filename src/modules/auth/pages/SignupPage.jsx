import { useState } from 'react'
import { ArrowRight, Building2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import AuthTextField from '../components/AuthTextField'
import { useAuth } from '../context/useAuth'

const initialValues = {
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

function validate(values) {
  const errors = {}

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.'
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }

  if (!values.businessName.trim()) {
    errors.businessName = 'Business name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Accept the terms to continue.'
  }

  return errors
}

function SignupPage({ onAuthenticated }) {
  const { signUp } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await signUp({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        businessName: values.businessName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      onAuthenticated()
    } catch (error) {
      setFormError(error.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join BizSocials"
      subtitle="Set up your account to enter the dashboard."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="signup-first-name"
            label="First name"
            icon={UserRound}
            value={values.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="Alex"
          />

          <AuthTextField
            id="signup-last-name"
            label="Last name"
            icon={UserRound}
            value={values.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Morgan"
          />
        </div>

        <AuthTextField
          id="signup-business"
          label="Business name"
          icon={Building2}
          value={values.businessName}
          onChange={(event) => updateField('businessName', event.target.value)}
          error={errors.businessName}
          autoComplete="organization"
          placeholder="Morgan Creative Co."
        />

        <AuthTextField
          id="signup-email"
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
          id="signup-password"
          label="Password"
          icon={LockKeyhole}
          type="password"
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Create a password"
        />

        <AuthTextField
          id="signup-confirm-password"
          label="Confirm password"
          icon={LockKeyhole}
          type="password"
          value={values.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Confirm your password"
        />

        <div>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={values.acceptedTerms}
              onChange={(event) => updateField('acceptedTerms', event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-describedby={errors.acceptedTerms ? 'terms-error' : undefined}
            />
            <span>I agree to the terms and privacy policy.</span>
          </label>
          {errors.acceptedTerms ? (
            <p id="terms-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.acceptedTerms}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <a
          href="#/login"
          className="font-semibold text-blue-600 transition hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Sign in
        </a>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
