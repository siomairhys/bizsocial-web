function SectionHeader({ title, action }) {
  return (
    <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {action ? (
        <button
          type="button"
          className="inline-flex min-h-11 flex-none items-center text-xs font-semibold text-blue-700 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {action}
        </button>
      ) : null}
    </div>
  )
}

export default SectionHeader
