import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DoorOpen,
  Megaphone,
  Plus,
  UsersRound,
  Video,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate, formatDayDate, formatDateTime, getGreeting, statusTone } from '../../lib/utils'
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
import TaskDetailDrawer from '../../components/TaskDetailDrawer'
import { MascotGif, MascotGreeting } from '../../components/PsychologyMascot'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data: dashboard, loading, refresh } = useApiData('/student/dashboard', undefined, {
    keepPrevious: false,
  })
  const [selectedTask, setSelectedTask] = useState(null)

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-44 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const student = dashboard?.student || user
  const counts = dashboard?.counts || {}
  const upcomingTasks = dashboard?.upcoming_tasks || []
  const schedules = dashboard?.today_schedules || []
  const groups = dashboard?.groups || []
  const announcements = dashboard?.latest_announcements || []

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-6 text-white shadow-lg shadow-teal-900/10 sm:p-8">
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-teal-100/90">{formatDayDate(new Date())}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {getGreeting()}, {student?.name?.split(' ')[0] || 'Mahasiswa'}!
            </h1>
            <p className="mt-2 text-sm leading-6 text-teal-50/85">
              {counts.pending_tasks > 0
                ? `Ada ${counts.pending_tasks} tugas yang belum dikumpulkan. Yuk, selesaikan sebelum deadline!`
                : 'Semua tugas sudah terkumpul. Tetap semangat menjalani perkuliahan!'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button as={Link} to="/portal/tugas" variant="white" size="sm">
                <ClipboardList className="h-4 w-4" />
                Lihat tugas
              </Button>
              <Button as={Link} to="/portal/jadwal" variant="outline-white" size="sm">
                <CalendarDays className="h-4 w-4" />
                Jadwal kuliah
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100">NIM</p>
              <p className="mt-1 text-sm font-bold">{student?.npm || '-'}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100">Kelas</p>
              <p className="mt-1 text-sm font-bold">{student?.class_name || '-'}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100">Prodi</p>
              <p className="mt-1 text-sm font-bold">{student?.prodi_name || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <MascotGreeting context="portal-dashboard" name={student?.name?.split(' ')[0]} />

      {counts.pending_tasks > 3 ? (
        <MascotGif mascot="minum" variant="note" />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tugas belum dikumpulkan"
          value={counts.pending_tasks ?? 0}
          hint={counts.overdue_tasks ? `${counts.overdue_tasks} lewat deadline` : 'Semua masih on track'}
          icon={ClipboardList}
          tone={counts.overdue_tasks ? 'rose' : 'amber'}
          href="/portal/tugas"
        />
        <StatCard
          label="Tugas aktif"
          value={counts.active_tasks ?? 0}
          hint={`${counts.submitted_tasks ?? 0} sudah dikumpulkan`}
          icon={CheckCircle2}
          tone="emerald"
          href="/portal/tugas"
        />
        <StatCard
          label="Kelompok saya"
          value={counts.groups ?? 0}
          hint={`${counts.courses ?? 0} mata kuliah diikuti`}
          icon={UsersRound}
          tone="violet"
          href="/portal/kelompok"
        />
        <StatCard
          label="Jadwal hari ini"
          value={counts.today_schedules ?? 0}
          hint="Lihat jadwal lengkap minggu ini"
          icon={CalendarRange}
          tone="sky"
          href="/portal/jadwal"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Tugas Mendatang"
            description="Tugas aktif yang perlu Anda perhatikan"
            icon={ClipboardList}
            action={
              <Link to="/portal/tugas" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Semua tugas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 px-5">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTask(task)}
                  className="group flex w-full items-start justify-between gap-3 py-3.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-teal-700">
                      {task.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{task.course_name}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock3 className="h-3 w-3" />
                      {task.deadline_label || formatDateTime(task.deadline)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.submission_status
                        ? task.is_overdue
                          ? 'danger'
                          : 'warning'
                        : task.is_overdue
                          ? 'danger'
                          : 'teal'
                    }
                  >
                    {task.submission_status ? 'Sudah' : 'Belum'}
                  </Badge>
                </button>
              ))
            ) : (
              <div className="flex items-center gap-3 py-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Tidak ada tugas menunggu</p>
                  <p className="text-xs text-slate-500">Kerja bagus! Semua tugas sudah dikumpulkan.</p>
                </div>
              </div>
            )}
          </div>
          <div className="px-5 pb-4 pt-1">
            <Button as={Link} to="/portal/tugas" variant="soft" size="sm" className="w-full">
              Lihat materi dan tugas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Jadwal Hari Ini"
            description={
              schedules.length
                ? `${schedules.length} sesi kuliah dijadwalkan hari ini`
                : 'Tidak ada kuliah hari ini'
            }
            icon={CalendarDays}
            action={
              <Link to="/portal/jadwal" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Jadwal lengkap
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 px-5">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-start gap-3 py-3.5">
                  <div className="w-[72px] shrink-0 rounded-xl bg-slate-50 px-2 py-2 text-center ring-1 ring-slate-200">
                    <p className="text-xs font-bold text-slate-800">{schedule.start_time}</p>
                    <p className="text-[10px] text-slate-400">{schedule.end_time}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{schedule.course_name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{schedule.course_lecturer}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400">
                      {schedule.mode === 'online' ? <Video className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}
                      {schedule.location_label}
                      {schedule.mode === 'online' && schedule.meeting_link ? (
                        <a
                          href={schedule.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 font-semibold text-teal-700 hover:text-teal-800"
                        >
                          Gabung
                        </a>
                      ) : null}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8">
                <EmptyState
                  className="border-0 bg-transparent py-4"
                  icon={CalendarDays}
                  title="Kosong hari ini"
                  description="Tidak ada jadwal kuliah untuk Prodi dan kelas Anda hari ini."
                />
              </div>
            )}
          </div>
          <div className="px-5 pb-4 pt-1">
            <Button as={Link} to="/portal/jadwal" variant="soft" size="sm" className="w-full">
              Lihat jadwal lengkap
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            title="Kelompok Saya"
            description="Kolaborasi kelompok pada mata kuliah Anda"
            icon={UsersRound}
            action={
              <Link to="/portal/kelompok" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Selengkapnya
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 px-5">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{group.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {group.course_code} · {group.course_name}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Ketua: {group.leader_name || '-'} · {group.members_count} anggota
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {(group.members || []).slice(0, 3).map((member) => (
                      <Avatar key={member.id} name={member.name} className="h-7 w-7 border-2 border-white text-[9px]" />
                    ))}
                    {group.members_count > 3 ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500">
                        +{group.members_count - 3}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">Belum tergabung dalam kelompok.</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Pengumuman Terbaru"
            description="Informasi dari program studi"
            icon={Megaphone}
            action={
              <Link to="/portal/pengumuman" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                Semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-slate-100 px-5">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="py-3.5">
                  <p className="text-sm font-semibold text-slate-800">{announcement.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(announcement.published_at)}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{announcement.body}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">Belum ada pengumuman.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/portal/tugas', icon: ClipboardList, title: 'Kumpulkan tugas', desc: 'Tautan dan catatan tugas' },
          { to: '/portal/kelompok', icon: UsersRound, title: 'Cek kelompok', desc: 'Anggota dan ketua kelompok' },
          { to: '/portal/notifikasi', icon: Plus, title: 'Notifikasi', desc: 'Tugas aktif dan jadwal terdekat' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-800 group-hover:text-teal-700">{item.title}</span>
              <span className="block text-[11px] text-slate-500">{item.desc}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500" />
          </Link>
        ))}
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onSubmitted={refresh}
      />
    </div>
  )
}
