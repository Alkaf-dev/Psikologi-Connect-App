import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Inbox,
  Megaphone,
  Plus,
  Users,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate, formatDateTime, getGreeting } from '../../lib/utils'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
  StatCard,
} from '../../components/ui'
import { MascotGreeting } from '../../components/PsychologyMascot'

const statusLabels = {
  submitted: 'Dikumpulkan',
  late: 'Terlambat',
  graded: 'Dinilai',
}

const statusVariants = {
  submitted: 'info',
  late: 'warning',
  graded: 'success',
}

const quickActions = [
  { label: 'Mata Kuliah', description: 'Kelola kelas dan prodi', to: '/admin/mata-kuliah', icon: BookOpen, tone: 'bg-sky-50 text-sky-600' },
  { label: 'Jadwal', description: 'Atur perkuliahan', to: '/admin/jadwal', icon: CalendarDays, tone: 'bg-amber-50 text-amber-600' },
  { label: 'Kelompok', description: 'Susun anggota kelas', to: '/admin/kelompok', icon: UsersRound, tone: 'bg-violet-50 text-violet-600' },
  { label: 'Tugas Baru', description: 'Publikasikan tugas', to: '/admin/tugas', icon: ClipboardList, tone: 'bg-teal-50 text-teal-600' },
  { label: 'Pengumuman', description: 'Bagikan informasi', to: '/admin/pengumuman', icon: Megaphone, tone: 'bg-rose-50 text-rose-600' },
  { label: 'Mahasiswa', description: 'Kelola akun mahasiswa', to: '/admin/mahasiswa', icon: GraduationCap, tone: 'bg-emerald-50 text-emerald-600' },
]

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useApiData('/staff/dashboard')

  const counts = data?.counts || {}
  const announcements = data?.latest_announcements || []
  const activeTasks = data?.active_tasks || []
  const submissions = data?.latest_submissions || []
  const pending = loading && !data

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 px-6 py-7 text-white shadow-lg shadow-teal-900/10 sm:px-8">
        <div className="hero-dots absolute inset-0 opacity-20" />
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
              Panel Admin · {formatDate(new Date(), { long: true })}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/90">
              Ringkasan akademik Program Studi Psikologi hari ini. Pantau tugas aktif, pengumpulan, dan pengumuman terbaru dari satu tempat.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="white" size="sm" onClick={() => navigate('/admin/tugas')}>
                <Plus className="h-4 w-4" />
                Buat tugas
              </Button>
              <Button variant="outline-white" size="sm" onClick={() => navigate('/admin/pengumuman')}>
                <Megaphone className="h-4 w-4" />
                Tulis pengumuman
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-[120px] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-wider text-teal-100">Mahasiswa</p>
              <p className="mt-1 text-2xl font-bold">{pending ? '…' : counts.students ?? 0}</p>
            </div>
            <div className="min-w-[120px] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-wider text-teal-100">Tugas aktif</p>
              <p className="mt-1 text-2xl font-bold">{pending ? '…' : counts.active_tasks ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <MascotGreeting context="admin-dashboard" name={user?.name?.split(' ')[0]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mahasiswa"
          value={pending ? '…' : counts.students ?? 0}
          hint={pending ? 'Memuat data...' : `${counts.staff ?? 0} akun admin aktif`}
          icon={Users}
          tone="teal"
          onClick={() => navigate('/admin/mahasiswa')}
        />
        <StatCard
          label="Mata Kuliah"
          value={pending ? '…' : counts.courses ?? 0}
          hint={pending ? 'Memuat data...' : `${counts.schedules ?? 0} jadwal perkuliahan`}
          icon={BookOpen}
          tone="sky"
          onClick={() => navigate('/admin/mata-kuliah')}
        />
        <StatCard
          label="Tugas Aktif"
          value={pending ? '…' : counts.active_tasks ?? 0}
          hint={pending ? 'Memuat data...' : `Dari ${counts.tasks ?? 0} tugas keseluruhan`}
          icon={ClipboardList}
          tone="amber"
          onClick={() => navigate('/admin/tugas')}
        />
        <StatCard
          label="Pengumpulan"
          value={pending ? '…' : counts.submissions ?? 0}
          hint={pending ? 'Memuat data...' : `${counts.groups ?? 0} kelompok mahasiswa`}
          icon={Inbox}
          tone="violet"
          onClick={() => navigate('/admin/pengumpulan')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Aksi Cepat"
            description="Pintasan operasional panel program studi."
            icon={CheckCircle2}
          />
          <div className="grid gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-teal-200 hover:bg-teal-50/30"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.tone}`}>
                  <action.icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-800 group-hover:text-teal-800">
                    {action.label}
                  </span>
                  <span className="block truncate text-[10px] text-slate-500">{action.description}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-teal-500" />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Pengumuman Terbaru"
            icon={Megaphone}
            action={
              <Link to="/admin/pengumuman" className="text-[11px] font-semibold text-teal-600 hover:text-teal-800">
                Lihat semua
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 px-5">
            {announcements.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Belum ada pengumuman.</p>
            ) : (
              announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  to="/admin/pengumuman"
                  className="block py-3.5 transition hover:opacity-80"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">
                      {announcement.title}
                    </p>
                    <Badge variant={announcement.audience === 'all' ? 'teal' : 'info'}>
                      {announcement.audience === 'all'
                        ? 'Publik'
                        : announcement.audience === 'mahasiswa'
                          ? 'Mahasiswa'
                          : 'Admin'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatDate(announcement.published_at, { time: true })}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Tugas Aktif Terdekat"
            description="Diurutkan berdasarkan tenggat waktu."
            icon={ClipboardList}
            action={
              <Link to="/admin/tugas" className="text-[11px] font-semibold text-teal-600 hover:text-teal-800">
                Kelola tugas
              </Link>
            }
          />
          {pending ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : !activeTasks || activeTasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Tidak ada tugas aktif"
              description="Tugas yang dipublikasikan akan muncul di sini."
              className="m-4 border-0 bg-transparent py-10"
            />
          ) : (
            <div className="divide-y divide-slate-100 px-5">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={task.type === 'kelompok' ? 'purple' : 'info'}>{task.type_label}</Badge>
                      <Badge variant={task.is_overdue ? 'danger' : 'neutral'}>
                        {task.is_overdue ? 'Lewat deadline' : task.status_label}
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {task.course_code} · {task.course_name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDateTime(task.deadline)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Inbox className="h-3 w-3" />
                        {task.submission_count ?? 0} pengumpulan
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/admin/tugas"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-teal-700"
                    aria-label="Kelola tugas"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Pengumpulan Terbaru"
            description="Aktivitas terakhir dari mahasiswa."
            icon={Inbox}
            action={
              <Link to="/admin/pengumpulan" className="text-[11px] font-semibold text-teal-600 hover:text-teal-800">
                Lihat semua
              </Link>
            }
          />
          {pending ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Belum ada pengumpulan"
              description="Pengumpulan tugas mahasiswa akan tampil di sini."
              className="m-4 border-0 bg-transparent py-10"
            />
          ) : (
            <div className="divide-y divide-slate-100 px-5">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-start gap-3 py-3.5">
                  <Avatar name={submission.student_name} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {submission.student_name}
                      {submission.student_npm ? (
                        <span className="ml-1 text-[10px] font-normal text-slate-400">({submission.student_npm})</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{submission.task_title}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {submission.task_type === 'kelompok' ? `${submission.group_name} · ` : ''}
                      {formatDateTime(submission.submitted_at)}
                    </p>
                  </div>
                  <Badge variant={statusVariants[submission.status] || 'neutral'}>
                    {statusLabels[submission.status] || submission.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
