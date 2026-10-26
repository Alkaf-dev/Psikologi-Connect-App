import { useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  ExternalLink,
  UsersRound,
} from 'lucide-react'
import { useApiData, useDebouncedValue } from '../../hooks/useApiData'
import { formatDateTime, statusTone } from '../../lib/utils'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChip,
  PageHeader,
  SearchInput,
  Skeleton,
} from '../../components/ui'
import TaskDetailDrawer from '../../components/TaskDetailDrawer'
import { MascotGif, MascotLauncher } from '../../components/PsychologyMascot'

export default function StudentTasks() {
  const [search, setSearch] = useState('')
  const [courseId, setCourseId] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const { data: courses } = useApiData(
    '/student/courses',
    { per_page: 500, sort: 'name', direction: 'asc' },
    { allPages: true },
  )

  const { data: tasks, meta, loading, refresh } = useApiData('/student/tasks', {
    per_page: 100,
    search: debouncedSearch || undefined,
    course_id: courseId || undefined,
    sort: 'deadline',
    direction: 'asc',
  })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Materi dan Tugas"
        description="Pantau tugas individu dan kelompok, buka materi perkuliahan, lalu kumpulkan tautan tugas Anda."
      />

      <MascotGif mascot="membaca" variant="banner" className="psy-page-mascot" />

      <Card className="space-y-3 p-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari judul, mata kuliah, atau instruksi..."
        />

        {courses?.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Mata kuliah
            </span>
            <FilterChip active={!courseId} onClick={() => setCourseId('')}>
              Semua mata kuliah
            </FilterChip>
            {courses.map((course) => (
              <FilterChip
                key={course.id}
                active={String(courseId) === String(course.id)}
                onClick={() => setCourseId(String(course.id))}
              >
                {[course.code, course.name].filter(Boolean).join(' · ')}
              </FilterChip>
            ))}
          </div>
        ) : null}
      </Card>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-48" />
          ))}
        </div>
      ) : !tasks?.length ? (
        <EmptyState
          icon={ClipboardList}
          title={search || courseId ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas'}
          description={
            search || courseId
              ? 'Coba ubah kata kunci atau filter untuk menemukan tugas lainnya.'
              : 'Tugas yang dipublikasikan dosen akan muncul di sini.'
          }
          action={
            search || courseId ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setCourseId('')
                }}
              >
                Reset filter
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(tasks || []).map((task) => (
            <Card
              key={task.id}
              className="group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${
                  task.is_overdue ? 'bg-rose-400' : task.submission ? 'bg-emerald-400' : 'bg-teal-400'
                }`}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={task.type === 'kelompok' ? 'purple' : 'info'}>{task.type_label}</Badge>
                  <Badge variant={statusTone(task.status)}>{task.status_label}</Badge>
                  <Badge
                    variant={
                      task.submission
                        ? task.submission.status === 'graded'
                          ? 'success'
                          : 'warning'
                        : task.is_overdue
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {task.submission_label}
                  </Badge>
                </div>
                {task.is_overdue ? <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" /> : null}
              </div>

              <button type="button" onClick={() => setSelectedTask(task)} className="mt-3 block w-full text-left">
                <h2 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
                  {task.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {task.course_code} · {task.course_name}
                </p>
                {task.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{task.description}</p>
                ) : null}
              </button>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                  {task.deadline_label || formatDateTime(task.deadline)}
                </span>
                {task.type === 'kelompok' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UsersRound className="h-3.5 w-3.5 text-slate-400" />
                    {task.portal_group_name || task.group_name || '-'}
                  </span>
                ) : null}
                {task.meeting_number ? <span>Pertemuan {task.meeting_number}</span> : null}
                {task.submission?.grade !== '' &&
                task.submission?.grade !== null &&
                task.submission?.grade !== undefined ? (
                  <span className="font-semibold text-emerald-700">Nilai {task.submission.grade}</span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
                <div className="flex flex-wrap gap-2">
                  <Button variant="soft" size="sm" onClick={() => setSelectedTask(task)}>
                    Detail tugas
                  </Button>
                  {task.material_url ? (
                    <Button
                      as="a"
                      href={task.material_url}
                      target="_blank"
                      rel="noreferrer"
                      variant="ghost"
                      size="sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Materi
                    </Button>
                  ) : null}
                </div>
                <span className="text-[11px] text-slate-400">{task.can_submit ? 'Perlu dikumpulkan' : ''}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {meta?.total ? (
        <p className="text-center text-xs text-slate-400">
          Menampilkan {tasks?.length || 0} dari {meta.total} tugas
        </p>
      ) : null}

      <TaskDetailDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onSubmitted={refresh}
      />

      <div className="psy-mascot-launcher-spacer" aria-hidden="true" />
      <MascotLauncher context="portal-tasks" />
    </div>
  )
}
