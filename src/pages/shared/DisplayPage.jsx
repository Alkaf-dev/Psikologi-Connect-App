import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  Info,
  Laptop,
  LogIn,
  Megaphone,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Timer,
  User,
  UsersRound,
  Video,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate, formatDateTime } from '../../lib/utils'
import { Button, Modal, SearchInput, Skeleton } from '../../components/ui'
import { getMascot } from '../../lib/mascots'
import { buildLearningMaterials } from '../../lib/materials'
import MaterialCourseCard from '../../components/MaterialCourseCard'

function MascotCharacter({ name, className = 'h-14 w-auto object-contain', loading = 'lazy' }) {
  const asset = getMascot(name)
  if (!asset) return null
  return (
    <img
      src={asset.webp || asset.gif || asset.poster}
      alt=""
      aria-hidden="true"
      width={asset.width}
      height={asset.height}
      className={className}
      draggable={false}
      loading={loading}
      decoding="async"
    />
  )
}

const DISPLAY_TAB_ORDER = ['schedules', 'tasks', 'materials', 'announcements', 'tips', 'guidelines']

// Minimalist self-care tips
const PSYCHOLOGY_TIPS = [
  {
    id: 1,
    title: 'Teknik Pomodoro',
    quote: '25 menit fokus belajar, 5 menit jeda istirahat. Mengistirahatkan pikiran secara teratur terbukti menjaga daya konsentrasi tetap optimal.',
    category: 'Manajemen Fokus',
    mascot: 'minum',
  },
  {
    id: 2,
    title: 'Pernapasan Sadar 4-7-8',
    quote: 'Tarik napas 4 detik, tahan 7 detik, dan hembuskan perlahan 8 detik. Praktik sederhana ini efektif menenangkan saraf dan detak jantung.',
    category: 'Mindfulness',
    mascot: 'memeluk-hati',
  },
  {
    id: 3,
    title: 'Kecukupan Hidrasi',
    quote: 'Dehidrasi ringan 2% dapat menurunkan ketelitian hingga 20%. Selalu sediakan air minum saat beraktivitas dan belajar.',
    category: 'Kebugaran',
    mascot: 'semangat',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20',
    quote: 'Tiap 20 menit menatap layar monitor atau ponsel, alihkan pandangan ke objek berjarak 6 meter selama 20 detik agar otot mata tetap rileks.',
    category: 'Kesehatan Mata',
    mascot: 'laptop',
  },
]

// Helper for parsing date strings safely
function parseDeadlineDate(dl) {
  if (!dl) return null
  const sanitized = String(dl).replace(' ', 'T')
  const date = new Date(sanitized)
  return isNaN(date.getTime()) ? new Date(dl) : date
}

// Deadline Urgency Calculator
function calculateTaskUrgency(deadline, currentTime) {
  const dlDate = parseDeadlineDate(deadline)
  if (!dlDate || isNaN(dlDate.getTime())) {
    return {
      urgency: 'none',
      badgeTone: 'neutral',
      badgeLabel: 'Tanpa Tenggat',
      countdown: 'Fleksibel',
      isOverdue: false,
      isCritical: false,
      isApproaching: false,
      diffHours: 99999,
      formattedDeadline: 'Tidak ada tenggat waktu',
    }
  }

  const diffMs = dlDate.getTime() - currentTime.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = Math.floor(diffHours / 24)
  const remHours = Math.floor(diffHours % 24)
  const remMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  const formattedDeadline = dlDate.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB'

  if (diffMs < 0) {
    return {
      urgency: 'overdue',
      badgeTone: 'danger',
      badgeLabel: 'Lewat Tenggat',
      countdown: 'Telah lewat',
      isOverdue: true,
      isCritical: false,
      isApproaching: false,
      diffHours,
      formattedDeadline,
    }
  }

  // < 24 Hours: Kritis
  if (diffHours <= 24) {
    return {
      urgency: 'critical',
      badgeTone: 'danger',
      badgeLabel: 'Hari Ini!',
      countdown: `Sisa ${Math.max(0, remHours)}j ${Math.max(0, remMinutes)}m`,
      isOverdue: false,
      isCritical: true,
      isApproaching: false,
      diffHours,
      formattedDeadline,
    }
  }

  // < 72 Hours (3 Days): Mendekati
  if (diffHours <= 72) {
    return {
      urgency: 'approaching',
      badgeTone: 'warning',
      badgeLabel: `${diffDays} Hari Lagi`,
      countdown: `Sisa ${diffDays}h ${remHours}j`,
      isOverdue: false,
      isCritical: false,
      isApproaching: true,
      diffHours,
      formattedDeadline,
    }
  }

  // Normal: > 3 Days
  return {
    urgency: 'normal',
    badgeTone: 'info',
    badgeLabel: `${diffDays} Hari Lagi`,
    countdown: `${diffDays} hari lagi`,
    isOverdue: false,
    isCritical: false,
    isApproaching: false,
    diffHours,
    formattedDeadline,
  }
}

