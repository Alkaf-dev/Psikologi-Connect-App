import { useEffect, useId, useMemo, useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { eligibleStudentsForCourse } from '../lib/groupHelpers'
import {
  Button,
  Checkbox,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
} from './ui'

const emptyValues = {
  course_id: '',
  name: '',
  leader_id: '',
  member_ids: [],
  description: '',
}

export default function GroupFormModal({
  open,
  group,
  courseId,
  courses = [],
  students = [],
  groups = [],
  studentsLoading = false,
  studentsError = '',
  onClose,
  onSaved,
}) {
  const { toast } = useToast()
  const formId = useId()
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  const editing = Boolean(group)

  useEffect(() => {
    if (!open) return

    if (group) {
      const memberIds = Array.isArray(group.member_ids)
        ? group.member_ids
        : (group.members || []).map((member) => member.user_id)

      setValues({
        course_id: group.course_id || courseId || '',
        name: group.name || '',
        leader_id: group.leader_id || '',
        member_ids: memberIds.filter((id) => String(id) !== String(group.leader_id)),
        description: group.description || '',
      })
    } else {
      setValues({
        ...emptyValues,
        course_id: courseId || '',
      })
    }

    setErrors({})
    setSubmitError('')
  }, [open, group, courseId])

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === String(values.course_id)),
    [courses, values.course_id],
  )

  const eligibleStudents = useMemo(
    () =>
      eligibleStudentsForCourse(students, selectedCourse, groups, {
        excludeGroupId: group?.id || '',
      }),
    [students, selectedCourse, groups, group?.id],
  )

  const memberOptions = eligibleStudents.filter(
    (student) => String(student.id) !== String(values.leader_id),
  )

  const fieldError = (name) => {
    const error = errors[name]
    return Array.isArray(error) ? error[0] : error
  }

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const changeCourse = (value) => {
    setValues((current) => ({
      ...current,
      course_id: value,
      leader_id: '',
      member_ids: [],
    }))
    setErrors((current) => ({
      ...current,
      course_id: undefined,
      leader_id: undefined,
      member_ids: undefined,
    }))
  }

  const changeLeader = (value) => {
    setValues((current) => ({
      ...current,
      leader_id: value,
      member_ids: current.member_ids.filter((id) => String(id) !== String(value)),
    }))
    setErrors((current) => ({ ...current, leader_id: undefined }))
  }

  const toggleMember = (userId, checked) => {
    setValues((current) => {
      const currentIds = Array.isArray(current.member_ids) ? current.member_ids : []
      return {
        ...current,
        member_ids: checked
          ? [...currentIds, userId]
          : currentIds.filter((id) => String(id) !== String(userId)),
      }
    })
    setErrors((current) => ({ ...current, member_ids: undefined }))
  }

  const close = () => {
    if (saving) return
    onClose?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const nextErrors = {}
    if (!values.course_id) nextErrors.course_id = 'Pilih mata kuliah.'
    if (!values.name.trim()) nextErrors.name = 'Nama kelompok wajib diisi.'
    if (!values.leader_id) nextErrors.leader_id = 'Pilih ketua kelompok.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)

    const payload = {
      course_id: values.course_id,
      name: values.name.trim(),
      leader_id: values.leader_id,
      member_ids: values.member_ids,
      description: values.description.trim() || null,
    }

    try {
      const response = editing
        ? await api.put(`/staff/groups/${group.id}`, payload)
        : await api.post('/staff/groups', payload)

      toast.success(
        editing ? 'Kelompok diperbarui' : 'Kelompok ditambahkan',
        response?.message ||
          (editing ? 'Perubahan kelompok berhasil disimpan.' : 'Kelompok baru berhasil dibuat.'),
      )
      onSaved?.(response?.data)
      onClose?.()
    } catch (submitFailure) {
      setErrors(submitFailure.errors || {})
      setSubmitError(errorMessage(submitFailure))
      toast.error(
        editing ? 'Gagal memperbarui kelompok' : 'Gagal menambahkan kelompok',
        errorMessage(submitFailure),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? `Ubah ${group?.name || 'Kelompok'}` : 'Tambah Kelompok'}
      description="Ketua harus mahasiswa aktif dan otomatis menjadi anggota kelompok."
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
            disabled={studentsLoading || Boolean(studentsError)}
          >
            <Save className="h-4 w-4" />
            {editing ? 'Simpan perubahan' : 'Simpan'}
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

      <form id={formId} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Mata kuliah"
          htmlFor={`${formId}-course`}
          required
          error={fieldError('course_id')}
          className="sm:col-span-2"
        >
          <Select
            id={`${formId}-course`}
            value={values.course_id}
            onChange={(event) => changeCourse(event.target.value)}
          >
            <option value="">Pilih mata kuliah</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {[course.code, course.name].filter(Boolean).join(' · ')}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nama kelompok" htmlFor={`${formId}-name`} required error={fieldError('name')}>
          <Input
            id={`${formId}-name`}
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
            placeholder="mis. Kelompok 1"
            maxLength={80}
          />
        </Field>

        <Field
          label="Ketua kelompok"
          htmlFor={`${formId}-leader`}
          required
          error={fieldError('leader_id')}
        >
          <Select
            id={`${formId}-leader`}
            value={values.leader_id}
            onChange={(event) => changeLeader(event.target.value)}
            disabled={!selectedCourse || studentsLoading}
          >
            <option value="">
              {!selectedCourse
                ? 'Pilih mata kuliah terlebih dahulu'
                : studentsLoading
                  ? 'Memuat mahasiswa...'
                  : 'Pilih ketua'}
            </option>
            {eligibleStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {[student.name, student.npm].filter(Boolean).join(' · ')}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Anggota kelompok"
          error={fieldError('member_ids')}
          help="Ketua otomatis menjadi anggota. Anggota harus berasal dari prodi yang sesuai dan belum masuk kelompok lain pada mata kuliah ini."
          className="sm:col-span-2"
        >
          {studentsLoading ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              Memuat data mahasiswa...
            </p>
          ) : memberOptions.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              {selectedCourse
                ? 'Belum ada mahasiswa yang tersedia untuk mata kuliah ini.'
                : 'Pilih mata kuliah untuk melihat pilihan anggota.'}
            </p>
          ) : (
            <div className="scrollbar-thin grid max-h-56 gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-2">
              {memberOptions.map((student) => (
                <Checkbox
                  key={student.id}
                  label={student.name}
                  description={[student.npm ? `NIM ${student.npm}` : '', student.class_name]
                    .filter(Boolean)
                    .join(' · ')}
                  checked={values.member_ids.some((id) => String(id) === String(student.id))}
                  onChange={(event) => toggleMember(student.id, event.target.checked)}
                  className="items-center p-2.5"
                />
              ))}
            </div>
          )}
        </Field>

        <Field
          label="Deskripsi / topik"
          htmlFor={`${formId}-description`}
          error={fieldError('description')}
          className="sm:col-span-2"
        >
          <Textarea
            id={`${formId}-description`}
            rows={3}
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
            placeholder="Opsional. Tuliskan fokus atau catatan kelompok..."
          />
        </Field>
      </form>
    </Modal>
  )
}
