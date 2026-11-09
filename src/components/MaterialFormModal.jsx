import { useEffect, useId, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { api, errorMessage } from '../lib/api'
import { Button, Field, Input, Modal, Select, Textarea } from './ui'

const emptyValues = {
  course_id: '',
  title: '',
  description: '',
  url: '',
  meeting_number: '',
}

function normalizeUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) return raw
  return `https://${raw}`
}

export default function MaterialFormModal({
  open,
  material,
  courses = [],
  initialCourseId = '',
  onClose,
  onSaved,
}) {
  const { toast } = useToast()
  const formId = useId()
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues({
      course_id: material?.course_id || initialCourseId || '',
      title: material?.title || '',
      description: material?.description || '',
      url: material?.url || '',
      meeting_number: material?.meeting_number ? String(material.meeting_number) : '',
    })
    setErrors({})
  }, [open, material, initialCourseId])

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const close = () => {
    if (saving) return
    onClose?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})

    const payload = {
      course_id: values.course_id,
      title: values.title.trim(),
      description: values.description.trim(),
      url: normalizeUrl(values.url),
      meeting_number: values.meeting_number ? Number(values.meeting_number) : null,
    }

    try {
      const response = material
        ? await api.put(`/staff/materials/${material.id}`, payload)
        : await api.post('/staff/materials', payload)

      toast.success(
        material ? 'Materi diperbarui' : 'Materi ditambahkan',
        response?.message || 'Data materi berhasil disimpan.',
      )
      onSaved?.()
      onClose?.()
    } catch (submitError) {
      setErrors(submitError.errors || {})
      toast.error(
        material ? 'Gagal memperbarui materi' : 'Gagal menambahkan materi',
        errorMessage(submitError),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={material ? 'Edit materi' : 'Tambah materi'}
      description="Materi akan langsung tampil di halaman materi mahasiswa dan staff."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {material ? 'Simpan perubahan' : 'Simpan materi'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Mata kuliah"
          htmlFor={`${formId}-course`}
          required
          error={errors.course_id?.[0] || errors.course_id}
          className="sm:col-span-2"
        >
          <Select
            id={`${formId}-course`}
            value={values.course_id}
            onChange={(event) => updateValue('course_id', event.target.value)}
            error={Boolean(errors.course_id)}
          >
            <option value="">Pilih mata kuliah</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code ? `${course.code} · ` : ''}
                {course.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Judul materi"
          htmlFor={`${formId}-title`}
          required
          error={errors.title?.[0] || errors.title}
          className="sm:col-span-2"
        >
          <Input
            id={`${formId}-title`}
            value={values.title}
            onChange={(event) => updateValue('title', event.target.value)}
            placeholder="mis. Slide Pertemuan 3: Teori Belajar"
            error={Boolean(errors.title)}
          />
        </Field>

        <Field
          label="Pertemuan ke-"
          htmlFor={`${formId}-meeting`}
          error={errors.meeting_number?.[0] || errors.meeting_number}
          help="Opsional, isi jika materi terkait pertemuan tertentu."
        >
          <Input
            id={`${formId}-meeting`}
            type="number"
            min="1"
            max="99"
            value={values.meeting_number}
            onChange={(event) => updateValue('meeting_number', event.target.value)}
            placeholder="mis. 3"
            error={Boolean(errors.meeting_number)}
          />
        </Field>

        <Field
          label="Tautan materi"
          htmlFor={`${formId}-url`}
          required
          error={errors.url?.[0] || errors.url}
          help="Google Drive, PDF, slide, atau tautan bahan ajar lainnya."
        >
          <Input
            id={`${formId}-url`}
            type="url"
            value={values.url}
            onChange={(event) => updateValue('url', event.target.value)}
            placeholder="https://drive.google.com/..."
            error={Boolean(errors.url)}
          />
        </Field>

        <Field
          label="Deskripsi"
          htmlFor={`${formId}-description`}
          error={errors.description?.[0] || errors.description}
          className="sm:col-span-2"
        >
          <Textarea
            id={`${formId}-description`}
            rows={4}
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
            placeholder="Ringkasan isi materi atau catatan untuk mahasiswa..."
            error={Boolean(errors.description)}
          />
        </Field>
      </form>
    </Modal>
  )
}
