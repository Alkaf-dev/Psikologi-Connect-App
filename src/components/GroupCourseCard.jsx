import { ArrowRight, BookOpen } from 'lucide-react'
import { Badge } from './ui'
import { courseMeta } from '../lib/groupHelpers'

export default function GroupCourseCard({ card, onSelect }) {
  const meta = courseMeta(card)

  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      aria-label={`Buka kelompok ${card.name}`}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-900/[0.02] transition duration-150 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <BookOpen className="h-5 w-5" />
        </span>
        {card.code ? <Badge variant="neutral">{card.code}</Badge> : null}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold leading-5 text-slate-900">{card.name}</p>
        {meta ? <p className="mt-1 text-xs leading-5 text-slate-500">{meta}</p> : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="info">{card.groups_count} kelompok</Badge>
          <Badge variant="neutral">{card.members_count} anggota</Badge>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
      </div>
    </button>
  )
}
