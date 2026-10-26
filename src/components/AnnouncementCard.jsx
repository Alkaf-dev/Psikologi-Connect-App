import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, UserRound } from 'lucide-react'
import { formatDate, truncate } from '../lib/utils'

export function AnnouncementCard({ announcement, linkTo }) {
  const href = linkTo || `/pengumuman/${announcement.id}`

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">Pengumuman</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(announcement.published_at)}
          </span>
          {announcement.audience_label ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{announcement.audience_label}</span>
          ) : null}
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 transition group-hover:text-teal-700">
          <Link to={href}>{announcement.title}</Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{truncate(announcement.body, 170)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <UserRound className="h-3 w-3 shrink-0" />
          <span className="truncate">{announcement.author_name || 'Admin'}</span>
        </span>
        <Link to={href} className="inline-flex shrink-0 items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
          Baca selengkapnya
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  )
}
