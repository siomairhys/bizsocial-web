function StatusBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white ${className}`}
    >
      {children}
    </span>
  )
}

export default StatusBadge
