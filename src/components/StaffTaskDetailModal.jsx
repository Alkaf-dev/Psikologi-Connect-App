import { Link } from 'react-router-dom'
import {
  CalendarClock,
  Clock,
  ExternalLink,
  FileText,
  Inbox,
  Link2,
} from 'lucide-react'
import { formatDateTime } from '../lib/utils'
import { Badge, Button, DetailList, Modal } from './ui'

export default function StaffTaskDetailModal({ task, open, onClose }) {
  if (!task) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      description={`${task.course_code ? `${task.course_code} · ` : ''}${task.course_name || 'Mata Kuliah'}${
        task.meeting_number ? ` (Pertemuan ${task.meeting_number})` : ''
      }`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
          <Button as={Link} to={`/admin/pengumpulan?task_id=${task.id}`}>
            <Inbox className="h-4 w-4" />
            Lihat pengumpulan ({task.submission_count ?? 0})
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Badges Status & Jenis */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={task.type === 'kelompok' ? 'purple' : 'info'}>
            {task.type_label || (task.type === 'kelompok' ? 'Kelompok' : 'Individu')}
          </Badge>
          <Badge
            variant={
              task.status === 'active'
                ? 'success'
                : task.status === 'completed'
                  ? 'info'
                  : 'neutral'
            }
          >
            {task.status_label || task.status}
          </Badge>
          {task.is_overdue ? <Badge variant="danger">Lewat deadline</Badge> : null}
        </div>

        {/* Waktu Mulai & Tenggat Waktu */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-teal-600 shadow-sm">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Mulai Tersedia</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {task.start_at ? formatDateTime(task.start_at) : 'Langsung tersedia'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-rose-600 shadow-sm">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Tenggat Waktu (Deadline)</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-900">
                  {formatDateTime(task.deadline)}
                </p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    task.is_overdue ? 'font-medium text-rose-500' : 'text-slate-500'
                  }`}
                >
                  {task.is_overdue ? 'Sudah lewat tenggat' : task.deadline_note || 'Sesuai jadwal'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail List Informasi Utama */}
        <DetailList
          items={[
            {
              label: 'Mata kuliah',
              value: `${task.course_code ? `${task.course_code} · ` : ''}${task.course_name}`,
            },
            task.meeting_number
              ? { label: 'Pertemuan', value: `Pertemuan ke-${task.meeting_number}` }
              : null,
            {
              label: 'Jenis tugas',
              value: task.type_label || (task.type === 'kelompok' ? 'Kelompok' : 'Individu'),
            },
            {
              label: 'Total Pengumpulan',
              value: `${task.submission_count ?? 0} pengumpulan`,
            },
          ]}
        />

        {/* Instruksi / Deskripsi Tugas */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FileText className="h-4 w-4 text-slate-400" />
            Instruksi / Deskripsi Tugas
          </h3>
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            {task.description ? (
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {task.description}
              </p>
            ) : (
              <p className="text-xs italic text-slate-400">
                Tidak ada instruksi khusus yang dituliskan.
              </p>
            )}
          </div>
        </div>

        {/* Tautan Materi & Pengumpulan Tambahan */}
        {task.material_url || task.collection_link ? (
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Link2 className="h-4 w-4 text-slate-400" />
              Tautan Terkait
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.material_url && (
                <Button
                  as="a"
                  href={task.material_url}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                  size="sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka tautan materi
                </Button>
              )}
              {task.collection_link && (
                <Button
                  as="a"
                  href={task.collection_link}
                  target="_blank"
                  rel="noreferrer"
                  variant="soft"
                  size="sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka tautan pengumpulan dosen
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

