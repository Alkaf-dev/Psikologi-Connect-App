import { Link } from 'react-router-dom'
import { ClipboardList, ExternalLink, Inbox } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge, Button } from '../../components/ui'
import { formatDateTime, toDateTimeInput } from '../../lib/utils'
import { loadCourseOptions, loadGroupsWithMembers } from '../../lib/staffLookups'
import { MascotLauncher } from '../../components/PsychologyMascot'

const typeOptions = [
  { value: 'individu', label: 'Individu' },
  { value: 'kelompok', label: 'Kelompok' },
]

const statusOptions = [
  { value: 'draft', label: 'Draf' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
]

function futureDateTime(days, hour = 23, minute = 59) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return toDateTimeInput(date)
}

const initialValues = {
  course_id: '',
  type: 'individu',
  status: 'active',
  meeting_number: '',
  title: '',
  description: '',
  material_url: '',
  collection_link: '',
  group_ids: [],
  start_at: toDateTimeInput(new Date()),
  deadline: futureDateTime(7),
  deadline_note: '',
}

export default function StaffTasks() {
  return (
    <>
      <CrudPage
      eyebrow="Akademik"
      title="Materi dan Tugas"
      description="Publikasikan materi, tugas individu atau kelompok, tenggat waktu, dan tautan pengumpulan."
      listPath="/staff/tasks"
      searchPlaceholder="Cari judul, instruksi, mata kuliah, jenis, atau status..."
      createLabel="Tambah tugas"
      emptyIcon={ClipboardList}
      emptyTitle="Belum ada tugas"
      emptyDescription="Buat tugas pertama dan tentukan tenggat waktunya untuk mahasiswa."
      mascot="membaca"
      initialValues={initialValues}
      loadFilterLookups={async () => ({ courses: await loadCourseOptions() })}
      loadLookups={async () => ({ groups: await loadGroupsWithMembers() })}
      fields={[
        {
          name: 'course_id',
          label: 'Mata kuliah',
          type: 'select',
          required: true,
          colSpan: 2,
          placeholder: 'Pilih mata kuliah',
          options: (values, lookups) => lookups.courses || [],
        },
        { name: 'type', label: 'Jenis tugas', type: 'select', required: true, options: typeOptions },
        { name: 'status', label: 'Status', type: 'select', required: true, options: statusOptions },
        { name: 'meeting_number', label: 'Pertemuan ke-', type: 'number', min: 1, max: 99 },
        {
          name: 'title',
          label: 'Judul tugas',
          type: 'text',
          required: true,
          colSpan: 2,
        },
        {
          name: 'group_ids',
          label: 'Kelompok yang ditugaskan',
          type: 'multiselect',
          colSpan: 2,
          visible: (values) => values.type === 'kelompok',
          options: (values, lookups) =>
            (lookups.groups || [])
              .filter((group) => group.course_id === values.course_id)
              .map((group) => ({
                value: group.id,
                label: `${group.name}${group.leader_name ? ` · ${group.leader_name}` : ''}`,
              })),
          emptyLabel: 'Pilih mata kuliah terlebih dahulu, lalu muat kelompok.',
          help: 'Wajib dipilih minimal satu untuk tugas kelompok.',
        },
        { name: 'start_at', label: 'Mulai tersedia', type: 'datetime-local' },
        { name: 'deadline', label: 'Tenggat waktu', type: 'datetime-local', required: true },
        {
          name: 'material_url',
          label: 'Tautan materi',
          type: 'url',
          placeholder: 'https://...',
          colSpan: 2,
        },
        {
          name: 'collection_link',
          label: 'Tautan pengumpulan',
          type: 'url',
          placeholder: 'https://...',
          colSpan: 2,
          help: 'Tautan eksternal tambahan. Mahasiswa tetap dapat mengumpulkan melalui portal.',
        },
        {
          name: 'description',
          label: 'Instruksi tugas',
          type: 'textarea',
          rows: 6,
          colSpan: 2,
          placeholder: 'Tulis instruksi, kriteria penilaian, dan ketentuan tugas...',
        },
        {
          name: 'deadline_note',
          label: 'Catatan tenggat',
          type: 'text',
          colSpan: 2,
          placeholder: 'mis. Kumpulkan sebelum perkuliahan dimulai',
          maxLength: 150,
        },
      ]}
      filters={[
        {
          key: 'course_id',
          label: 'Mata kuliah',
          type: 'chips',
          placeholder: 'Semua mata kuliah',
          chipClassName: 'w-40 sm:w-44 text-center justify-center',
          options: (values, lookups) => lookups.courses || [],
        },
      ]}
      columns={[
        {
          key: 'meeting_number',
          label: 'Pertemuan',
          className: 'text-center',
          render: (task) => (
            <span className="text-xs font-semibold text-slate-700">
              {task.meeting_number || '-'}
            </span>
          ),
        },
        {
          key: 'title',
          label: 'Tugas',
          render: (task) => (
            <div className="max-w-[300px]">
              <p className="text-sm font-semibold text-slate-800">{task.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {task.course_code} · {task.course_name}
              </p>
            </div>
          ),
        },
        {
          key: 'material_url',
          label: 'Materi',
          className: 'text-center',
          render: (task) =>
            task.material_url ? (
              <a
                href={task.material_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-800"
              >
                Buka
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-400">-</span>
            ),
        },
        {
          key: 'type',
          label: 'Jenis',
          className: 'text-center',
          render: (task) => (
            <Badge variant={task.type === 'kelompok' ? 'purple' : 'info'}>{task.type_label}</Badge>
          ),
        },
        {
          key: 'start_at',
          label: 'Mulai',
          className: 'text-center',
          render: (task) => (
            <span className="whitespace-nowrap text-xs text-slate-600">
              {formatDateTime(task.start_at)}
            </span>
          ),
        },
        {
          key: 'deadline',
          label: 'Deadline',
          className: 'text-center',
          render: (task) => (
            <div>
              <p className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(task.deadline)}</p>
              <p className={`mt-0.5 text-[10px] ${task.is_overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                {task.is_overdue ? 'Lewat tenggat' : task.deadline_note || 'Sesuai jadwal'}
              </p>
            </div>
          ),
        },
        {
          key: 'submission_count',
          label: 'Pengumpulan',
          className: 'text-center',
          render: (task) => (
            <div>
              <p className="text-sm font-semibold text-slate-800">{task.submission_count ?? 0}</p>
              <p className="text-[10px] text-slate-400">pengumpulan</p>
            </div>
          ),
        },
        {
          key: 'status',
          label: 'Status',
          className: 'text-center',
          render: (task) => (
            <Badge variant={task.status === 'active' ? 'success' : task.status === 'completed' ? 'info' : 'neutral'}>
              {task.status_label}
            </Badge>
          ),
        },
      ]}
      mapItemToForm={(task) => ({
        ...task,
        course_id: task.course_id || '',
        start_at: toDateTimeInput(task.start_at),
        deadline: toDateTimeInput(task.deadline),
        group_ids: task.group_ids || [],
        meeting_number: task.meeting_number || '',
        material_url: task.material_url || '',
        collection_link: task.collection_link || '',
        deadline_note: task.deadline_note || '',
        description: task.description || '',
      })}
      mapFormToPayload={(payload, { lookups }) => {
        const allowedGroups = (lookups.groups || [])
          .filter(
            (group) =>
              group.course_id === payload.course_id &&
              (payload.group_ids || []).includes(group.id),
          )
          .map((group) => group.id)

        return {
          ...payload,
          group_ids: payload.type === 'kelompok' ? allowedGroups : [],
          meeting_number: payload.meeting_number || null,
        }
      }}
      extraActions={(task) => (
        <Button
          as={Link}
          to={`/admin/pengumpulan?task_id=${task.id}`}
          variant="ghost"
          size="icon-sm"
          title="Lihat pengumpulan"
          aria-label="Lihat pengumpulan tugas"
        >
          <Inbox className="h-3.5 w-3.5" />
        </Button>
      )}
      deleteTitle="Hapus tugas?"
      deleteMessage="Tugas dan referensinya akan dihapus. Data pengumpulan yang sudah masuk sebaiknya diperiksa terlebih dahulu."
      formSize="lg"
      centerHeaders
      gridLines
      />
      <div className="psy-mascot-launcher-spacer" aria-hidden="true" />
      <MascotLauncher context="admin-tasks" />
    </>
  )
}
