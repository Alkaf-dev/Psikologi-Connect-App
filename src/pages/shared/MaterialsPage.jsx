import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useApiData, useDebouncedValue } from '../../hooks/useApiData'
import { api, errorMessage } from '../../lib/api'
import { buildLearningMaterials } from '../../lib/materials'
import MaterialFormModal from '../../components/MaterialFormModal'
import MaterialCourseCard from '../../components/MaterialCourseCard'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChip,
  PageHeader,
  SearchInput,
  Skeleton,
} from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

const sourceIcons = {
  manual: BookOpen,
  course: FolderOpen,
  schedule: CalendarDays,
}

const sourceLabels = {
  manual: 'Materi dosen',
  course: 'Berkas mata kuliah',
  schedule: 'Bahan sesi kuliah',
}

export default function MaterialsPage() {
  const { isStaff } = useAuth()
  const { toast, confirm } = useToast()

  // Selected Course State (card click like Kelompok)
  const [selectedCourseKey, setSelectedCourseKey] = useState('')

  // Search & Filters
  const [search, setSearch] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState('all')

  const [formOpen, setFormOpen] = useState(false)
  const [formCourseId, setFormCourseId] = useState('')
  const [editingMaterial, setEditingMaterial] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const coursePath = isStaff ? '/staff/courses' : '/student/courses'
  const schedulePath = isStaff ? '/staff/schedules' : '/student/schedules'
  const materialPath = isStaff ? '/staff/materials' : '/student/materials'

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

  const loading = loadingCourses || loadingSchedules || loadingManual

  // All synthesized materials
  const allMaterials = useMemo(
    () =>
      buildLearningMaterials({
        courses,
        schedules,
        manualMaterials,
        includeTasks: false,
      }),
    [courses, schedules, manualMaterials],
  )

  // Map courses with material counts and items
  const courseCards = useMemo(() => {
    const courseMap = new Map()
    const courseList = Array.isArray(courses) ? courses : []

    // Initialize map from courses
    courseList.forEach((c) => {
      const key = String(c.id || c.name || '')
      if (!key) return
      courseMap.set(key, {
        key,
        id: String(c.id || ''),
        course_id: String(c.id || ''),
        name: c.name || c.course_name || 'Mata Kuliah',
        code: c.code || '',
        lecturer: c.lecturer || c.lecturer_name || '',
        class_name: c.class_name || '',
        credits: c.credits || 0,
        items: [],
        manual_count: 0,
        materials_count: 0,
      })
    })

    // Assign materials to their respective courses
    allMaterials.forEach((item) => {
      const key = String(item.course_id || item.course_name || '')
      if (!key) return

      if (!courseMap.has(key)) {
        courseMap.set(key, {
          key,
          id: String(item.course_id || ''),
          course_id: String(item.course_id || ''),
          name: item.course_name || 'Mata Kuliah',
          code: item.course_code || '',
          lecturer: item.lecturer || '',
          class_name: '',
          credits: 0,
          items: [],
          manual_count: 0,
          materials_count: 0,
        })
      }

      const entry = courseMap.get(key)
      entry.items.push(item)
      entry.materials_count += 1
      if (item.sourceType === 'manual') entry.manual_count += 1
    })

    return Array.from(courseMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'id'))
  }, [courses, allMaterials])

  // Filtered courses for level 1 (search)
  const filteredCourses = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) return courseCards

    return courseCards.filter((c) => {
      return [c.name, c.code, c.lecturer, c.class_name]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query))
    })
  }, [courseCards, debouncedSearch])

  // Currently selected course object
  const selectedCourse = useMemo(() => {
    if (!selectedCourseKey) return null
    return courseCards.find((c) => c.key === selectedCourseKey) || null
  }, [courseCards, selectedCourseKey])

  // Available meetings for selected course
  const courseMeetings = useMemo(() => {
    if (!selectedCourse) return []
    const meetings = new Set()
    selectedCourse.items.forEach((item) => {
      if (item.meeting_number) meetings.add(Number(item.meeting_number))
    })
    return Array.from(meetings).sort((a, b) => a - b)
  }, [selectedCourse])

  // Filtered materials inside selected course
  const selectedCourseMaterials = useMemo(() => {
    if (!selectedCourse) return []
    let list = [...selectedCourse.items]

    // Meeting filter
    if (selectedMeeting !== 'all') {
      list = list.filter((item) => Number(item.meeting_number) === Number(selectedMeeting))
    }

    // Search query within course
    const query = debouncedSearch.trim().toLowerCase()
    if (query) {
      list = list.filter((item) => {
        return [item.title, item.description, item.lecturer]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query))
      })
    }

    // Sort by meeting number, then title
    return list.sort(
      (a, b) =>
        (a.meeting_number ?? 999) - (b.meeting_number ?? 999) ||
        a.title.localeCompare(b.title, 'id'),
    )
  }, [selectedCourse, selectedMeeting, debouncedSearch])

  const manualCount = allMaterials.filter((item) => item.sourceType === 'manual').length

  const openCreate = (courseId = '') => {
    setEditingMaterial(null)
    setFormCourseId(courseId || selectedCourse?.course_id || '')
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingMaterial(item.record || null)
    setFormCourseId(item.course_id ? String(item.course_id) : '')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setFormCourseId('')
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

  const backToCourses = () => {
    setSelectedCourseKey('')
    setSelectedMeeting('all')
    setSearch('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akademik"
        title="Materi Perkuliahan"
        description={
          isStaff
            ? 'Kelola materi per mata kuliah, tambahkan bahan ajar, dan bagikan tautannya langsung kepada mahasiswa.'
            : 'Pilih mata kuliah untuk melihat seluruh modul, slide, silabus, dan materi pembelajaran.'
        }
        actions={
          isStaff ? (
            <Button onClick={() => openCreate(selectedCourse?.course_id || '')}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah materi</span>
            </Button>
          ) : null
        }
      />

      <MascotGif mascot="membaca" variant="banner" className="psy-page-mascot" />

      {/* Top Stat Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total materi</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{allMaterials.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Mata kuliah</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{courseCards.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Pencil className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Materi dosen</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{manualCount}</p>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : selectedCourse ? (
        /* ================================================================ */
        /* LEVEL 2: DETAIL MATERI MATA KULIAH TERPILIH                      */
        /* ================================================================ */
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar: Tombol Kembali & Info Mata Kuliah */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="secondary" size="sm" onClick={backToCourses} className="shrink-0">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali</span>
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {selectedCourse.code && <Badge variant="neutral">{selectedCourse.code}</Badge>}
                  <h2 className="text-base sm:text-lg font-bold leading-tight text-slate-900 dark:text-white truncate">
                    {selectedCourse.name}
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                  {[
                    selectedCourse.lecturer ? `Dosen: ${selectedCourse.lecturer}` : null,
                    selectedCourse.class_name ? `Kelas ${selectedCourse.class_name}` : null,
                    selectedCourse.credits ? `${selectedCourse.credits} SKS` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="info">{selectedCourse.materials_count} materi</Badge>
              {isStaff && (
                <Button size="sm" onClick={() => openCreate(selectedCourse.course_id || '')}>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Materi</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search & Filter Pertemuan Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="w-full sm:max-w-md">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Cari materi pertemuan ini..."
                />
              </div>

              {courseMeetings.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs overflow-x-auto pb-1">
                  <span className="font-semibold text-slate-400 shrink-0">Pertemuan:</span>
                  <FilterChip
                    active={selectedMeeting === 'all'}
                    onClick={() => setSelectedMeeting('all')}
                  >
                    Semua
                  </FilterChip>
                  {courseMeetings.map((num) => (
                    <FilterChip
                      key={num}
                      active={Number(selectedMeeting) === num}
                      onClick={() => setSelectedMeeting(String(num))}
                    >
                      P-{num}
                    </FilterChip>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid Materi untuk Mata Kuliah ini */}
          {selectedCourseMaterials.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
              <MascotGif mascot="berpikir" variant="empty" className="mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {search || selectedMeeting !== 'all'
                  ? 'Tidak ada materi yang sesuai'
                  : 'Belum ada materi untuk mata kuliah ini'}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {search || selectedMeeting !== 'all'
                  ? 'Coba ubah kata kunci pencarian atau pilih pertemuan lain.'
                  : isStaff
                    ? 'Tambahkan materi modul atau tautan Google Drive pertama untuk mahasiswa.'
                    : 'Materi akan tampil di sini setelah dosen mengunggah bahan ajar perkuliahan.'}
              </p>
              {isStaff && (
                <div className="mt-4">
                  <Button size="sm" onClick={() => openCreate(selectedCourse.course_id || '')}>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Materi Pertama</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCourseMaterials.map((item) => {
                const SourceIcon = sourceIcons[item.sourceType] || BookOpen
                const isManual = item.sourceType === 'manual'

                return (
                  <Card
                    key={item.id}
                    className="group flex flex-col justify-between p-4 transition duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          <SourceIcon className="h-3 w-3" />
                          <span>{sourceLabels[item.sourceType] || 'Materi'}</span>
                        </span>

                        {item.meeting_number && (
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                            Pertemuan {item.meeting_number}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-1.5 text-xs font-semibold transition shadow-2xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Buka Materi</span>
                      </a>

                      {/* Staff Edit & Delete if manual material */}
                      {isStaff && isManual && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit materi"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Hapus materi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================================================================ */
        /* LEVEL 1: GRID KARTU MATA KULIAH (PERSIS SEPERTI DI KELOMPOK)     */
        /* ================================================================ */
        <div className="space-y-4">
          <Card className="p-3.5">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari mata kuliah untuk melihat materi..."
            />
          </Card>

          {filteredCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Mata kuliah tidak ditemukan"
              description="Coba gunakan kata kunci pencarian yang lain."
              action={
                <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                  Reset pencarian
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
              {filteredCourses.map((course) => (
                <MaterialCourseCard
                  key={course.key}
                  course={course}
                  onSelect={(key) => {
                    setSelectedCourseKey(key)
                    setSearch('')
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Form Tambah / Edit Materi */}
      <MaterialFormModal
        open={formOpen}
        material={editingMaterial}
        courses={courses || []}
        initialCourseId={formCourseId}
        onClose={closeForm}
        onSaved={refreshMaterials}
      />
    </div>
  )
}
