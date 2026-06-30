function Card({ className = '', children }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] ${className}`}>
      {children}
    </section>
  )
}

export default Card
