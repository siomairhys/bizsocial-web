import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function AuthTextField({
  id,
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const describedBy = error ? `${id}-error` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-xl border bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${
          error ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        {Icon ? <Icon className="mr-2 h-4 w-4 flex-none text-slate-400" aria-hidden="true" /> : null}
        <input
          id={id}
          type={inputType}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="ml-2 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default AuthTextField
