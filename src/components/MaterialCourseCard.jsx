import { ArrowRight, BookOpen, ExternalLink, FolderOpen } from 'lucide-react'
import { Badge } from './ui'

export default function MaterialCourseCard({ course, onSelect }) {
  const meta = [course.code, course.lecturer ? `Dosen: ${course.lecturer}` : null, course.class_name ? `Kelas ${course.class_name}` : null]
    .filter(Boolean)
    .join(' · ')

  const count = course.materials_count ?? (course.items?.length || 0)

  return (
    <button
      type="button"
      onClick={() => onSelect(course.key || course.id)}
      aria-label={`Buka materi mata kuliah ${course.name}`}
      className="group flex w-full flex-col gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40">
          <BookOpen className="h-5 w-5" />
        </span>
        {course.code ? <Badge variant="neutral">{course.code}</Badge> : null}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {course.name}
        </p>
        {meta ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{meta}</p> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={count > 0 ? 'info' : 'neutral'}>
            {count} materi
          </Badge>
          {course.manual_count > 0 && (
            <Badge variant="purple">{course.manual_count} materi dosen</Badge>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600" />
      </div>
    </button>
  )
}

