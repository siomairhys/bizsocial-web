import Card from '../common/Card'
import PlaceholderImage from '../common/PlaceholderImage'
import SectionHeader from '../common/SectionHeader'
import { DynamicIcon } from '../common/icons'

function LearningHub({ courses }) {
  const items = Array.isArray(courses) ? courses : []

  return (
    <Card>
      <SectionHeader title="Learning Hub" action="View All" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <p className="sm:col-span-2 xl:col-span-3 text-sm text-slate-500">Learning Hub is not connected to database yet.</p>
        ) : null}
        {items.map((course) => (
          <article key={course.title} className="rounded-xl border border-slate-200 p-2">
            <div className="relative">
              <PlaceholderImage label="Thumb" variant="thumbnail" className="h-20 w-full" />
              <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-slate-700">
                <DynamicIcon name="Play" className="h-3 w-3" aria-hidden="true" />
              </span>
            </div>
            <h4 className="mt-2 text-sm font-semibold text-slate-900">{course.title}</h4>
            <p className="text-xs text-slate-500">{course.description}</p>
            <p className="mt-1 text-xs font-semibold text-blue-700">{course.duration}</p>
          </article>
        ))}
      </div>
    </Card>
  )
}

export default LearningHub
