import { useEffect, useId, useMemo, useState } from 'react'
import { AlertCircle, Crown, Save } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { eligibleStudentsForCourse } from '../lib/groupHelpers'
import {
  Button,
  Checkbox,
  Field,
  Input,
  Modal,
  SearchInput,
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
  const [memberSearch, setMemberSearch] = useState('')
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  const editing = Boolean(group)

  useEffect(() => {
    if (!open) return

    if (group) {
      const rawMemberIds = Array.isArray(group.member_ids)
        ? group.member_ids
        : (group.members || []).map((member) => member.user_id || member.id)

      // Sertakan leader_id dalam daftar anggota agar seluruh anggota kelompok tercentang
      const allMemberIds = [
        ...rawMemberIds,
        ...(group.leader_id && !rawMemberIds.some((id) => String(id) === String(group.leader_id))
          ? [group.leader_id]
          : []),
      ]

      setValues({
        course_id: group.course_id || courseId || '',
        name: group.name || '',
        leader_id: group.leader_id || '',
        member_ids: allMemberIds,
        description: group.description || '',
      })
    } else {
      setValues({
        ...emptyValues,
        course_id: courseId || '',
      })
    }

    setMemberSearch('')
    setShowOnlySelected(false)
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

  // Kandidat ketua HANYA mahasiswa yang sudah dipilih menjadi anggota
  const leaderCandidates = useMemo(() => {
    const memberIdSet = new Set(values.member_ids.map(String))
    return eligibleStudents.filter((student) => memberIdSet.has(String(student.id)))
  }, [eligibleStudents, values.member_ids])

  // Filter anggota berdasarkan input ketikan dan filter 'Hanya yang dipilih'
  const filteredStudents = useMemo(() => {
    let list = eligibleStudents
    if (showOnlySelected) {
      const memberIdSet = new Set(values.member_ids.map(String))
      list = list.filter((student) => memberIdSet.has(String(student.id)))
    }

    const term = memberSearch.trim().toLowerCase()
    if (!term) return list

    return list.filter((student) =>
      [student.name, student.npm, student.class_name].some((value) =>
        String(value || '').toLowerCase().includes(term),
      ),
    )
  }, [eligibleStudents, memberSearch, showOnlySelected, values.member_ids])

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
    setMemberSearch('')
    setShowOnlySelected(false)
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
    }))
    setErrors((current) => ({ ...current, leader_id: undefined }))
  }

  const toggleMember = (userId, checked) => {
    setValues((current) => {
      const currentIds = Array.isArray(current.member_ids) ? current.member_ids : []
      const nextMemberIds = checked
        ? [...currentIds.filter((id) => String(id) !== String(userId)), userId]
        : currentIds.filter((id) => String(id) !== String(userId))

      // Jika anggota yang dilepas adalah ketua saat ini, sesuaikan ketua
      let nextLeaderId = current.leader_id
      if (!checked && String(current.leader_id) === String(userId)) {
        nextLeaderId = nextMemberIds.length === 1 ? nextMemberIds[0] : ''
      } else if (checked && nextMemberIds.length === 1 && !nextLeaderId) {
        nextLeaderId = userId
      }

      return {
        ...current,
        member_ids: nextMemberIds,
        leader_id: nextLeaderId,
      }
    })
    setErrors((current) => ({ ...current, member_ids: undefined, leader_id: undefined }))
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
    if (values.member_ids.length === 0) {
      nextErrors.member_ids = 'Pilih minimal satu anggota kelompok.'
    }
    if (!values.leader_id) {
      nextErrors.leader_id =
        values.member_ids.length === 0
          ? 'Pilih anggota kelompok terlebih dahulu.'
          : 'Pilih ketua kelompok dari anggota yang sudah dipilih.'
    } else if (!values.member_ids.some((id) => String(id) === String(values.leader_id))) {
      nextErrors.leader_id = 'Ketua harus berasal dari anggota kelompok yang dipilih.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)

    const payload = {
      course_id: values.course_id,
      name: values.name.trim(),
      leader_id: values.leader_id,
      member_ids: values.member_ids.filter((id) => String(id) !== String(values.leader_id)),
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
      description="Ketua harus anggota aktif dan otomatis menjadi anggota kelompok."
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
          help={
            leaderCandidates.length > 0
              ? 'Hanya anggota yang dipilih yang dapat dijadikan ketua.'
              : 'Pilih anggota kelompok di bawah terlebih dahulu untuk menentukan ketua.'
          }
        >
          <Select
            id={`${formId}-leader`}
            value={values.leader_id}
            onChange={(event) => changeLeader(event.target.value)}
            disabled={!selectedCourse || studentsLoading || leaderCandidates.length === 0}
          >
            <option value="">
              {!selectedCourse
                ? 'Pilih mata kuliah terlebih dahulu'
                : studentsLoading
                  ? 'Memuat data mahasiswa...'
                  : leaderCandidates.length === 0
                    ? 'Pilih anggota kelompok terlebih dahulu'
                    : '-- Pilih ketua kelompok --'}
            </option>
            {leaderCandidates.map((student) => (
              <option key={student.id} value={student.id}>
                {[student.name, student.npm ? `NIM ${student.npm}` : '', student.class_name]
                  .filter(Boolean)
                  .join(' · ')}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Anggota kelompok"
          error={fieldError('member_ids')}
          help="Centang mahasiswa yang menjadi anggota kelompok. Pilihan ketua di atas otomatis disesuaikan dari anggota yang Anda centang."
          className="sm:col-span-2"
        >
          {studentsLoading ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              Memuat data mahasiswa...
            </p>
          ) : eligibleStudents.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
              {selectedCourse
                ? 'Belum ada mahasiswa yang memenuhi syarat untuk mata kuliah ini.'
                : 'Pilih mata kuliah untuk melihat pilihan anggota.'}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Filter nama dengan mengetik & tombol cepat */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <SearchInput
                  value={memberSearch}
                  onChange={setMemberSearch}
                  placeholder="Ketik nama, NIM, atau kelas mahasiswa..."
                  className="flex-1"
                />
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowOnlySelected(false)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                      !showOnlySelected
                        ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({eligibleStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOnlySelected(true)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                      showOnlySelected
                        ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Dipilih ({values.member_ids.length})
                  </button>
                </div>
              </div>

              {/* Status bar ringkasan */}
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                <span>
                  {values.member_ids.length > 0 ? (
                    <strong className="text-teal-700 font-semibold">
                      {values.member_ids.length} anggota dipilih
                    </strong>
                  ) : (
                    'Belum ada anggota yang dipilih'
                  )}
                  {values.leader_id && (
                    <span className="ml-2 inline-flex items-center gap-1 text-amber-700 font-medium">
                      <Crown className="h-3 w-3 inline text-amber-500" />
                      Ketua:{' '}
                      {leaderCandidates.find((c) => String(c.id) === String(values.leader_id))?.name || '-'}
                    </span>
                  )}
                </span>
                {memberSearch && (
                  <span className="text-slate-400">
                    Menampilkan {filteredStudents.length} dari {eligibleStudents.length}
                  </span>
                )}
              </div>

              {/* Daftar Checkbox Anggota */}
              {filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                  Tidak ada mahasiswa yang cocok dengan pencarian &ldquo;{memberSearch}&rdquo;.
                </div>
              ) : (
                <div className="scrollbar-thin grid max-h-56 gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-2">
                  {filteredStudents.map((student) => {
                    const isChecked = values.member_ids.some(
                      (id) => String(id) === String(student.id),
                    )
                    const isLeader = String(values.leader_id) === String(student.id)

                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between rounded-xl border p-2 transition ${
                          isChecked
                            ? 'border-teal-200 bg-teal-50/40'
                            : 'border-transparent hover:bg-white'
                        }`}
                      >
                        <Checkbox
                          label={student.name}
                          description={[
                            student.npm ? `NIM ${student.npm}` : '',
                            student.class_name,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                          checked={isChecked}
                          onChange={(event) => toggleMember(student.id, event.target.checked)}
                          className="flex-1 items-center"
                        />
                        {isLeader && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 shrink-0">
                            <Crown className="h-2.5 w-2.5 text-amber-600" />
                            Ketua
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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
