import { CalendarDays, ExternalLink } from 'lucide-react'
import CrudPage from '../../components/CrudPage'
import { Badge } from '../../components/ui'
import { DAYS } from '../../lib/utils'
import { courseLabel, loadCourseOptions } from '../../lib/staffLookups'
import { CLASS_OPTIONS } from '../../lib/classOptions'

function timeLabel(value) {
  return (value || '').slice(0, 5) || '-'
}

const dayOptions = DAYS.map((day) => ({ value: day, label: day }))

const modeOptions = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
]

const platformOptions = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
]

export default function StaffSchedule() {
  return (
    <CrudPage
      eyebrow="Akademik"
      title="Jadwal Perkuliahan"
      description="Atur jadwal tatap muka dan kelas daring untuk setiap mata kuliah dan kelas mahasiswa."
      listPath="/staff/schedules"
      searchPlaceholder="Cari mata kuliah, hari, ruangan, atau kelas..."
      createLabel="Tambah jadwal"
      emptyIcon={CalendarDays}
      emptyTitle="Belum ada jadwal"
      emptyDescription="Tambahkan jadwal perkuliahan agar muncul di portal mahasiswa."
      mascot="berjalan"
      initialValues={{
        course_id: '',
        day: 'Senin',
        start_time: '08:00',
        end_time: '09:40',
        mode: 'offline',
        room: '',
        platform: 'zoom',
        meeting_link: '',
        class_name: 'Psikologi A',
      }}
      loadLookups={async () => ({ courses: await loadCourseOptions() })}
      deferLookups
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
        { name: 'day', label: 'Hari', type: 'select', required: true, options: dayOptions },
        {
          name: 'class_name',
          label: 'Kelas',
          type: 'multiselect',
          outputString: true,
          required: true,
          colSpan: 2,
          options: CLASS_OPTIONS,
          help: 'Centang kelas atau program studi untuk jadwal ini.',
        },
        { name: 'start_time', label: 'Mulai', type: 'time', required: true },
        { name: 'end_time', label: 'Selesai', type: 'time', required: true },
        { name: 'mode', label: 'Mode perkuliahan', type: 'select', required: true, options: modeOptions },
        {
          name: 'room',
          label: 'Ruangan',
          type: 'text',
          placeholder: 'mis. Ruang 2.03',
          visible: (values) => values.mode === 'offline',
          required: (values) => values.mode === 'offline',
        },
        {
          name: 'platform',
          label: 'Platform',
          type: 'select',
          options: platformOptions,
          visible: (values) => values.mode === 'online',
          required: (values) => values.mode === 'online',
        },
        {
          name: 'meeting_link',
          label: 'Tautan kelas daring',
          type: 'url',
          placeholder: 'https://...',
          colSpan: 2,
          visible: (values) => values.mode === 'online',
          required: (values) => values.mode === 'online',
        },
      ]}
      filters={[
        {
          key: 'day',
          label: 'Hari',
          type: 'chips',
          placeholder: 'Semua hari',
          options: dayOptions,
        },
      ]}
      columns={[
        {
          key: 'course_name',
          label: 'Mata Kuliah',
          render: (schedule) => (
            <div className="min-w-[210px]">
              <p className="text-sm font-semibold text-slate-800">{schedule.course_name}</p>
              <p className="text-[11px] text-slate-500">
                <span className="font-mono">{schedule.course_code}</span> · {schedule.course_lecturer}
              </p>
            </div>
          ),
        },
        {
          key: 'start_time',
          label: 'Waktu',
          className: 'text-center',
          render: (schedule) => (
            <div>
              <p className="text-xs font-semibold text-slate-700">{schedule.day}</p>
              <p className="text-[11px] text-slate-500">
                {timeLabel(schedule.start_time)}–{timeLabel(schedule.end_time)}
              </p>
            </div>
          ),
        },
        {
          key: 'mode',
          label: 'Mode',
          className: 'text-center',
          render: (schedule) => (
            <div className="space-y-1">
              <Badge variant={schedule.mode === 'online' ? 'info' : 'teal'}>{schedule.mode_label}</Badge>
              <p className="text-[10px] text-slate-400">
                {schedule.mode === 'online' ? schedule.platform_label || 'Daring' : schedule.room || '-'}
              </p>
            </div>
          ),
        },
        {
          key: 'meeting_link',
          label: 'Tautan',
          className: 'w-[112px] text-center',
          render: (schedule) =>
            schedule.meeting_link ? (
              <a
                href={schedule.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-[11px] font-medium text-teal-600 hover:text-teal-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka tautan
              </a>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            ),
        },
        {
          key: 'class_name',
          label: 'Kelas',
          className: 'text-center',
          render: (schedule) => <Badge variant="neutral">{schedule.class_name}</Badge>,
        },
      ]}
      mapItemToForm={(schedule) => ({
        ...schedule,
        course_id: schedule.course_id || '',
        start_time: timeLabel(schedule.start_time),
        end_time: timeLabel(schedule.end_time),
        room: schedule.room || '',
        platform: schedule.platform || 'zoom',
        meeting_link: schedule.meeting_link || '',
        class_name: schedule.class_name || '',
      })}
      mapFormToPayload={(payload) => {
        if (payload.mode === 'online') {
          return { ...payload, room: null }
        }
        return { ...payload, platform: null, meeting_link: null }
      }}
      deleteTitle="Hapus jadwal?"
      deleteMessage="Jadwal akan dihapus dari portal mahasiswa dan notifikasi."
      formSize="lg"
      centerActions
      responsiveActions
      minTableWidth={640}
    />
  )
}
