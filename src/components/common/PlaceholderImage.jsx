function PlaceholderImage({
  label = 'Image',
  variant = 'landscape',
  className = '',
  ariaLabel,
}) {
  const radiusMap = {
    square: 'rounded-xl',
    circle: 'rounded-full',
    landscape: 'rounded-xl',
    logo: 'rounded-lg',
    thumbnail: 'rounded-lg',
    hero: 'rounded-2xl',
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel || `${label} placeholder`}
      className={`relative overflow-hidden border border-dashed border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 ${radiusMap[variant]} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.20),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.7),transparent)]" />
      <span className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
    </div>
  )
}

export default PlaceholderImage