export default function DisplayPage() {
  const { user, isStaff } = useAuth()
  const location = useLocation()
  const isStandaloneRoute = location.pathname === '/display'

  // Tabs: 'schedules' | 'tasks' | 'materials' | 'announcements' | 'tips' | 'guidelines'
  const [activeTab, setActiveTab] = useState('schedules')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Device view mode: 'auto' | 'web' | 'mobile'
  const [deviceMode, setDeviceMode] = useState('auto')
  const [isScreenMobile, setIsScreenMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )

  useEffect(() => {
    const handleResize = () => setIsScreenMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobileView = deviceMode === 'auto' ? isScreenMobile : deviceMode === 'mobile'

  // Selected schedule item for Group Detail Modal
  const [selectedGroupCourse, setSelectedGroupCourse] = useState(null)
  // Selected task for Task Detail Modal
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null)
  // State for dismissing the top reminder banner
  const [isReminderDismissed, setIsReminderDismissed] = useState(false)

  // Filters for Tasks tab
  const [taskFilterCourse, setTaskFilterCourse] = useState('all')
  const [taskFilterType, setTaskFilterType] = useState('all')
  const [taskFilterUrgency, setTaskFilterUrgency] = useState('all')
  const [taskSearch, setTaskSearch] = useState('')

  // Filters for Materials tab
  const [selectedMaterialCourseKey, setSelectedMaterialCourseKey] = useState('')
  const [materialFilterCourse, setMaterialFilterCourse] = useState('all')
  const [materialSearch, setMaterialSearch] = useState('')

  const [tipIndex, setTipIndex] = useState(0)
  const [tipsPaused, setTipsPaused] = useState(false)
  const [tipsFocused, setTipsFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  // Cycle tips every 10s unless paused, focused, or the user prefers reduced motion
  useEffect(() => {
    if (tipsPaused || tipsFocused || prefersReducedMotion) return undefined
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % PSYCHOLOGY_TIPS.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [tipsPaused, tipsFocused, prefersReducedMotion])

  // --------------------------------------------------------------------------
  // INTEGRASI TABEL DATABASE ASLI
  // --------------------------------------------------------------------------
  const schedulePath = user ? (isStaff ? '/staff/schedules' : '/student/schedules') : null
  const coursePath = user ? (isStaff ? '/staff/courses' : '/student/courses') : null
  const groupPath = user ? (isStaff ? '/staff/groups' : '/student/groups') : null
  const taskPath = user ? (isStaff ? '/staff/tasks' : '/student/tasks') : null
  const materialPath = user ? (isStaff ? '/staff/materials' : '/student/materials') : null

  // 1. Tabel Jadwal
  const {
    data: rawSchedules,
    loading: loadingSchedules,
    refresh: refreshSchedules,
  } = useApiData(schedulePath, { per_page: 100 }, { allPages: true, enabled: Boolean(user && schedulePath) })

  // 2. Tabel Mata Kuliah
  const {
    data: rawCourses,
    loading: loadingCourses,
    refresh: refreshCourses,
  } = useApiData(coursePath, { per_page: 500 }, { allPages: true, enabled: Boolean(user && coursePath) })

  // 3. Tabel Kelompok
  const {
    data: rawGroups,
    loading: loadingGroups,
    refresh: refreshGroups,
  } = useApiData(groupPath, { per_page: 500, with_members: 1 }, { allPages: true, enabled: Boolean(user && groupPath) })

  // 4. Tabel Tugas & Materi Perkuliahan
  const {
    data: rawTasks,
    loading: loadingTasks,
    refresh: refreshTasks,
  } = useApiData(taskPath, { per_page: 200 }, { allPages: true, enabled: Boolean(user && taskPath) })

  // 5. Tabel Materi Perkuliahan
  const {
    data: rawMaterials,
    loading: loadingMaterials,
    refresh: refreshMaterials,
  } = useApiData(materialPath, { per_page: 100 }, { allPages: true, enabled: Boolean(user && materialPath) })

  // 6. Tabel Pengumuman
  const {
    data: announcements,
    loading: loadingAnnouncements,
    refresh: refreshAnnouncements,
  } = useApiData('/announcements', { per_page: 10, sort: 'published_at', direction: 'desc' })

  // Refresh all tables
  const refreshAll = () => {
    refreshSchedules()
    refreshCourses()
    refreshGroups()
    refreshTasks()
    refreshMaterials()
    refreshAnnouncements()
  }

  const isSyncing =
    loadingSchedules ||
    loadingCourses ||
    loadingGroups ||
    loadingTasks ||
    loadingMaterials ||
    loadingAnnouncements

  // Detect current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const currentDayName = dayNames[currentTime.getDay()]

  // --------------------------------------------------------------------------
  // ASSEMBLE LIVE SCHEDULES
  // --------------------------------------------------------------------------
  const allSchedules = useMemo(() => {
    const rawList = Array.isArray(rawSchedules) ? rawSchedules : []
    const coursesMap = new Map((rawCourses || []).map((c) => [String(c.id), c]))

    const groupsMap = new Map()
    ;(rawGroups || []).forEach((g) => {
      const cId = String(g.course_id || '')
      if (!cId) return
      if (!groupsMap.has(cId)) groupsMap.set(cId, [])
      groupsMap.get(cId).push(g)
    })

    const tasksMap = new Map()
    ;(rawTasks || []).forEach((t) => {
      const cId = String(t.course_id || '')
      if (!cId) return
      if (!tasksMap.has(cId)) tasksMap.set(cId, [])
      tasksMap.get(cId).push(t)
    })

    return rawList.map((sch) => {
      const course = coursesMap.get(String(sch.course_id)) || sch.course || {}
      const groupsForCourse = groupsMap.get(String(sch.course_id)) || []

      const realGroups = groupsForCourse.map((g, gIdx) => ({
        id: g.id,
        name: g.name || `Kelompok ${gIdx + 1}`,
        topic: g.topic || g.title || '',
        leader:
          g.members?.find((m) => m.role === 'ketua')?.name ||
          g.leader_name ||
          g.members?.[0]?.name ||
          '',
        members: (g.members || []).map((m) => (typeof m === 'object' ? m.name : m)),
      }))

      return {
        id: sch.id,
        day: sch.day || '',
        start_time: (sch.start_time || '').slice(0, 5),
        end_time: (sch.end_time || '').slice(0, 5),
        mode: sch.mode || 'offline',
        class_name: sch.class_name || course.class_name || '',
        course_id: String(sch.course_id || course.id || ''),
        course_code: sch.course_code || course.code || '',
        course_name: sch.course_name || course.name || 'Mata Kuliah',
        lecturer_name: sch.lecturer_name || sch.course_lecturer || course.lecturer || '',
        credits: sch.credits || course.credits || 0,
        attendance_link: sch.attendance_link || course.attendance_link || '',
        material_link:
          sch.material_link ||
          course.material_link ||
          '',
        meeting_link: sch.meeting_link || course.meeting_link || '',
        groups: realGroups,
      }
    })
  }, [rawSchedules, rawCourses, rawGroups])

  // Filtered schedules by day
  const [selectedDay, setSelectedDay] = useState('today')

  const displayedSchedules = useMemo(() => {
    if (selectedDay === 'today') {
      return allSchedules.filter(
        (item) => (item.day || '').toLowerCase() === currentDayName.toLowerCase(),
      )
    }
    if (selectedDay === 'all') {
      return allSchedules
    }
    return allSchedules.filter(
      (item) => (item.day || '').toLowerCase() === selectedDay.toLowerCase(),
    )
  }, [allSchedules, selectedDay, currentDayName])

  // --------------------------------------------------------------------------
  // ASSEMBLE TASKS & DEADLINE REMINDERS
  // --------------------------------------------------------------------------
  const allTasks = useMemo(() => {
    const list = Array.isArray(rawTasks) ? rawTasks : []
    const coursesMap = new Map((rawCourses || []).map((c) => [String(c.id), c]))

    return list.map((task) => {
      const course = coursesMap.get(String(task.course_id)) || {}
      const urgency = calculateTaskUrgency(task.deadline, currentTime)
      const isGroup = task.type === 'kelompok'

      // Resolved group label
      const groupNames = Array.isArray(task.group_names) ? task.group_names : []
      const groupLabel =
        task.resolved_group_name ||
        (groupNames.length > 0 ? groupNames.join(', ') : null) ||
        (task.group_name && task.group_name !== 'Semua mahasiswa' ? task.group_name : null) ||
        (isGroup ? 'Semua kelompok' : null)

      return {
        ...task,
        course_name: task.course_name || course.name || 'Mata Kuliah',
        course_code: task.course_code || course.code || '',
        lecturer_name: course.lecturer || '',
        urgency,
        groupLabel,
        material_link: task.attachment_url || task.material_url || '',
      }
    })
  }, [rawTasks, rawCourses, currentTime])

  // Urgent tasks approaching deadline (< 72 hours)
  const urgentTasks = useMemo(() => {
    return allTasks
      .filter((t) => t.urgency.isCritical || t.urgency.isApproaching)
      .sort((a, b) => a.urgency.diffHours - b.urgency.diffHours)
  }, [allTasks])

  // Filtered tasks for the Tasks tab
  const displayedTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Course filter
      if (taskFilterCourse !== 'all' && String(task.course_id) !== String(taskFilterCourse)) {
        return false
      }
      // Type filter
      if (taskFilterType === 'individu' && task.type === 'kelompok') return false
      if (taskFilterType === 'kelompok' && task.type !== 'kelompok') return false
      // Urgency filter
      if (taskFilterUrgency === 'critical' && !task.urgency.isCritical) return false
      if (taskFilterUrgency === 'approaching' && !task.urgency.isApproaching) return false
      if (taskFilterUrgency === 'overdue' && !task.urgency.isOverdue) return false
      if (taskFilterUrgency === 'active' && task.urgency.isOverdue) return false
      // Search
      if (taskSearch.trim()) {
        const query = taskSearch.toLowerCase()
        const matchTitle = (task.title || '').toLowerCase().includes(query)
        const matchCourse = (task.course_name || '').toLowerCase().includes(query)
        const matchCode = (task.course_code || '').toLowerCase().includes(query)
        const matchDesc = (task.description || '').toLowerCase().includes(query)
        if (!matchTitle && !matchCourse && !matchCode && !matchDesc) return false
      }
      return true
    })
  }, [allTasks, taskFilterCourse, taskFilterType, taskFilterUrgency, taskSearch])

  // --------------------------------------------------------------------------
  // ASSEMBLE LEARNING MATERIALS (MATERI PERKULIAHAN)
  // Strictly from the Materials page sources (courses, schedules, manual materials)
  // excluding task attachments to keep it clean and separated from tasks
  // --------------------------------------------------------------------------
  const materialsList = useMemo(
    () =>
      buildLearningMaterials({
        courses: rawCourses,
        schedules: rawSchedules,
        manualMaterials: rawMaterials,
        includeTasks: false,
      }),
    [rawCourses, rawSchedules, rawMaterials],
  )

  // Map courses with material counts (like Kelompok)
  const materialCourseCards = useMemo(() => {
    const courseMap = new Map()
    const courseList = Array.isArray(rawCourses) ? rawCourses : []

    courseList.forEach((c) => {
      const key = String(c.id || c.name || '')
      if (!key) return
      courseMap.set(key, {
        key,
        id: String(c.id || ''),
        name: c.name || 'Mata Kuliah',
        code: c.code || '',
        lecturer: c.lecturer || '',
        class_name: c.class_name || '',
        items: [],
        manual_count: 0,
        materials_count: 0,
      })
    })

    materialsList.forEach((item) => {
      const key = String(item.course_id || item.course_name || '')
      if (!key) return

      if (!courseMap.has(key)) {
        courseMap.set(key, {
          key,
          id: String(item.course_id || ''),
          name: item.course_name || 'Mata Kuliah',
          code: item.course_code || '',
          lecturer: item.lecturer || '',
          class_name: '',
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
  }, [rawCourses, materialsList])

  const selectedMaterialCourse = useMemo(() => {
    if (!selectedMaterialCourseKey) return null
    return materialCourseCards.find((c) => c.key === selectedMaterialCourseKey) || null
  }, [materialCourseCards, selectedMaterialCourseKey])

  // Filtered materials
  const displayedMaterials = useMemo(() => {
    let list = selectedMaterialCourse ? selectedMaterialCourse.items : materialsList

    if (materialFilterCourse !== 'all' && !selectedMaterialCourse) {
      list = list.filter((item) => item.course_id === String(materialFilterCourse))
    }

    if (materialSearch.trim()) {
      const query = materialSearch.toLowerCase()
      list = list.filter((item) => {
        const matchTitle = (item.title || '').toLowerCase().includes(query)
        const matchCourse = (item.course_name || '').toLowerCase().includes(query)
        const matchCode = (item.course_code || '').toLowerCase().includes(query)
        const matchDesc = (item.description || '').toLowerCase().includes(query)
        return matchTitle || matchCourse || matchCode || matchDesc
      })
    }

    return list
  }, [materialsList, selectedMaterialCourse, materialFilterCourse, materialSearch])

  const timeString = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateString = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const activeTip = PSYCHOLOGY_TIPS[tipIndex]

  // Distinct courses for filter dropdowns
  const availableCourses = useMemo(() => {
    return Array.isArray(rawCourses) ? rawCourses : []
  }, [rawCourses])

  const handleTabKeyDown = (event) => {
    const currentIndex = DISPLAY_TAB_ORDER.indexOf(activeTab)
    let nextIndex = null
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % DISPLAY_TAB_ORDER.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + DISPLAY_TAB_ORDER.length) % DISPLAY_TAB_ORDER.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = DISPLAY_TAB_ORDER.length - 1
    if (nextIndex === null) return
    event.preventDefault()
    const nextTab = DISPLAY_TAB_ORDER[nextIndex]
    setActiveTab(nextTab)
    requestAnimationFrame(() => document.getElementById(`display-tab-${nextTab}`)?.focus())
  }

  return (
    <div
      className={`fi-display-page min-h-screen ${
        isStandaloneRoute
          ? 'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 sm:p-6 lg:p-8'
          : 'text-slate-900 dark:text-slate-100 space-y-6'
      }`}
    >
      <div
        className={
          deviceMode === 'mobile' && !isScreenMobile
            ? 'max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-300 dark:border-slate-700 shadow-2xl p-4 sm:p-5 my-6'
            : 'max-w-6xl mx-auto space-y-5'
        }
      >
        {/* ============================================================== */}
        {/* 1. LARAVEL FILAMENT V5 / PRO-MAX PAGE HEADER                  */}
        {/* ============================================================== */}
        <header className="fi-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-200 dark:border-white/10">
          <div>
            {/* Filament Breadcrumbs */}
            <nav className="fi-breadcrumbs mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>Beranda</span>
              <span>/</span>
              <span>Akademik</span>
              <span>/</span>
              <span className="text-teal-700 dark:text-teal-400 font-semibold">Display Informasi</span>
            </nav>

            <h1 className="fi-header-heading text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
              Display Informasi Akademik
            </h1>
            <p className="fi-header-subheading text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Program Studi Psikologi Islam • STIT Muhammadiyah Kediri
            </p>
          </div>

          {/* Filament Header Action Group */}
          <div className="fi-header-actions flex flex-wrap items-center gap-2.5">
            {/* Filament Status Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span>Hari Ini: {currentDayName}</span>
            </span>

            {/* Filament Digital Clock Pill */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 shadow-xs">
              <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
              <span className="tabular-nums">{timeString} WIB</span>
            </div>

            {/* Filament Segmented Button (Auto | Web | HP) */}
            <div
              className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700/60 shadow-xs"
              role="group"
              aria-label="Mode tampilan perangkat"
            >
              <button
                type="button"
                onClick={() => setDeviceMode('auto')}
                aria-pressed={deviceMode === 'auto'}
                aria-label="Tampilan otomatis mengikuti ukuran layar"
                className={`inline-flex min-h-9 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  deviceMode === 'auto'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Otomatis mengikuti ukuran layar"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                <span className="hidden sm:inline">Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('web')}
                aria-pressed={deviceMode === 'web'}
                className={`inline-flex min-h-9 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  deviceMode === 'web'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Tampilan Desktop / Web"
              >
                <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Web</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                aria-pressed={deviceMode === 'mobile'}
                className={`inline-flex min-h-9 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Tampilan Ponsel / HP"
              >
                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                <span>HP</span>
              </button>
            </div>

            {/* Sync Database Button */}
            {user && (
              <button
                type="button"
                onClick={refreshAll}
                disabled={isSyncing}
                className="inline-flex h-11 w-11 items-center justify-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer"
                title="Sinkronkan data dari tabel database"
                aria-label={isSyncing ? 'Menyinkronkan data' : 'Sinkronkan data dari tabel database'}
              >
                <RotateCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            )}

            {/* Standalone Route Portal Button */}
            {isStandaloneRoute ? (
              user ? (
                <Link
                  to={isStaff ? '/admin' : '/portal'}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  <span>Portal</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Masuk</span>
                </Link>
              )
            ) : null}
          </div>
        </header>

        {/* ============================================================== */}
        {/* 2. PENGINGAT TUGAS / DEADLINE REMINDER HERO WIDGET             */}
        {/* ============================================================== */}
        {user && urgentTasks.length > 0 && !isReminderDismissed && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 dark:border-amber-500/50 bg-gradient-to-r from-amber-50 via-teal-50/50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-teal-950/20 p-4 sm:p-5 shadow-sm transition-all animate-fade-in">
            {/* Top decorative badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-600">
                  <Flame className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 inline-flex h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                      <Timer className="h-3 w-3" />
                      Pengingat Tenggat Tugas ({urgentTasks.length})
                    </span>
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      Tugas perlu perhatian segera!
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {urgentTasks[0].title}{' '}
                    <span className="font-normal text-slate-600 dark:text-slate-400">
                      ({urgentTasks[0].course_name})
                    </span>
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                      <Clock className="h-3.5 w-3.5" />
                      {urgentTasks[0].urgency.countdown}
                    </span>
                    <span>•</span>
                    <span>Batas Akhir: {urgentTasks[0].urgency.formattedDeadline}</span>
                    {urgentTasks[0].type === 'kelompok' && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 text-[11px] font-semibold">
                          <UsersRound className="h-3 w-3" aria-hidden="true" />
                          Tugas Kelompok
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('tasks')
                    setTaskFilterUrgency('critical')
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>Lihat Semua ({urgentTasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReminderDismissed(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Sembunyikan notifikasi ini"
                  aria-label="Sembunyikan pengingat tenggat tugas"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Public Guest Callout if not logged in */}
        {!user && (
          <div className="rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MascotCharacter name="melambai" className="h-12 w-auto shrink-0" loading="eager" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Selamat Datang di Portal Display Akademik
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Masuk dengan akun terdaftar untuk melihat jadwal harian lengkap, mengakses materi perkuliahan, dan memantau tugas Anda.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 text-xs font-semibold transition shrink-0"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>Masuk Sekarang</span>
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. LARAVEL FILAMENT V5 STYLE TABS (PRO-MAX NAVIGATION)        */}
        {/* ============================================================== */}
        <div className="fi-tabs border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 overflow-x-auto">
          <nav
            role="tablist"
            aria-label="Bagian display informasi"
            onKeyDown={handleTabKeyDown}
            className="-mb-px flex gap-x-5 sm:gap-x-6 min-w-max"
          >
            {[
              {
                id: 'schedules',
                title: 'Jadwal Kuliah',
                count: displayedSchedules.length,
                icon: CalendarDays,
                alertDot: false,
              },
              {
                id: 'tasks',
                title: 'Tugas Kuliah',
                count: allTasks.length,
                icon: FileText,
                alertDot: urgentTasks.length > 0,
              },
              {
                id: 'materials',
                title: 'Materi Kuliah',
                count: materialsList.length,
                icon: BookOpen,
                alertDot: false,
              },
              {
                id: 'announcements',
                title: 'Pengumuman',
                count: (announcements || []).length,
                icon: Megaphone,
                alertDot: false,
              },
              {
                id: 'tips',
                title: 'Tips Belajar',
                count: null,
                icon: Sparkles,
                alertDot: false,
              },
              {
                id: 'guidelines',
                title: 'Ketentuan Studi',
                count: null,
                icon: Bell,
                alertDot: false,
              },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`display-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`display-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex min-h-11 items-center gap-2 pb-3.5 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
                    isActive
                      ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{tab.title}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.alertDot && (
                    <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* ============================================================== */}
        {/* 4. TAB 1: JADWAL KULIAH                                        */}
        {/* ============================================================== */}
        {activeTab === 'schedules' && (
          <div
            role="tabpanel"
            id="display-panel-schedules"
            aria-labelledby="display-tab-schedules"
            className="space-y-4"
          >
            <h2 className="sr-only">Jadwal Kuliah</h2>
            {/* Filter Hari */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-semibold text-slate-500 mr-1 shrink-0">Pilih Hari:</span>
              {[
                { id: 'today', label: `Hari Ini (${currentDayName})` },
                { id: 'Senin', label: 'Senin' },
                { id: 'Selasa', label: 'Selasa' },
                { id: 'Rabu', label: 'Rabu' },
                { id: 'Kamis', label: 'Kamis' },
                { id: 'Jumat', label: 'Jumat' },
                { id: 'Sabtu', label: 'Sabtu' },
                { id: 'all', label: 'Semua Hari' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDay(d.id)}
                  aria-pressed={selectedDay === d.id}
                  className={`min-h-11 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                    selectedDay === d.id
                      ? 'bg-teal-800 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {loadingSchedules ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
              </div>
            ) : displayedSchedules.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
                <MascotCharacter name="tertidur" className="h-20 w-auto mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tidak Ada Jadwal Kuliah pada {selectedDay === 'today' ? `Hari Ini (${currentDayName})` : `Hari ${selectedDay}`}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Tidak ada sesi perkuliahan aktif yang dijadwalkan pada hari ini di sistem. Anda dapat memilih hari lain di atas untuk melihat materi dan presensi.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-3.5 ${
                  isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {displayedSchedules.map((item, idx) => {
                  const isOnline = item.mode === 'online'
                  const groupCount = item.groups ? item.groups.length : 0

                  return (
                    <div
                      key={item.id || idx}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-md"
                    >
                      <div>
                        {/* Time & Mode Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold tabular-nums text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                            {item.start_time} - {item.end_time} WIB
                          </span>

                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isOnline
                                ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isOnline ? 'Online Zoom' : 'Tatap Muka'}
                          </span>
                        </div>

                        {/* Course Name & Details */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {item.course_name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.course_code && <span>{item.course_code}</span>}
                          {item.credits > 0 && <span>• {item.credits} SKS</span>}
                          {item.class_name && <span>• Kelas {item.class_name}</span>}
                        </div>

                        {item.lecturer_name && (
                          <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 truncate">
                            Dosen: <strong>{item.lecturer_name}</strong>
                          </p>
                        )}
                      </div>

                      {/* Action Links: Presensi, Materi, Kelompok, Virtual */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* 1. Presensi */}
                          {item.attendance_link ? (
                            <a
                              href={item.attendance_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 px-2.5 py-2 text-xs font-semibold transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                              <span>Presensi</span>
                            </a>
                          ) : (
                            <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs py-2">
                              Presensi Kelas
                            </span>
                          )}

                          {/* 2. Materi */}
                          {(() => {
                            const courseKey = String(item.course_id || item.course_name || '')
                            const cCard = materialCourseCards.find(
                              (c) => c.key === courseKey || c.name === item.course_name,
                            )
                            const mCount = cCard?.materials_count || 0

                            if (mCount > 0 || item.material_link) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (cCard?.key) {
                                      setSelectedMaterialCourseKey(cCard.key)
                                    } else if (courseKey) {
                                      setSelectedMaterialCourseKey(courseKey)
                                    }
                                    setActiveTab('materials')
                                  }}
                                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 px-2.5 py-2 text-xs font-semibold transition cursor-pointer"
                                  title="Buka materi mata kuliah ini di tab Materi Kuliah"
                                >
                                  <BookOpen className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                                  <span>Materi {mCount > 0 ? `(${mCount})` : ''}</span>
                                </button>
                              )
                            }

                            return (
                              <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs py-2">
                                Materi Tatap Muka
                              </span>
                            )
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {/* 3. Kelompok */}
                          <button
                            type="button"
                            onClick={() => setSelectedGroupCourse(item)}
                            aria-haspopup="dialog"
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-semibold transition cursor-pointer"
                          >
                            <UsersRound className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                            <span>Kelompok ({groupCount})</span>
                          </button>

                          {/* 4. Kelas Online */}
                          {item.meeting_link ? (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 px-2.5 py-2 text-xs font-semibold transition"
                            >
                              <Video className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                              <span>Masuk Zoom</span>
                            </a>
                          ) : (
                            <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs py-2">
                              Tatap Muka
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. TAB 2: TUGAS KULIAH & PENGINGAT TENGGAT (PRO-MAX)           */}
        {/* ============================================================== */}
        {activeTab === 'tasks' && (
          <div
            role="tabpanel"
            id="display-panel-tasks"
            aria-labelledby="display-tab-tasks"
            className="space-y-4"
          >
            <h2 className="sr-only">Tugas Kuliah</h2>
            {/* Quick Urgency & Type Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1 shrink-0">Filter Tugas:</span>
              <button
                type="button"
                onClick={() => {
                  setTaskFilterUrgency('all')
                  setTaskFilterType('all')
                }}
                aria-pressed={taskFilterUrgency === 'all' && taskFilterType === 'all'}
                className={`min-h-11 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                  taskFilterUrgency === 'all' && taskFilterType === 'all'
                    ? 'bg-teal-800 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                Semua Tugas ({allTasks.length})
              </button>

              <button
                type="button"
                onClick={() => setTaskFilterUrgency('critical')}
                aria-pressed={taskFilterUrgency === 'critical'}
                className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                  taskFilterUrgency === 'critical'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                <Flame className="h-3 w-3" aria-hidden="true" />
                <span>Mendesak / Hari Ini ({allTasks.filter((t) => t.urgency.isCritical).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskFilterUrgency('approaching')}
                aria-pressed={taskFilterUrgency === 'approaching'}
                className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                  taskFilterUrgency === 'approaching'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                }`}
              >
                <Timer className="h-3 w-3" aria-hidden="true" />
                <span>Mendekati Tenggat ({allTasks.filter((t) => t.urgency.isApproaching).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskFilterType('kelompok')}
                aria-pressed={taskFilterType === 'kelompok'}
                className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                  taskFilterType === 'kelompok'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                }`}
              >
                <UsersRound className="h-3 w-3" aria-hidden="true" />
                <span>Tugas Kelompok ({allTasks.filter((t) => t.type === 'kelompok').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskFilterType('individu')}
                aria-pressed={taskFilterType === 'individu'}
                className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 font-semibold transition cursor-pointer ${
                  taskFilterType === 'individu'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                }`}
              >
                <span>Tugas Individu ({allTasks.filter((t) => t.type !== 'kelompok').length})</span>
              </button>
            </div>

            {/* Search and Course Filter Row */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <SearchInput
                  value={taskSearch}
                  onChange={setTaskSearch}
                  placeholder="Cari judul tugas, mata kuliah, atau instruksi..."
                  label="Cari tugas kuliah"
                />
              </div>

              <div>
                <label htmlFor="task-course-filter" className="sr-only">
                  Filter tugas berdasarkan mata kuliah
                </label>
                <select
                  id="task-course-filter"
                  value={taskFilterCourse}
                  onChange={(e) => setTaskFilterCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:border-teal-500"
                >
                  <option value="all">Semua Mata Kuliah ({availableCourses.length})</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code ? `${c.code} · ` : ''}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Cards Grid */}
            {loadingTasks ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
                <MascotCharacter name="semangat" className="h-20 w-auto mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tidak Ada Tugas yang Ditemukan
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {taskSearch || taskFilterCourse !== 'all' || taskFilterUrgency !== 'all' || taskFilterType !== 'all'
                    ? 'Coba sesuaikan kata kunci atau filter status untuk menemukan tugas lainnya.'
                    : 'Belum ada tugas perkuliahan yang aktif saat ini. Semua tugas sudah terselesaikan dengan baik!'}
                </p>
                {(taskSearch || taskFilterCourse !== 'all' || taskFilterUrgency !== 'all' || taskFilterType !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTaskSearch('')
                      setTaskFilterCourse('all')
                      setTaskFilterType('all')
                      setTaskFilterUrgency('all')
                    }}
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-3.5 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {displayedTasks.map((task) => {
                  const isGroup = task.type === 'kelompok'

                  // Border indicator color
                  const borderAccentClass = task.urgency.isCritical
                    ? 'border-l-4 border-l-rose-500'
                    : task.urgency.isApproaching
                      ? 'border-l-4 border-l-amber-500'
                      : task.urgency.isOverdue
                        ? 'border-l-4 border-l-slate-400 dark:border-l-slate-600'
                        : 'border-l-4 border-l-teal-500'

                  return (
                    <div
                      key={task.id}
                      className={`group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${borderAccentClass}`}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                isGroup
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                              }`}
                            >
                              {isGroup ? (
                                <UsersRound className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <User className="h-3 w-3" aria-hidden="true" />
                              )}
                              {isGroup ? 'Kelompok' : 'Individu'}
                            </span>

                            {task.meeting_number && (
                              <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[11px] font-bold">
                                Pertemuan {task.meeting_number}
                              </span>
                            )}
                          </div>

                          {/* Urgency Badge */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                              task.urgency.isCritical
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300'
                                : task.urgency.isApproaching
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                                  : task.urgency.isOverdue
                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    : 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                            }`}
                          >
                            {task.urgency.isCritical && (
                              <Flame className="h-3 w-3 text-rose-600" aria-hidden="true" />
                            )}
                            {task.urgency.isApproaching && (
                              <Timer className="h-3 w-3 text-amber-600" aria-hidden="true" />
                            )}
                            <span>{task.urgency.countdown}</span>
                          </span>
                        </div>

                        {/* Title and Course */}
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {task.course_code ? `${task.course_code} · ` : ''}{task.course_name}
                        </p>

                        {/* Group detail pill if available */}
                        {isGroup && task.groupLabel && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200/80 dark:border-purple-800 px-2.5 py-1 text-[11px] font-medium text-purple-800 dark:text-purple-300">
                            <UsersRound className="h-3 w-3 shrink-0 text-purple-600" aria-hidden="true" />
                            <span className="truncate">Khusus: {task.groupLabel}</span>
                          </div>
                        )}

                        {/* Description Preview */}
                        {task.description && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Deadline Row */}
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span>Tenggat: <strong className="text-slate-800 dark:text-slate-200">{task.urgency.formattedDeadline}</strong></span>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedTaskDetail(task)}
                            aria-haspopup="dialog"
                            className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 text-xs font-semibold transition cursor-pointer"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Lihat Detail</span>
                          </button>

                          {/* Direct Material/Attachment Button */}
                          {task.material_link && (
                            <a
                              href={task.material_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-3 py-2 text-xs font-semibold transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Buka Materi</span>
                            </a>
                          )}
                        </div>

                        {/* Portal submission quick link if student */}
                        {user && !isStaff && (
                          <Link
                            to="/portal/tugas"
                            className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-3 py-2 text-xs font-semibold transition"
                          >
                            <span>Kumpulkan</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. TAB 3: MATERI KULIAH (MODUL, SLIDE & BAHAN AJAR)           */}
        {/* ============================================================== */}
        {activeTab === 'materials' && (
          <div
            role="tabpanel"
            id="display-panel-materials"
            aria-labelledby="display-tab-materials"
            className="space-y-4"
          >
            {/* Header Showcase with Mascot */}
            <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50/70 via-white to-teal-50/30 dark:from-slate-900 dark:to-teal-950/20 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800">
                <MascotCharacter name="membaca" className="h-14 w-auto object-contain" />
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <span className="inline-block rounded-md bg-teal-800 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  Bahan Pembelajaran Digital
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Pusat Materi & Bahan Perkuliahan
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Akses modul referensi, slide presentasi materi, silabus mata kuliah, dan bahan bacaan yang dibagikan oleh dosen pengampu.
                </p>
              </div>
            </div>

            {/* Level 2: Detail Materi Mata Kuliah Terpilih */}
            {selectedMaterialCourse ? (
              <div className="space-y-4 animate-fade-in">
                {/* Back button & Course banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterialCourseKey('')
                        setMaterialSearch('')
                      }}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-xs font-semibold transition cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Kembali ke Mata Kuliah</span>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {selectedMaterialCourse.code && (
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                            {selectedMaterialCourse.code}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {selectedMaterialCourse.name}
                        </h3>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {[
                          selectedMaterialCourse.lecturer ? `Dosen: ${selectedMaterialCourse.lecturer}` : null,
                          selectedMaterialCourse.class_name ? `Kelas ${selectedMaterialCourse.class_name}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-3 py-1 text-xs font-semibold border border-teal-200 dark:border-teal-800">
                    {displayedMaterials.length} materi tersedia
                  </span>
                </div>

                {/* Materials of Selected Course */}
                {displayedMaterials.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
                    <MascotCharacter name="berpikir" className="h-20 w-auto mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Belum Ada Materi untuk Mata Kuliah Ini
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Materi pembelajaran akan ditampilkan di sini saat dosen mengunggah berkas perkuliahan.
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-3.5 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {displayedMaterials.map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-md"
                      >
                        <div>
                          {/* Top Source Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[11px] font-bold">
                              <FolderOpen className="h-3 w-3" aria-hidden="true" />
                              <span>{item.sourceLabel}</span>
                            </span>

                            {item.meeting_number && (
                              <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[11px] font-bold">
                                Pertemuan {item.meeting_number}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Bottom Action Button */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-2 text-xs font-semibold transition shadow-2xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Buka / Unduh Materi</span>
                          </a>

                          {item.relatedTask && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskDetail(item.relatedTask)}
                              className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-2 text-xs font-medium transition cursor-pointer"
                              title="Lihat tugas terkait materi ini"
                              aria-haspopup="dialog"
                            >
                              <Info className="h-3 w-3" aria-hidden="true" />
                              <span>Tugas</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Level 1: Grid Kartu Mata Kuliah (seperti Kelompok) */
              <div className="space-y-4">
                <div className="w-full">
                  <SearchInput
                    value={materialSearch}
                    onChange={setMaterialSearch}
                    placeholder="Cari mata kuliah untuk melihat materi..."
                    label="Cari mata kuliah"
                  />
                </div>

                {materialCourseCards.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
                    <MascotCharacter name="berpikir" className="h-20 w-auto mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Mata Kuliah Tidak Ditemukan
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Coba gunakan kata kunci pencarian yang lain.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {materialCourseCards
                      .filter((c) => {
                        if (!materialSearch.trim()) return true
                        const q = materialSearch.toLowerCase()
                        return (
                          c.name.toLowerCase().includes(q) ||
                          c.code.toLowerCase().includes(q) ||
                          c.lecturer.toLowerCase().includes(q)
                        )
                      })
                      .map((course) => (
                        <MaterialCourseCard
                          key={course.key}
                          course={course}
                          onSelect={(key) => {
                            setSelectedMaterialCourseKey(key)
                            setMaterialSearch('')
                          }}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. TAB 4: PENGUMUMAN                                           */}
        {/* ============================================================== */}
        {activeTab === 'announcements' && (
          <div
            role="tabpanel"
            id="display-panel-announcements"
            aria-labelledby="display-tab-announcements"
            className="space-y-3"
          >
            <h2 className="sr-only">Pengumuman</h2>
            {loadingAnnouncements ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
            ) : (announcements || []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
                Belum ada pengumuman baru yang dipublikasikan saat ini.
              </div>
            ) : (
              <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {(announcements || []).map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all hover:border-teal-700/50 hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[11px] font-bold uppercase">
                          {ann.category || 'Akademik'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(ann.published_at || ann.created_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                        {ann.excerpt || ann.content?.replace(/<[^>]+>/g, '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. TAB 5: TIPS BELAJAR & SELF-CARE                             */}
        {/* ============================================================== */}
        {activeTab === 'tips' && (
          <div
            role="tabpanel"
            id="display-panel-tips"
            aria-labelledby="display-tab-tips"
            className="space-y-4"
          >
            <h2 className="sr-only">Tips Belajar</h2>
            <div
              role="group"
              aria-roledescription="carousel"
              aria-label="Tips belajar dan self-care"
              onFocusCapture={() => setTipsFocused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setTipsFocused(false)
              }}
              className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-slate-800 p-2 border border-teal-200 dark:border-teal-800">
                  <MascotCharacter name={activeTip.mascot} className="h-16 w-auto object-contain" loading="eager" />
                </div>
                <div
                  className="space-y-1.5 flex-1"
                  aria-live={tipsPaused || tipsFocused || prefersReducedMotion ? 'polite' : 'off'}
                >
                  <span className="inline-block rounded-md bg-teal-800 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                    {activeTip.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeTip.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{activeTip.quote}"
                  </p>
                </div>
              </div>

              {/* Dot switcher */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex items-center gap-1" role="group" aria-label="Pilih tips">
                  {PSYCHOLOGY_TIPS.map((tip, idx) => (
                    <button
                      key={tip.id}
                      type="button"
                      onClick={() => setTipIndex(idx)}
                      aria-label={`Tampilkan tips: ${tip.title}`}
                      aria-pressed={idx === tipIndex}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition cursor-pointer"
                    >
                      <span
                        className={`h-2 rounded-full transition-all ${
                          idx === tipIndex ? 'w-6 bg-teal-800 dark:bg-teal-400' : 'w-2 bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {!prefersReducedMotion && (
                  <button
                    type="button"
                    onClick={() => setTipsPaused((prev) => !prev)}
                    aria-pressed={tipsPaused}
                    aria-label={tipsPaused ? 'Lanjutkan rotasi tips otomatis' : 'Jeda rotasi tips otomatis'}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {tipsPaused ? (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Pause className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-sm space-y-1">
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-400">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  Pomodoro 25/5
                </span>
                <p className="text-slate-600 dark:text-slate-300">25 menit fokus penuh, 5 menit jeda relaksasi.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-sm space-y-1">
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-400">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Relaksasi Mata
                </span>
                <p className="text-slate-600 dark:text-slate-300">Tiap 20 menit, pandang objek 6 meter selama 20 detik.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-sm space-y-1">
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-400">
                  <Droplets className="h-4 w-4" aria-hidden="true" />
                  Hidrasi Otak
                </span>
                <p className="text-slate-600 dark:text-slate-300">Minum air teratur agar fokus konsentrasi tidak menurun.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 9. TAB 6: KETENTUAN STUDI                                      */}
        {/* ============================================================== */}
        {activeTab === 'guidelines' && (
          <div
            role="tabpanel"
            id="display-panel-guidelines"
            aria-labelledby="display-tab-guidelines"
            className={`grid gap-3.5 ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            <h2 className="sr-only">Ketentuan Studi</h2>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Presensi Kuliah</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pastikan Anda selalu mengisi tautan presensi/absensi yang tertera pada tiap mata kuliah yang berlangsung setiap minggunya tepat waktu sesuai jam perkuliahan.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <Clock className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Tugas & Portofolio</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Kumpulkan tugas perkuliahan (baik tugas individu maupun laporan kelompok) sebelum batas tenggat waktu. Tugas kelompok memerlukan koordinasi yang baik antar anggota.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 10. MODAL KELOMPOK                                             */}
      {/* ============================================================== */}
      {selectedGroupCourse && (
        <Modal
          open
          onClose={() => setSelectedGroupCourse(null)}
          title={`Daftar Kelompok: ${selectedGroupCourse.course_name}`}
          description={
            selectedGroupCourse.lecturer_name
              ? `Dosen: ${selectedGroupCourse.lecturer_name}`
              : 'Mata Kuliah'
          }
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedGroupCourse(null)}>
              Tutup
            </Button>
          }
        >
          <div className="space-y-3 text-sm">
            {!selectedGroupCourse.groups || selectedGroupCourse.groups.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <UsersRound className="mx-auto mb-2 h-10 w-10 text-slate-300 dark:text-slate-700" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Belum Ada Data Kelompok
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Belum ada pembagian kelompok yang didaftarkan untuk mata kuliah ini di database.
                </p>
              </div>
            ) : (
              selectedGroupCourse.groups.map((grp, idx) => (
                <div
                  key={grp.id || idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">
                      {grp.name}
                    </h3>
                    {grp.leader && (
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Ketua: <strong className="text-slate-900 dark:text-white">{grp.leader}</strong>
                      </span>
                    )}
                  </div>

                  {grp.topic && (
                    <p className="mb-2 text-xs text-slate-600 dark:text-slate-300">
                      Topik / Tugas:{' '}
                      <span className="font-medium text-slate-800 dark:text-slate-200">{grp.topic}</span>
                    </p>
                  )}

                  {grp.members && grp.members.length > 0 && (
                    <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Anggota ({grp.members.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {grp.members.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 11. MODAL DETAIL TUGAS & PANDUAN PENGUMPULAN                   */}
      {/* ============================================================== */}
      {selectedTaskDetail && (
        <Modal
          open={Boolean(selectedTaskDetail)}
          onClose={() => setSelectedTaskDetail(null)}
          title={selectedTaskDetail.title}
          description={`${selectedTaskDetail.course_code ? `${selectedTaskDetail.course_code} · ` : ''}${
            selectedTaskDetail.course_name
          }${selectedTaskDetail.meeting_number ? ` (Pertemuan ${selectedTaskDetail.meeting_number})` : ''}`}
          size="lg"
          footer={
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                Tenggat: {selectedTaskDetail.urgency?.formattedDeadline || '-'}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setSelectedTaskDetail(null)}>
                  Tutup
                </Button>
                {user && !isStaff && (
                  <Button as={Link} to="/portal/tugas">
                    Buka Halaman Pengumpulan
                  </Button>
                )}
                {user && isStaff && (
                  <Button as={Link} to="/admin/tugas">
                    Kelola Tugas di Admin
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            {/* Status & Urgency Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  selectedTaskDetail.type === 'kelompok'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200'
                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200'
                }`}
              >
                {selectedTaskDetail.type === 'kelompok' ? (
                  <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {selectedTaskDetail.type === 'kelompok' ? 'Tugas Kelompok' : 'Tugas Individu'}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                  selectedTaskDetail.urgency?.isCritical
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300'
                    : selectedTaskDetail.urgency?.isApproaching
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                      : 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">{selectedTaskDetail.urgency?.countdown}</span>
              </span>
            </div>

            {/* If Group Task, show assigned groups */}
            {selectedTaskDetail.type === 'kelompok' && selectedTaskDetail.groupLabel && (
              <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3">
                <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300">
                  <UsersRound className="h-4 w-4 text-purple-700" aria-hidden="true" />
                  <span>Alokasi Kelompok Tugas:</span>
                </div>
                <p className="mt-1 text-purple-800 dark:text-purple-200 font-medium">
                  {selectedTaskDetail.groupLabel}
                </p>
              </div>
            )}

            {/* Instruction description */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Instruksi & Deskripsi Tugas:
              </span>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border border-slate-200/80 dark:border-slate-700">
                {selectedTaskDetail.description || 'Tidak ada deskripsi instruksi tambahan yang disertakan.'}
              </div>
            </div>

            {/* Attachment link if available */}
            {selectedTaskDetail.material_link && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-teal-950/30 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
                  <BookOpen className="h-4 w-4 text-teal-700" aria-hidden="true" />
                  <div>
                    <span className="block font-bold">Bahan & Materi Tugas</span>
                    <span className="text-xs text-teal-700/80 dark:text-teal-400">
                      Tautan dokumen atau slide referensi pengerjaan
                    </span>
                  </div>
                </div>
                <a
                  href={selectedTaskDetail.material_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Buka Materi</span>
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
