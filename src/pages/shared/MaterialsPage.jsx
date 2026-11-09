import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useApiData, useDebouncedValue } from '../../hooks/useApiData'
import { api, errorMessage } from '../../lib/api'
import { buildLearningMaterials } from '../../lib/materials'
import MaterialFormModal from '../../components/MaterialFormModal'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
  Select,
  Skeleton,
} from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

const sourceIcons = {
  manual: BookOpen,
  task: ClipboardList,
  course: FolderOpen,
  schedule: CalendarDays,
}

export default function MaterialsPage() {
  const { isStaff } = useAuth()
  const { toast, confirm } = useToast()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const taskPath = isStaff ? '/staff/tasks' : '/student/tasks'
  const coursePath = isStaff ? '/staff/courses' : '/student/courses'
  const schedulePath = isStaff ? '/staff/schedules' : '/student/schedules'
  const materialPath = isStaff ? '/staff/materials' : '/student/materials'

  const { data: tasks, loading: loadingTasks } = useApiData(
    taskPath,
    { per_page: 200 },
    { allPages: true },
  )
  const { data: courses, loading: loadingCourses } = useApiData(
    coursePath,
    { per_page: 500 },
    { allPages: true },
  )
  const { data: schedules, loading: loadingSchedules } = useApiData(
    schedulePath,
    { per_page: 100 },
    { allPages: true },
  )
  const { data: manualMaterials, loading: loadingManual, refresh: refreshMaterials } = useApiData(
    materialPath,
    { per_page: 100 },
    { allPages: true },
  )

  const loading = loadingTasks || loadingCourses || loadingSchedules || loadingManual

  const materials = useMemo(
    () => buildLearningMaterials({ tasks, courses, schedules, manualMaterials }),
    [tasks, courses, schedules, manualMaterials],
  )

  const courseOptions = useMemo(() => {
    const options = new Map()
    materials.forEach((item) => {
      const key = item.course_id || item.course_name
      if (!key || options.has(key)) return
      options.set(key, {
        key,
        code: item.course_code,
        name: item.course_name,
      })
    })
    return Array.from(options.values()).sort((a, b) => a.name.localeCompare(b.name, 'id'))
  }, [materials])

  const filteredMaterials = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()

    return materials.filter((item) => {
      const itemCourseKey = item.course_id || item.course_name
      if (courseFilter !== 'all' && itemCourseKey !== courseFilter) return false
      if (!query) return true

      return [item.title, item.course_name, item.course_code, item.description, item.lecturer]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [materials, courseFilter, debouncedSearch])

  const groupedMaterials = useMemo(() => {
    const groups = new Map()

    filteredMaterials.forEach((item) => {
      const key = item.course_id || item.course_name
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          course_name: item.course_name,
          course_code: item.course_code,
          items: [],
        })
      }
      groups.get(key).items.push(item)
    })

    return Array.from(groups.values())
      .sort((a, b) => a.course_name.localeCompare(b.course_name, 'id'))
      .map((group) => ({
        ...group,
        items: [...group.items].sort(
          (a, b) =>
            (a.meeting_number ?? 999) - (b.meeting_number ?? 999) ||
            a.title.localeCompare(b.title, 'id'),
        ),
      }))
  }, [filteredMaterials])

  const taskMaterialCount = materials.filter((item) => item.sourceType === 'task').length
  const hasFilters = Boolean(search.trim() || courseFilter !== 'all')

  const resetFilters = () => {
    setSearch('')
    setCourseFilter('all')
  }

  const openCreate = () => {
    setEditingMaterial(null)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingMaterial(item.record || null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingMaterial(null)
  }

  const handleDelete = async (item) => {
    const id = item.record?.id
    if (!id) return

    const confirmed = await confirm({
      title: 'Hapus materi?',
      message: `Materi "${item.title}" akan dihapus dari halaman materi mahasiswa.`,
      confirmLabel: 'Hapus materi',
    })

    if (!confirmed) return

    try {
      await api.delete(`/staff/materials/${id}`)
      toast.success('Materi dihapus', 'Materi berhasil dihapus dari daftar.')
      refreshMaterials()
    } catch (deleteError) {
      toast.error('Gagal menghapus materi', errorMessage(deleteError))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Materi Perkuliahan"
        description={
          isStaff
            ? 'Kelola semua bahan ajar, tambahkan materi baru, dan bagikan tautannya langsung kepada mahasiswa.'
            : 'Semua modul, slide, silabus, dan bahan ajar dari dosen dalam satu halaman khusus. Buka materi langsung tanpa harus menelusuri daftar tugas.'
        }
        actions={
          isStaff ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah materi
            </Button>
          ) : null
        }
      />

      <MascotGif mascot="membaca" variant="banner" className="psy-page-mascot" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total materi</p>
            <p className="text-lg font-bold text-slate-900">{materials.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Mata kuliah</p>
            <p className="text-lg font-bold text-slate-900">{courseOptions.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Materi dari tugas</p>
            <p className="text-lg font-bold text-slate-900">{taskMaterialCount}</p>
          </div>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_18rem]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari judul materi, mata kuliah, atau dosen..."
            label="Cari materi perkuliahan"
          />
          <div>
            <label htmlFor="materials-course-filter" className="sr-only">
              Filter materi berdasarkan mata kuliah
            </label>
            <Select
              id="materials-course-filter"
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
            >
              <option value="all">Semua mata kuliah ({courseOptions.length})</option>
              {courseOptions.map((course) => (
                <option key={course.key} value={course.key}>
                  {course.code ? `${course.code} · ` : ''}
                  {course.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {!loading ? (
          <p className="text-xs text-slate-500" aria-live="polite">
            Menampilkan {filteredMaterials.length} dari {materials.length} materi
          </p>
        ) : null}
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-56" />
          ))}
        </div>
      ) : groupedMaterials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={hasFilters ? 'Tidak ada materi yang cocok' : 'Belum ada materi'}
          description={
            hasFilters
              ? 'Coba ubah kata kunci atau pilih mata kuliah lain untuk menemukan materi.'
              : isStaff
                ? 'Belum ada materi. Tambahkan materi pertama agar dapat diakses mahasiswa.'
                : 'Materi akan muncul di sini setelah dosen menambahkan tautan bahan ajar pada tugas, mata kuliah, atau jadwal.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset filter
              </Button>
            ) : isStaff ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah materi
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedMaterials.map((group) => {
            const sectionId = `materials-course-${String(group.key).replace(/[^a-zA-Z0-9_-]/g, '-')}`

            return (
              <section key={group.key} aria-labelledby={sectionId}>
                <div className="mb-2.5 flex items-center gap-3">
                  <h2 id={sectionId} className="text-sm font-bold text-slate-900">
                    {group.course_code ? `${group.course_code} · ` : ''}
                    {group.course_name}
                  </h2>
                  <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                  <span className="text-[11px] text-slate-400">
                    {group.items.length} materi
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => {
                    const SourceIcon = sourceIcons[item.sourceType] || BookOpen

                    return (
                      <Card
                        key={item.id}
                        className="group flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                              <SourceIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              {item.sourceLabel}
                            </span>
                            {item.meeting_number ? (
                              <Badge variant="neutral">Pertemuan {item.meeting_number}</Badge>
                            ) : null}
                          </div>

                          <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-teal-700">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {item.course_code ? `${item.course_code} · ` : ''}
                            {item.course_name}
                          </p>

                          {item.lecturer ? (
                            <p className="mt-1.5 truncate text-xs text-slate-500">
                              Dosen: <span className="font-semibold text-slate-700">{item.lecturer}</span>
                            </p>
                          ) : null}

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Buka materi ${item.title}`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-teal-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            Buka materi
                          </a>
                          {isStaff && item.sourceType === 'manual' && item.record ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(item)}
                                aria-label={`Edit materi ${item.title}`}
                                title="Edit materi"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(item)}
                                aria-label={`Hapus materi ${item.title}`}
                                title="Hapus materi"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              {item.sourceType === 'manual'
                                ? 'Materi dosen'
                                : item.sourceType === 'task'
                                  ? 'Tautan tugas'
                                  : item.sourceType === 'course'
                                    ? 'Berkas mata kuliah'
                                    : 'Bahan sesi kuliah'}
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {isStaff ? (
        <MaterialFormModal
          open={formOpen}
          material={editingMaterial}
          courses={courses || []}
          onClose={closeForm}
          onSaved={refreshMaterials}
        />
      ) : null}
    </div>
  )
}
