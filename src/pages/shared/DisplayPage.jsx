import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Laptop,
  LogIn,
  Megaphone,
  RotateCcw,
  Smartphone,
  Sparkles,
  UsersRound,
  Video,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate } from '../../lib/utils'
import { Skeleton } from '../../components/ui'
import { getMascot } from '../../lib/mascots'

function MascotCharacter({ name, className = 'h-14 w-auto object-contain', alt }) {
  const asset = getMascot(name)
  if (!asset) return null
  return (
    <img
      src={asset.gif || asset.poster}
      alt={alt || asset.alt || 'Maskot Psikologi Connect'}
      className={className}
      draggable={false}
      loading="eager"
    />
  )
}

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

export default function DisplayPage() {
  const { user, isStaff } = useAuth()
  const location = useLocation()
  const isStandaloneRoute = location.pathname === '/display'

  // Tabs: 'schedules', 'announcements', 'tips', 'guidelines'
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
  const [tipIndex, setTipIndex] = useState(0)

  // Real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Cycle tips every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % PSYCHOLOGY_TIPS.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // --------------------------------------------------------------------------
  // INTEGRASI TABEL DATABASE ASLI (TANPA DATA DUMMY)
  // --------------------------------------------------------------------------
  const schedulePath = user ? (isStaff ? '/staff/schedules' : '/student/schedules') : null
  const coursePath = user ? (isStaff ? '/staff/courses' : '/student/courses') : null
  const groupPath = user ? (isStaff ? '/staff/groups' : '/student/groups') : null
  const taskPath = user ? (isStaff ? '/staff/tasks' : '/student/tasks') : null

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

  // 3. Tabel Kelompok (Asli dari Database)
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

  // 5. Tabel Pengumuman
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
    refreshAnnouncements()
  }

  const isSyncing = loadingSchedules || loadingCourses || loadingGroups || loadingTasks || loadingAnnouncements

  // Detect current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const currentDayName = dayNames[currentTime.getDay()]

  // Assembling live schedules strictly from database tables
  const allSchedules = useMemo(() => {
    const rawList = Array.isArray(rawSchedules) ? rawSchedules : []
    const coursesMap = new Map((rawCourses || []).map((c) => [String(c.id), c]))

    // Map real groups by course_id from database
    const groupsMap = new Map()
    ;(rawGroups || []).forEach((g) => {
      const cId = String(g.course_id || '')
      if (!cId) return
      if (!groupsMap.has(cId)) groupsMap.set(cId, [])
      groupsMap.get(cId).push(g)
    })

    // Map tasks / materials by course_id from database
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
      const tasksForCourse = tasksMap.get(String(sch.course_id)) || []
      const taskWithMaterial = tasksForCourse.find((t) => t.attachment_url || t.materials || t.attachment)

      // Format real groups from database (no dummy data)
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
        course_code: sch.course_code || course.code || '',
        course_name: sch.course_name || course.name || 'Mata Kuliah',
        lecturer_name: sch.lecturer_name || sch.course_lecturer || course.lecturer || '',
        credits: sch.credits || course.credits || 0,
        attendance_link: sch.attendance_link || course.attendance_link || '',
        material_link:
          taskWithMaterial?.attachment_url ||
          sch.material_link ||
          course.material_link ||
          '',
        meeting_link: sch.meeting_link || course.meeting_link || '',
        groups: realGroups,
      }
    })
  }, [rawSchedules, rawCourses, rawGroups, rawTasks])

  // STRICTLY DEFAULT TO TODAY'S SCHEDULE, WITH OPTION TO VIEW OTHER DAYS
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

  return (
    <div
      className={`min-h-screen ${
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
        {/* 1. LARAVEL FILAMENT V5 STYLE PAGE HEADER                      */}
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Hari Ini: {currentDayName}</span>
            </span>

            {/* Filament Digital Clock Pill */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 shadow-xs">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{timeString} WIB</span>
            </div>

            {/* Filament Segmented Button (Auto | Web | HP) */}
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setDeviceMode('auto')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  deviceMode === 'auto'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Otomatis mengikuti ukuran layar"
              >
                <Sparkles className="h-3 w-3 text-teal-600" />
                <span className="hidden sm:inline">Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('web')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  deviceMode === 'web'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Tampilan Desktop / Web"
              >
                <Laptop className="h-3 w-3" />
                <span>Web</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  deviceMode === 'mobile'
                    ? 'bg-white dark:bg-gray-900 text-gray-950 dark:text-white shadow-xs font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950'
                }`}
                title="Tampilan Ponsel / HP"
              >
                <Smartphone className="h-3 w-3" />
                <span>HP</span>
              </button>
            </div>

            {/* Sync Database Button */}
            {user && (
              <button
                type="button"
                onClick={refreshAll}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                title="Sinkronkan data dari tabel database"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Standalone Route Portal Button */}
            {isStandaloneRoute ? (
              user ? (
                <Link
                  to={isStaff ? '/admin' : '/portal'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Portal</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Masuk</span>
                </Link>
              )
            ) : null}
          </div>
        </header>

        {/* ============================================================== */}
        {/* 2. LARAVEL FILAMENT V5 STYLE TABS                             */}
        {/* ============================================================== */}
        <div className="fi-tabs border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 overflow-x-auto">
          <nav className="-mb-px flex gap-x-6">
            {[
              { id: 'schedules', title: 'Jadwal Kuliah', count: displayedSchedules.length, icon: CalendarDays },
              { id: 'announcements', title: 'Pengumuman', count: (announcements || []).length, icon: Megaphone },
              { id: 'tips', title: 'Tips Belajar', count: null, icon: Sparkles },
              { id: 'guidelines', title: 'Ketentuan Studi', count: null, icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-medium border-b-2 transition ${
                    isActive
                      ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.title}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isActive
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* ============================================================== */}
        {/* 3. TAB 1: JADWAL KULIAH (DEFAULT HARI INI + FILTER HARI LAIN)  */}
        {/* ============================================================== */}
        {activeTab === 'schedules' && (
          <div className="space-y-4">
            {/* Pilihan Hari: Default Hari Ini, Tapi Bisa Melihat Hari Lain */}
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
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
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
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
            ) : displayedSchedules.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-lg mx-auto">
                <MascotCharacter name="tertidur" className="h-16 w-auto mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tidak Ada Jadwal Kuliah pada {selectedDay === 'today' ? `Hari Ini (${currentDayName})` : `Hari ${selectedDay}`}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
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
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-teal-700/50 hover:shadow-xs"
                    >
                      <div>
                        {/* Time & Mode Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                            {item.start_time} - {item.end_time} WIB
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOnline
                                ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isOnline ? 'Online Zoom' : 'Tatap Muka'}
                          </span>
                        </div>

                        {/* Course Name & Details (Tanpa Ruang) */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {item.course_name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 px-2.5 py-1.5 text-xs font-semibold transition"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                              <span>Presensi</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs py-1.5">
                              Presensi Offline
                            </span>
                          )}

                          {/* 2. Materi */}
                          {item.material_link ? (
                            <a
                              href={item.material_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                              <span>Materi</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs py-1.5">
                              Materi di Kelas
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {/* 3. Kelompok (Ambil dari database tabel groups) */}
                          <button
                            type="button"
                            onClick={() => setSelectedGroupCourse(item)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
                          >
                            <UsersRound className="h-3.5 w-3.5 text-slate-600" />
                            <span>Kelompok ({groupCount})</span>
                          </button>

                          {/* 4. Kelas Online */}
                          {item.meeting_link ? (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800 px-2.5 py-1.5 text-xs font-semibold transition"
                            >
                              <Video className="h-3.5 w-3.5 text-sky-700" />
                              <span>Masuk Zoom</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs py-1.5">
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
        {/* 4. TAB 2: PENGUMUMAN                                           */}
        {/* ============================================================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-3">
            {loadingAnnouncements ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
            ) : (announcements || []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500">
                Belum ada pengumuman baru yang dipublikasikan saat ini.
              </div>
            ) : (
              <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {(announcements || []).map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-teal-700/50"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {ann.category || 'Akademik'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatDate(ann.published_at || ann.created_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
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
        {/* 5. TAB 3: TIPS BELAJAR & SELF-CARE                             */}
        {/* ============================================================== */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-slate-800 p-2 border border-teal-200 dark:border-teal-800">
                  <MascotCharacter name={activeTip.mascot} className="h-16 w-auto object-contain" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="inline-block rounded-md bg-teal-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {activeTip.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeTip.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{activeTip.quote}"
                  </p>
                </div>
              </div>

              {/* Dot switcher */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {PSYCHOLOGY_TIPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTipIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === tipIndex ? 'w-6 bg-teal-800' : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-800 dark:text-teal-400">⏱️ Pomodoro 25/5</span>
                <p className="text-slate-600 dark:text-slate-300">25 menit fokus penuh, 5 menit berdiri & rileks.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-800 dark:text-teal-400">👁️ Relaksasi Mata</span>
                <p className="text-slate-600 dark:text-slate-300">Tiap 20 menit, pandang objek 6 meter selama 20 detik.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-800 dark:text-teal-400">💧 Hidrasi Otak</span>
                <p className="text-slate-600 dark:text-slate-300">Minum air teratur agar fokus konsentrasi tidak menurun.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. TAB 4: KETENTUAN STUDI (PENGINGAT ABSENSI & TUGAS)          */}
        {/* ============================================================== */}
        {activeTab === 'guidelines' && (
          <div className={`grid gap-3.5 ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Presensi Kuliah</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Pastikan Anda selalu mengisi tautan presensi/absensi yang tertera pada tiap mata kuliah yang berlangsung setiap minggunya tepat waktu.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Tugas Kuliah</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kumpulkan tugas perkuliahan (baik tugas individu maupun laporan kelompok) sebelum batas tenggat waktu yang ditentukan oleh dosen pengampu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 7. MODAL KELOMPOK (MURNI DARI DATABASE, TANPA DATA DUMMY)     */}
      {/* ============================================================== */}
      {selectedGroupCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Kelompok: {selectedGroupCourse.course_name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedGroupCourse.lecturer_name ? `Dosen: ${selectedGroupCourse.lecturer_name}` : 'Mata Kuliah'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroupCourse(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {(!selectedGroupCourse.groups || selectedGroupCourse.groups.length === 0) ? (
                <div className="py-8 px-4 text-center">
                  <UsersRound className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Belum Ada Data Kelompok
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Belum ada pembagian kelompok yang didaftarkan untuk mata kuliah ini di database.
                  </p>
                </div>
              ) : (
                selectedGroupCourse.groups.map((grp, idx) => (
                  <div
                    key={grp.id || idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-teal-800 dark:text-teal-300 text-xs">
                        {grp.name}
                      </span>
                      {grp.leader && (
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          Ketua: <strong className="text-slate-900 dark:text-white">{grp.leader}</strong>
                        </span>
                      )}
                    </div>

                    {grp.topic && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                        Topik / Tugas: <span className="font-medium text-slate-800 dark:text-slate-200">{grp.topic}</span>
                      </p>
                    )}

                    {grp.members && grp.members.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Anggota ({grp.members.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {grp.members.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="rounded-md bg-white dark:bg-slate-700 px-2 py-0.5 text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
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

            <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setSelectedGroupCourse(null)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-1.5 text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
