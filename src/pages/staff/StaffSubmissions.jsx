import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExternalLink, Inbox } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge, Button } from '../../components/ui'
import { formatDateTime, toDateTimeInput } from '../../lib/utils'
import {
  loadAllTasks,
  loadCourseOptions,
  loadGroupsWithMembers,
  loadStudentOptions,
} from '../../lib/staffLookups'

const statusOptions = [
  { value: 'submitted', label: 'Dikumpulkan' },
  { value: 'late', label: 'Terlambat' },
  { value: 'graded', label: 'Dinilai' },
]

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

export default function StaffSubmissions() {
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get('task_id') || ''
  const defaultParams = useMemo(() => (taskId ? { task_id: taskId } : {}), [taskId])

  return (
    <CrudPage
      eyebrow="Akademik"
      title="Pengumpulan Tugas"
      description="Pantau dan nilai pengumpulan tugas mahasiswa, termasuk perwakilan pengumpulan kelompok."
      listPath="/staff/submissions"
      defaultParams={defaultParams}
      searchPlaceholder="Cari tugas, mahasiswa, NIM, atau kelompok..."
      createLabel="Tambah pengumpulan"
      emptyIcon={Inbox}
      emptyTitle="Belum ada pengumpulan"
      emptyDescription="Pengumpulan dari portal mahasiswa akan muncul di sini."
      mascot="menunjuk"
      initialValues={{
        task_id: taskId,
        group_id: '',
        user_id: '',
        status: 'submitted',
        link: '',
        submitted_at: toDateTimeInput(new Date()),
        notes: '',
        feedback: '',
        grade: '',
      }}
      loadFilterLookups={async () => ({ courses: await loadCourseOptions() })}
      loadLookups={async () => {
        const [tasks, groups, students] = await Promise.all([
          loadAllTasks(),
          loadGroupsWithMembers(),
          loadStudentOptions(),
        ])
        return { tasks, groups, students }
      }}
      fields={[
        {
          name: 'task_id',
          label: 'Tugas',
          type: 'select',
          required: true,
          colSpan: 2,
          placeholder: 'Pilih tugas',
          options: (values, lookups) =>
            (lookups.tasks || []).map((task) => ({
              value: task.id,
              label: `${task.title} · ${task.course_code || ''}`,
            })),
        },
        {
          name: 'group_id',
          label: 'Kelompok',
          type: 'select',
          colSpan: 2,
          placeholder: 'Pilih kelompok',
          visible: (values, lookups) =>
            (lookups.tasks || []).some(
              (task) => task.id === values.task_id && task.type === 'kelompok',
            ),
          required: (values, lookups) =>
            (lookups.tasks || []).some(
              (task) => task.id === values.task_id && task.type === 'kelompok',
            ),
          options: (values, lookups) => {
            const selectedTask = (lookups.tasks || []).find((task) => task.id === values.task_id)
            return (lookups.groups || [])
              .filter((group) => (selectedTask?.group_ids || []).includes(group.id))
              .map((group) => ({
                value: group.id,
                label: `${group.name} · ${group.member_names || `${group.members_count || 0} anggota`}`,
              }))
          },
        },
        {
          name: 'user_id',
          label: 'Mahasiswa / perwakilan',
          type: 'select',
          required: true,
          colSpan: 2,
          placeholder: 'Pilih mahasiswa',
          options: (values, lookups) => {
            const selectedTask = (lookups.tasks || []).find((task) => task.id === values.task_id)
            if (selectedTask?.type === 'kelompok') {
              const group = (lookups.groups || []).find((item) => item.id === values.group_id)
              return (group?.members || []).map((member) => ({
                value: member.user_id,
                label: `${member.name}${member.npm ? ` · ${member.npm}` : ''} · ${member.role || 'anggota'}`,
              }))
            }
            return lookups.students || []
          },
        },
        { name: 'status', label: 'Status', type: 'select', required: true, options: statusOptions },
        {
          name: 'grade',
          label: 'Nilai',
          type: 'number',
          min: 0,
          max: 100,
          step: 0.01,
          visible: (values) => values.status === 'graded',
          required: (values) => values.status === 'graded',
        },
        {
          name: 'link',
          label: 'Tautan pengumpulan',
          type: 'url',
          required: true,
          colSpan: 2,
          placeholder: 'https://...',
        },
        { name: 'submitted_at', label: 'Waktu pengumpulan', type: 'datetime-local', colSpan: 2 },
        {
          name: 'notes',
          label: 'Catatan mahasiswa',
          type: 'textarea',
          rows: 3,
          colSpan: 2,
          placeholder: 'Catatan dari mahasiswa...',
        },
        {
          name: 'feedback',
          label: 'Umpan balik',
          type: 'textarea',
          rows: 3,
          colSpan: 2,
          placeholder: 'Umpan balik untuk mahasiswa...',
        },
      ]}
      filters={[
        {
          key: 'course_id',
          label: 'Mata kuliah',
          type: 'chips',
          placeholder: 'Semua mata kuliah',
          options: (values, lookups) => lookups.courses || [],
        },
      ]}
      columns={[
        {
          key: 'task_meeting_number',
          label: 'Pertemuan',
          className: 'text-center',
          render: (submission) => (
            <span className="text-xs font-semibold text-slate-700">
              {submission.task_meeting_number || '-'}
            </span>
          ),
        },
        {
          key: 'task_type',
          label: 'Jenis Tugas',
          className: 'text-center',
          render: (submission) => (
            <Badge
              variant={submission.task_type === 'kelompok' ? 'purple' : 'info'}
              className="w-20 justify-center text-center"
            >
              {submission.task_type === 'kelompok' ? 'Kelompok' : 'Individu'}
            </Badge>
          ),
        },
        {
          key: 'student_name',
          label: 'Mahasiswa / Kelompok',
          render: (submission) => {
            const isGroup = submission.task_type === 'kelompok'
            const name = isGroup ? submission.group_name || '-' : submission.student_name
            const detail = isGroup
              ? `Perwakilan: ${submission.student_name}${submission.student_npm ? ` · ${submission.student_npm}` : ''}`
              : submission.student_npm || '-'

            return (
              <div className="min-w-[190px]">
                <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
                <p className="truncate text-[10px] text-slate-400">{detail}</p>
              </div>
            )
          },
        },
        {
          key: 'task_title',
          label: 'Tugas',
          render: (submission) => (
            <div className="max-w-[280px]">
              <p className="truncate text-xs font-semibold text-slate-700">{submission.task_title}</p>
            </div>
          ),
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (submission) => (
            <Badge
              variant={statusVariants[submission.status] || 'neutral'}
              className="w-24 justify-center text-center"
            >
              {statusLabels[submission.status] || submission.status}
            </Badge>
          ),
        },
        {
          key: 'submitted_at',
          label: 'Dikumpulkan',
          className: 'text-center',
          render: (submission) => (
            <span className="text-xs text-slate-500">{formatDateTime(submission.submitted_at)}</span>
          ),
        },
      ]}
      mapItemToForm={(submission) => ({
        ...submission,
        task_id: submission.task_id || '',
        group_id: submission.group_id || '',
        user_id: submission.user_id || '',
        status: submission.status || 'submitted',
        link: submission.link || '',
        submitted_at: toDateTimeInput(submission.submitted_at),
        notes: submission.notes || '',
        feedback: submission.feedback || '',
        grade: submission.grade ?? '',
      })}
      mapFormToPayload={(payload, { lookups }) => {
        const selectedTask = (lookups.tasks || []).find((task) => task.id === payload.task_id)
        const isGroup = selectedTask?.type === 'kelompok'

        return {
          ...payload,
          group_id: isGroup ? payload.group_id || null : null,
          grade: payload.status === 'graded' ? payload.grade : null,
        }
      }}
      extraActions={(submission) => (
        <Button
          as="a"
          href={submission.link}
          target="_blank"
          rel="noreferrer"
          variant="ghost"
          size="icon-sm"
          title="Buka tautan pengumpulan"
          aria-label="Buka tautan pengumpulan"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      )}
      deleteTitle="Hapus pengumpulan?"
      deleteMessage="Data pengumpulan dan nilai terkait akan dihapus permanen."
      formDescription="Untuk tugas kelompok, pilih kelompok lalu perwakilan yang mengumpulkan. Nilai wajib diisi saat status dinilai."
      formSize="lg"
      centerHeaders
      centerActions
      gridLines
    />
  )
}
