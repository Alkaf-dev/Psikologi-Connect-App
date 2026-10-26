import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Megaphone, UserRound } from 'lucide-react'
import { useApiData } from '../../hooks/useApiData'
import { formatDate } from '../../lib/utils'
import { Button, EmptyState, Skeleton } from '../../components/ui'

export default function AnnouncementDetailPage() {
  const { id } = useParams()
  const { data: announcement, loading, error } = useApiData(`/announcements/${id}`, undefined, {
    keepPrevious: false,
  })

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/pengumuman"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke pengumuman
      </Link>

      {loading ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-3/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : error || !announcement ? (
        <EmptyState
          className="mt-6"
          icon={Megaphone}
          title="Pengumuman tidak ditemukan"
          description="Pengumuman ini mungkin sudah tidak tersedia atau tautannya tidak valid."
          action={
            <Button as={Link} to="/pengumuman" variant="secondary">
              Lihat semua pengumuman
            </Button>
          }
        />
      ) : (
        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />
          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">Pengumuman</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(announcement.published_at, { time: true, long: true })}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {announcement.author_name || 'Admin'}
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {announcement.title}
            </h1>

            <div className="mt-6 whitespace-pre-line border-t border-slate-100 pt-6 text-base leading-8 text-slate-700">
              {announcement.body}
            </div>

            {announcement.course_name ? (
              <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Terkait mata kuliah <span className="font-semibold">{announcement.course_name}</span>
                {announcement.course_code ? ` (${announcement.course_code})` : ''}
              </p>
            ) : null}
          </div>
        </article>
      )}
    </section>
  )
}
