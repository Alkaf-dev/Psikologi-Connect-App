import { useEffect, useId, useState } from 'react'
import { AlertCircle, Loader2, Save, UsersRound } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import { fetchAll } from '../hooks/useApiData'
import { useToast } from '../context/ToastContext'
import { Avatar, Badge, Button, EmptyState, Field, Modal, Select, Skeleton } from './ui'

export default function UserGroupsModal({ open, user, onClose, onSaved }) {
  const { toast } = useToast()
  const formId = useId()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState([])
  const [groups, setGroups] = useState([])
  const [selection, setSelection] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !user) return undefined

    let active = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [courseItems, groupItems] = await Promise.all([
          fetchAll('/staff/courses', {
            prodi_id: user.prodi_id,
            sort: 'name',
            direction: 'asc',
          }),
          fetchAll('/staff/groups', {
            with_members: 1,
            sort: 'name',
            direction: 'asc',
          }),
        ])

        if (!active) return

        const nextSelection = {}
        courseItems.forEach((course) => {
          const membership = groupItems.find(
            (group) =>
              group.course_id === course.id &&
              (group.members || []).some((member) => String(member.user_id) === String(user.id)),
          )
          nextSelection[course.id] = membership?.id || ''
        })

        setCourses(courseItems)
        setGroups(groupItems)
        setSelection(nextSelection)
      } catch (loadError) {
        if (active) setError(errorMessage(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [open, user])

  const save = async (event) => {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    try {
      await api.put(`/staff/users/${user.id}`, {
        group_assignments: courses.map((course) => ({
          course_id: course.id,
          group_id: selection[course.id] || '',
        })),
      })
      toast.success('Kelompok diperbarui', `Keanggotaan kelompok ${user.name} berhasil disimpan.`)
      onSaved?.()
      onClose?.()
    } catch (saveError) {
      setError(errorMessage(saveError))
      toast.error('Gagal menyimpan kelompok', errorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atur Kelompok Mahasiswa"
      description="Pilih satu kelompok untuk setiap mata kuliah yang tersedia pada program studi mahasiswa."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form={formId} loading={saving} disabled={loading || courses.length === 0}>
            <Save className="h-4 w-4" />
            Simpan kelompok
          </Button>
        </>
      }
    >
      {user ? (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <Avatar name={user.name} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">
              NIM {user.npm || '-'} · {user.class_name || '-'} · {user.prodi_name || '-'}
            </p>
          </div>
          <Badge variant="teal">{user.role_label || 'Mahasiswa'}</Badge>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-20" />
          ))}
          <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Memuat mata kuliah dan kelompok...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah untuk program studi ini sebelum mengatur kelompok mahasiswa."
        />
      ) : (
        <form id={formId} onSubmit={save} className="space-y-3">
          {courses.map((course) => {
            const courseGroups = groups.filter((group) => group.course_id === course.id)
            const currentGroup = groups.find((group) => group.id === selection[course.id])

            return (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{course.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {course.code} · Semester {course.semester} · {course.class_name}
                    </p>
                  </div>
                  {currentGroup ? (
                    <Badge variant="violet">{currentGroup.members_count || 0} anggota</Badge>
                  ) : (
                    <Badge variant="neutral">Belum berkelompok</Badge>
                  )}
                </div>
                <Field label="Kelompok" className="mt-3">
                  <Select
                    value={selection[course.id] || ''}
                    onChange={(event) =>
                      setSelection((current) => ({ ...current, [course.id]: event.target.value }))
                    }
                  >
                    <option value="">Tidak masuk kelompok</option>
                    {courseGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                        {group.leader_name ? ` · Ketua: ${group.leader_name}` : ''}
                      </option>
                    ))}
                  </Select>
                </Field>
                {courseGroups.length === 0 ? (
                  <p className="mt-2 text-[11px] text-amber-600">
                    Belum ada kelompok untuk mata kuliah ini.
                  </p>
                ) : null}
              </div>
            )
          })}
        </form>
      )}
    </Modal>
  )
}
