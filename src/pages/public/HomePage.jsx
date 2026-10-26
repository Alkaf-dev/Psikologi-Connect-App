import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Mail,
  Megaphone,
  Phone,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useApiData } from '../../hooks/useApiData'
import { DEFAULT_SETTINGS } from '../../lib/brand'
import { Button, Card, EmptyState, Skeleton } from '../../components/ui'
import { AnnouncementCard } from '../../components/AnnouncementCard'

const features = [
  {
    icon: CalendarDays,
    title: 'Jadwal Kuliah',
    description: 'Lihat jadwal kelas, ruangan, atau tautan online, dan dosen pengampu tanpa perlu membuka banyak file.',
    tone: 'bg-teal-50 text-teal-600',
  },
  {
    icon: ClipboardCheck,
    title: 'Tugas & Nilai',
    description: 'Kumpulkan tugas melalui tautan, pantau status pengumpulan, dan lihat feedback dosen.',
    tone: 'bg-sky-50 text-sky-600',
  },
  {
    icon: UsersRound,
    title: 'Kelompok',
    description: 'Ketahui anggota kelompok, ketua, dan tugas kelompok untuk setiap mata kuliah.',
    tone: 'bg-amber-50 text-amber-600',
  },
]

export default function HomePage() {
  const { data: settingsResponse, loading: settingsLoading } = useApiData('/settings', undefined, {
    keepPrevious: false,
  })
  const { data: announcements, loading: announcementsLoading } = useApiData('/announcements', { per_page: 3 })

  const settings = { ...DEFAULT_SETTINGS, ...(settingsResponse || {}) }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Portal Akademik Mahasiswa
            </span>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {settings.public_tagline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-teal-50/90 sm:text-lg">
              {settings.public_about}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/login" variant="white" size="lg">
                Masuk Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/pengumuman" variant="outline-white" size="lg">
                Lihat Pengumuman
              </Button>
            </div>
            <p className="mt-5 max-w-lg text-xs leading-5 text-teal-100/80">{settings.portal_note}</p>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 hidden h-24 w-24 rounded-3xl border border-white/15 bg-white/5 lg:block" />
            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-100">
                  <GraduationCap className="h-4 w-4" />
                  Tahun Akademik
                </div>
                <div className="mt-3 text-2xl font-bold">{settingsLoading ? '...' : settings.academic_year}</div>
                <div className="mt-1 text-sm text-teal-100">Semester {settings.semester}</div>
                <div className="mt-5 h-px bg-white/15" />
                <div className="mt-4 flex items-center gap-2 text-xs text-teal-50">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Portal aktif untuk mahasiswa
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/95 p-5 text-slate-800 shadow-xl shadow-teal-950/20 sm:translate-y-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Program Studi
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900">{settings.program_name}</div>
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-teal-700">
                    <Mail className="h-3.5 w-3.5 text-teal-600" />
                    <span className="truncate">{settings.contact_email}</span>
                  </a>
                  {settings.contact_phone ? (
                    <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 hover:text-teal-700">
                      <Phone className="h-3.5 w-3.5 text-teal-600" />
                      {settings.contact_phone}
                    </a>
                  ) : null}
                </div>
                <div className="mt-5 flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((letter, index) => (
                    <span
                      key={letter}
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white',
                        ['bg-teal-500', 'bg-sky-500', 'bg-amber-500', 'bg-violet-500'][index],
                      ].join(' ')}
                    >
                      {letter}
                    </span>
                  ))}
                  <span className="flex h-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 px-2 text-[10px] font-semibold text-slate-500">
                    +{settings.academic_year?.startsWith('2026') ? '4' : '100'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <BookOpenCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">Satu portal untuk kebutuhan akademik</div>
                      <div className="mt-0.5 text-xs text-teal-100">
                        Jadwal, tugas, kelompok, dan pengumuman dalam satu tempat.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-teal-50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Terintegrasi API
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-9 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Fitur Portal</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Yang bisa dilakukan di Psikologi Connect
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Dirancang agar mahasiswa lebih mudah mengikuti ritme perkuliahan dan kolaborasi kelompok.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.tone}`}>
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Informasi</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Pengumuman Terbaru</h2>
              <p className="mt-2 text-sm text-slate-600">Informasi penting dari program studi.</p>
            </div>
            <Link to="/pengumuman" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800">
              Semua pengumuman
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {announcementsLoading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-56" />
              ))}
            </div>
          ) : announcements?.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              icon={Megaphone}
              title="Belum ada pengumuman"
              description="Pengumuman yang diterbitkan program studi akan muncul di sini."
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center text-white sm:px-10">
          <div className="hero-dots absolute inset-0 opacity-10" />
          <div className="relative">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <GraduationCap className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">Siap masuk ke portal?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Gunakan email atau NIM yang terdaftar. Jika belum bisa masuk, hubungi admin program studi.
            </p>
            <Button as={Link} to="/login" size="lg" className="mt-6 bg-teal-400 text-slate-900 hover:bg-teal-300">
              Masuk Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
