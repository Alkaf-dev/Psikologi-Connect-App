import { useEffect, useId, useMemo, useState } from 'react'
import { AlertCircle, UserPlus, UsersRound } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { eligibleStudentsForCourse } from '../lib/groupHelpers'
import {
  Button,
  Checkbox,
  EmptyState,
  Field,
  Modal,
  SearchInput,
} from './ui'

export default function AddGroupMembersModal({
  open,
  group,
  course,
  students = [],
  groups = [],
  studentsLoading = false,
  studentsError = '',
  onClose,
  onSaved,
}) {
  const { toast } = useToast()
  const formId = useId()
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedIds([])
    setSearch('')
    setSubmitError('')
  }, [open, group?.id])

  const availableStudents = useMemo(
    () => eligibleStudentsForCourse(students, course, groups),
    [students, course, groups],
  )

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return availableStudents

    return availableStudents.filter((student) =>
      [student.name, student.npm, student.class_name].some((value) =>
        String(value || '').toLowerCase().includes(term),
      ),
    )
  }, [availableStudents, search])

  const close = () => {
    if (saving) return
    onClose?.()
  }

  const toggleStudent = (userId, checked) => {
    setSelectedIds((current) =>
      checked
        ? [...current.filter((id) => String(id) !== String(userId)), userId]
        : current.filter((id) => String(id) !== String(userId)),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!group) return
    if (selectedIds.length === 0) {
      setSubmitError('Pilih minimal satu mahasiswa.')
      return
    }

    setSaving(true)

    try {
      const response = await api.post(`/staff/groups/${group.id}/members`, {
        user_ids: selectedIds,
      })

      toast.success(
        'Anggota ditambahkan',
        response?.message || `${selectedIds.length} anggota berhasil ditambahkan.`,
      )
      onSaved?.(response?.data)
      onClose?.()
    } catch (submitFailure) {
      setSubmitError(errorMessage(submitFailure))
      toast.error('Gagal menambahkan anggota', errorMessage(submitFailure))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Tambah Anggota ${group?.name || 'Kelompok'}`}
      description="Hanya mahasiswa aktif dari prodi yang sesuai dan belum memiliki kelompok pada mata kuliah ini."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Batal
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={saving}
            disabled={studentsLoading || Boolean(studentsError) || selectedIds.length === 0}
          >
            <UserPlus className="h-4 w-4" />
            Tambahkan{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </Button>
        </>
      }
    >
      {submitError ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      ) : null}

      {studentsError ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Data mahasiswa belum dapat dimuat. {studentsError}</p>
        </div>
      ) : null}

      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Mahasiswa"
          help={
            course
              ? `Mata kuliah: ${[course.code, course.name].filter(Boolean).join(' · ')}`
              : undefined
          }
        >
          {studentsLoading ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              Memuat data mahasiswa...
            </p>
          ) : availableStudents.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Tidak ada mahasiswa tersedia"
              description="Semua mahasiswa yang sesuai sudah memiliki kelompok pada mata kuliah ini."
            />
          ) : (
            <div className="space-y-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Cari nama, NPM, atau kelas..."
              />
              <div className="scrollbar-thin grid max-h-72 gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-2">
                {filteredStudents.length === 0 ? (
                  <p className="col-span-full px-2 py-4 text-center text-xs text-slate-500">
                    Mahasiswa tidak ditemukan.
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <Checkbox
                      key={student.id}
                      label={student.name}
                      description={[student.npm ? `NIM ${student.npm}` : '', student.class_name]
                        .filter(Boolean)
                        .join(' · ')}
                      checked={selectedIds.some((id) => String(id) === String(student.id))}
                      onChange={(event) => toggleStudent(student.id, event.target.checked)}
                      className="items-center p-2.5"
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </Field>
      </form>
    </Modal>
  )
}
