import { useMemo, useState } from 'react'
import { CalendarDays, Megaphone, Search, UserRound } from 'lucide-react'
import { useApiData, useDebouncedValue } from '../../hooks/useApiData'
import { formatDate } from '../../lib/utils'
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  Skeleton,
} from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

function prodiLabel(value) {
  return Array.isArray(value) ? value.join(', ') : value
}

export default function StudentAnnouncements() {
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('')
  const [selected, setSelected] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data: courses } = useApiData('/student/courses', { per_page: 100 })
  const { data: announcements, loading, error } = useApiData('/student/announcements', {
    per_page: 100,
    search: debouncedSearch || undefined,
    course_id: courseId || undefined,
  })
  const items = announcements || []

  const courseOptions = useMemo(
    () => (courses || []).filter((course) => items.some((item) => item.course_id === course.id)),
    [courses, items],
  )

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Informasi"
        title="Pengumuman"
        description="Informasi penting seputar perkuliahan, tugas, dan layanan akademik untuk Prodi Anda."
      />

      <MascotGif mascot="menunjuk" variant="banner" className="psy-page-mascot" />

      <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari pengumuman..."
          className="sm:flex-1"
        />
        <Select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="sm:w-64">
          <option value="">Semua mata kuliah</option>
          {courseOptions.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} · {course.name}
            </option>
          ))}
        </Select>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Megaphone}
          title="Gagal memuat pengumuman"
          description="Periksa koneksi API atau coba muat ulang halaman ini."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={search ? 'Pengumuman tidak ditemukan' : 'Belum ada pengumuman'}
          description={
            search
              ? 'Coba kata kunci lain untuk menemukan pengumuman.'
              : 'Pengumuman untuk mahasiswa akan muncul di sini.'
          }
          action={
            search ? (
              <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                Bersihkan pencarian
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((announcement) => (
            <Card
              key={announcement.id}
              className="group cursor-pointer p-5 transition hover:border-teal-200 hover:shadow-md"
              onClick={() => setSelected(announcement)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Megaphone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="teal">{announcement.audience_label || 'Mahasiswa'}</Badge>
                      {announcement.course_code ? (
                        <Badge variant="info">{announcement.course_code}</Badge>
                      ) : null}
                      {announcement.prodi_names ? (
                        <span className="text-[11px] text-slate-400">{prodiLabel(announcement.prodi_names)}</span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-teal-700">
                      {announcement.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{announcement.body}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(announcement.published_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3 w-3" />
                        {announcement.author_name || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 text-teal-700">
                  Baca
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Detail Pengumuman'}
        description={
          selected
            ? `${formatDate(selected.published_at, { time: true })} · ${selected.author_name || 'Admin'}`
            : undefined
        }
        width="max-w-2xl"
      >
        {selected ? (
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="teal">{selected.audience_label || 'Mahasiswa'}</Badge>
              {selected.course_name ? <Badge variant="info">{selected.course_name}</Badge> : null}
              {selected.prodi_names ? <Badge variant="neutral">{prodiLabel(selected.prodi_names)}</Badge> : null}
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-700">{selected.body}</p>
            {selected.course_name ? (
              <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Terkait mata kuliah {selected.course_name}
                {selected.course_code ? ` (${selected.course_code})` : ''}
              </p>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
        <Search className="h-3 w-3" />
        Pengumuman ditampilkan sesuai Prodi Anda.
      </p>
    </div>
  )
}
