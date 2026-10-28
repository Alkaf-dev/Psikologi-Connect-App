import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Link2,
  Send,
  Users,
} from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { formatDateTime, statusTone } from '../lib/utils'
import { useToast } from '../context/ToastContext'
import { Badge, Button, DetailList, Drawer, Field, Input, Textarea } from './ui'
import { celebrateMascot } from './PsychologyMascot'

function submissionVariant(status) {
  if (status === 'graded') return 'success'
  if (status === 'late') return 'danger'
  if (status === 'submitted') return 'warning'
  return 'neutral'
}

export default function TaskDetailDrawer({ task, open, onClose, onSubmitted }) {
  const { toast } = useToast()
  const [link, setLink] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLink(task?.submission?.link ?? '')
    setNotes(task?.submission?.notes ?? '')
  }, [task?.id, task?.submission?.link, task?.submission?.notes, open])

  if (!task) return null

  const submission = task.submission
  const canSubmit = task.can_submit || task.can_update
  const isGroupTask = task.type === 'kelompok'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const response = await api.post(`/student/tasks/${task.id}/submission`, {
        link: link.trim(),
        notes: notes.trim() || null,
      })
      toast.success('Pengumpulan tersimpan', response?.message)
      celebrateMascot('Kerja bagus! Tugas berhasil dikumpulkan.')
      onSubmitted?.()
      onClose?.()
    } catch (error) {
      toast.error('Gagal mengumpulkan tugas', errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={task.title}
      description={`${task.course_name} · ${task.type_label}`}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={task.type === 'kelompok' ? 'purple' : 'info'}
            className="w-20 justify-center text-center"
          >
            {task.type_label}
          </Badge>
          <Badge
            variant={statusTone(task.status)}
            className="w-20 justify-center text-center"
          >
            {task.status_label}
          </Badge>
          <Badge
            variant={submissionVariant(submission?.status)}
            className="min-w-[84px] justify-center text-center"
          >
            {task.submission_label}
          </Badge>
          {task.is_overdue ? (
            <Badge variant="danger" className="min-w-[84px] justify-center text-center">
              Lewat deadline
            </Badge>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500">Deadline</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {task.deadline_label || formatDateTime(task.deadline)}
              </p>
              {task.deadline_note ? <p className="mt-1 text-xs text-slate-500">{task.deadline_note}</p> : null}
            </div>
          </div>
        </div>

        {task.description ? (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText className="h-4 w-4 text-slate-400" />
              Instruksi Tugas
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{task.description}</p>
          </div>
        ) : null}

        <DetailList
          items={[
            { label: 'Mata kuliah', value: `${task.course_code} · ${task.course_name}` },
            task.meeting_number ? { label: 'Pertemuan', value: `Pertemuan ${task.meeting_number}` } : null,
            { label: 'Jenis tugas', value: task.type_label },
            isGroupTask ? { label: 'Kelompok', value: task.portal_group_name || task.group_name || '-' } : null,
            task.start_at ? { label: 'Mulai', value: formatDateTime(task.start_at) } : null,
          ]}
        />

        <div className="flex flex-wrap gap-2">
          {task.material_url ? (
            <Button as="a" href={task.material_url} target="_blank" rel="noreferrer" variant="secondary" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Buka materi
            </Button>
          ) : null}
          {task.collection_link ? (
            <Button as="a" href={task.collection_link} target="_blank" rel="noreferrer" variant="secondary" size="sm">
              <Link2 className="h-3.5 w-3.5" />
              Tautan pengumpulan dosen
            </Button>
          ) : null}
          {submission?.link ? (
            <Button as="a" href={submission.link} target="_blank" rel="noreferrer" variant="soft" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Lihat pengumpulan saya
            </Button>
          ) : null}
        </div>

        {submission ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Pengumpulan
              </h3>
              <Badge variant={submissionVariant(submission.status)}>
                {submission.status === 'graded' ? 'Dinilai' : submission.status === 'late' ? 'Terlambat' : 'Dikumpulkan'}
              </Badge>
            </div>
            <DetailList
              className="mt-2"
              items={[
                { label: 'Dikumpulkan pada', value: formatDateTime(submission.submitted_at) },
                { label: 'Catatan', value: submission.notes || '-' },
                {
                  label: 'Nilai',
                  value:
                    submission.grade !== '' && submission.grade !== null && submission.grade !== undefined
                      ? String(submission.grade)
                      : 'Belum dinilai',
                },
                { label: 'Feedback', value: submission.feedback || '-' },
              ]}
            />
          </div>
        ) : null}

        {canSubmit ? (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Send className="h-4 w-4 text-teal-600" />
              {submission ? 'Perbarui pengumpulan' : 'Kumpulkan tugas'}
            </h3>
            {isGroupTask ? (
              <p className="mt-1 text-xs leading-5 text-teal-800">
                Tugas kelompok dikumpulkan satu kali oleh perwakilan kelompok. Pastikan tautan dapat diakses dosen.
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              <Field label="Tautan pengumpulan" required>
                <Input
                  type="url"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                />
              </Field>
              <Field label="Catatan (opsional)">
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Tambahkan catatan untuk dosen..."
                />
              </Field>
              <Button type="submit" loading={saving} className="w-full sm:w-auto">
                <Send className="h-4 w-4" />
                {submission ? 'Simpan perubahan' : 'Kumpulkan tugas'}
              </Button>
            </div>
          </form>
        ) : submission ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
            {isGroupTask && !task.is_representative
              ? 'Hanya perwakilan kelompok yang dapat memperbarui pengumpulan ini.'
              : task.is_overdue
                ? 'Deadline telah lewat. Hubungi admin program studi untuk perubahan pengumpulan.'
                : 'Pengumpulan sudah terkunci.'}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {task.status !== 'active'
              ? 'Tugas belum dipublikasikan atau sudah selesai.'
              : isGroupTask
                ? 'Kelompok Anda belum ditugaskan pada tugas ini.'
                : 'Anda belum dapat mengumpulkan tugas ini.'}
          </div>
        )}

        {isGroupTask ? (
          <p className="flex items-center gap-2 text-[11px] text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {task.portal_group_name ? `Kelompok: ${task.portal_group_name}` : 'Tugas kelompok'}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-[11px] text-slate-400">
            <ClipboardList className="h-3.5 w-3.5" />
            Tugas individu · {task.course_code}
          </p>
        )}
      </div>
    </Drawer>
  )
}
