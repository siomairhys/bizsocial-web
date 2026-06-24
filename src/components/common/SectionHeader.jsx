function SectionHeader({ title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {action ? (
        <button
          type="button"
          className="text-xs font-semibold text-blue-700 transition hover:text-blue-600"
        >
          {action}
        </button>
      ) : null}
    </div>
  )
}

export default SectionHeader
