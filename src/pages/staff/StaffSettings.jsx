import { useEffect, useState } from 'react'
import {
  Building2,
  Globe2,
  GraduationCap,
  Mail,
  Phone,
  Save,
  Settings,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { api, errorMessage } from '../../lib/api'
import { useApiData } from '../../hooks/useApiData'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
} from '../../components/ui'

const emptyValues = {
  program_name: '',
  academic_year: '',
  semester: '',
  contact_email: '',
  contact_phone: '',
  public_tagline: '',
  public_about: '',
  portal_note: '',
}

export default function StaffSettings() {
  const { toast } = useToast()
  const { data, loading, refresh } = useApiData('/staff/settings')
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setValues({
      program_name: data.program_name || '',
      academic_year: data.academic_year || '',
      semester: data.semester || '',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      public_tagline: data.public_tagline || '',
      public_about: data.public_about || '',
      portal_note: data.portal_note || '',
    })
  }, [data])

  const update = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const response = await api.put('/staff/settings', values)
      toast.success(
        'Pengaturan disimpan',
        response?.message || 'Perubahan pengaturan berhasil diterapkan.',
      )
      refresh()
    } catch (error) {
      setErrors(error.errors || {})
      toast.error('Gagal menyimpan pengaturan', errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sistem"
        title="Pengaturan"
        description="Atur identitas program studi, kontak resmi, dan konten utama yang tampil pada situs publik serta portal."
      />

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader
              title="Identitas Program Studi"
              description="Informasi akademik utama yang digunakan di seluruh aplikasi."
              icon={GraduationCap}
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Nama program" required error={errors.program_name?.[0]} className="sm:col-span-2">
                <Input
                  value={values.program_name}
                  onChange={(event) => update('program_name', event.target.value)}
                  required
                  maxLength={120}
                />
              </Field>
              <Field label="Tahun akademik" error={errors.academic_year?.[0]}>
                <Input
                  value={values.academic_year}
                  onChange={(event) => update('academic_year', event.target.value)}
                  placeholder="mis. 2025/2026"
                  maxLength={20}
                />
              </Field>
              <Field label="Semester" error={errors.semester?.[0]}>
                <Input
                  value={values.semester}
                  onChange={(event) => update('semester', event.target.value)}
                  placeholder="mis. Ganjil"
                  maxLength={20}
                />
              </Field>
              <Field label="Email kontak" error={errors.contact_email?.[0]} className="sm:col-span-2">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={values.contact_email}
                    onChange={(event) => update('contact_email', event.target.value)}
                    className="pl-9"
                    placeholder="prodi@psikologi.test"
                  />
                </div>
              </Field>
              <Field label="Telepon kontak" error={errors.contact_phone?.[0]} className="sm:col-span-2">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={values.contact_phone}
                    onChange={(event) => update('contact_phone', event.target.value)}
                    className="pl-9"
                    placeholder="(021) 000-0000"
                  />
                </div>
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Situs Publik"
              description="Konten yang dilihat pengunjung pada halaman beranda dan informasi publik."
              icon={Globe2}
            />
            <div className="space-y-4 p-5">
              <Field label="Tagline" error={errors.public_tagline?.[0]}>
                <Input
                  value={values.public_tagline}
                  onChange={(event) => update('public_tagline', event.target.value)}
                  placeholder="Tagline singkat program studi"
                  maxLength={180}
                />
              </Field>
              <Field label="Tentang program" error={errors.public_about?.[0]}>
                <Textarea
                  rows={7}
                  value={values.public_about}
                  onChange={(event) => update('public_about', event.target.value)}
                  placeholder="Deskripsi program studi untuk situs publik..."
                />
              </Field>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Catatan Portal"
            description="Pesan singkat yang tampil pada area portal mahasiswa."
            icon={Settings}
          />
          <div className="p-5">
            <Field label="Catatan portal" error={errors.portal_note?.[0]}>
              <Textarea
                rows={3}
                value={values.portal_note}
                onChange={(event) => update('portal_note', event.target.value)}
                placeholder="mis. Pastikan data akademik selalu diperbarui."
                maxLength={180}
              />
            </Field>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="h-4 w-4 text-teal-600" />
            Perubahan akan langsung tampil pada situs publik dan portal.
          </p>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  )
}
