function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-2.5 w-full rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default ProgressBar
