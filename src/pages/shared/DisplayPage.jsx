import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  Heart,
  Layers,
  Maximize2,
  Megaphone,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Tv,
  UsersRound,
  Video,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate } from '../../lib/utils'
import { Badge, Card, Skeleton } from '../../components/ui'
import { getMascot } from '../../lib/mascots'

function MascotCharacter({ name, className = 'h-16 w-auto object-contain', alt }) {
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

const PSYCHOLOGY_REMINDERS = [
  {
    id: 1,
    title: 'Teknik Pomodoro & Istirahat Berkala',
    quote: 'Fokus belajar selama 25 menit, lalu beri jeda istirahat 5 menit. Otak memerlukan waktu untuk memproses dan mengendapkan informasi baru secara optimal.',
    category: 'Manajemen Belajar',
    badgeTone: 'bg-teal-700 text-white',
    mascot: 'minum',
    actionText: 'Rileks sejenak & minum air putih',
  },
  {
    id: 2,
    title: 'Latihan Pernapasan 4-7-8 untuk Redakan Stres',
    quote: 'Tarik napas perlahan selama 4 detik, tahan selama 7 detik, lalu hembuskan napas pelan-pelan selama 8 detik. Terbukti cepat menurunkan detak jantung dan kecemasan.',
    category: 'Mindfulness & Relaksasi',
    badgeTone: 'bg-indigo-700 text-white',
    mascot: 'memeluk-hati',
    actionText: 'Ulangi 3–4 siklus sampai tenang',
  },
  {
    id: 3,
    title: 'Hidrasi Cukup Menjaga Fokus & Konsentrasi',
    quote: 'Dehidrasi ringan sebesar 2% dapat menurunkan daya konsentrasi dan memori jangka pendek hingga 20%. Selalu siapkan air minum di meja belajar Anda.',
    category: 'Kebugaran Otak',
    badgeTone: 'bg-cyan-700 text-white',
    mascot: 'semangat',
    actionText: 'Minum minimal 1 gelas sekarang',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20 untuk Melindungi Mata',
    quote: 'Setiap 20 menit menatap layar HP atau laptop, istirahatkan mata dengan melihat objek berjarak 20 kaki (sekitar 6 meter) selama 20 detik.',
    category: 'Kesehatan Mata',
    badgeTone: 'bg-emerald-700 text-white',
    mascot: 'laptop',
    actionText: 'Pandang pepohonan atau kejauhan',
  },
]

const SLIDES = [
  { id: 'schedules', title: 'Jadwal Hari Ini', icon: CalendarDays },
  { id: 'announcements', title: 'Pengumuman Kampus', icon: Megaphone },
  { id: 'motivation', title: 'Motivasi & Self-Care', icon: Sparkles },
  { id: 'reminders', title: 'Pengingat Akademik', icon: Bell },
]

export default function DisplayPage() {
  const { isStaff } = useAuth()
  // currentSlide: 'schedules', 'announcements', 'motivation', 'reminders', or 'all'
  const [currentSlide, setCurrentSlide] = useState('schedules')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [reminderIndex, setReminderIndex] = useState(0)
  const [slideProgress, setSlideProgress] = useState(0)

  // Real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto rotate slides every 10 seconds if autoRotate is true
  useEffect(() => {
    if (!autoRotate || currentSlide === 'all') {
      setSlideProgress(0)
      return
    }

    const DURATION = 10000 // 10s per slide
    const STEP = 200 // update progress every 200ms
    let elapsed = 0

    const progressTimer = setInterval(() => {
      elapsed += STEP
      const percent = Math.min(100, Math.round((elapsed / DURATION) * 100))
      setSlideProgress(percent)

      if (elapsed >= DURATION) {
        elapsed = 0
        setSlideProgress(0)
        setCurrentSlide((current) => {
          const slideIds = SLIDES.map((s) => s.id)
          const currIdx = slideIds.indexOf(current)
          const nextIdx = (currIdx + 1) % slideIds.length
          return slideIds[nextIdx]
        })
      }
    }, STEP)

    return () => clearInterval(progressTimer)
  }, [autoRotate, currentSlide])

  // Cycle psychological tips every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setReminderIndex((prev) => (prev + 1) % PSYCHOLOGY_REMINDERS.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Fetch announcements
  const { data: announcements, loading: loadingAnnouncements } = useApiData('/announcements', {
    per_page: 8,
    sort: 'published_at',
    direction: 'desc',
  })

  // Fetch schedules
  const schedulePath = isStaff ? '/staff/schedules' : '/student/schedules'
  const { data: rawSchedules, loading: loadingSchedules } = useApiData(schedulePath, {
    per_page: 50,
  })

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentSlide === 'all') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide])

  // Detect current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const currentDayName = dayNames[currentTime.getDay()]

  // Filter today's schedules
  const todaySchedules = useMemo(() => {
    const list = Array.isArray(rawSchedules) ? rawSchedules : []
    return list.filter((item) => (item.day || '').toLowerCase() === currentDayName.toLowerCase())
  }, [rawSchedules, currentDayName])

  // Format digital time strings
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

  const activeReminder = PSYCHOLOGY_REMINDERS[reminderIndex]

  // Slide navigation helpers
  const slideIds = SLIDES.map((s) => s.id)
  const currentSlideIndex = slideIds.indexOf(currentSlide)

  const goToNextSlide = () => {
    setSlideProgress(0)
    const nextIdx = (currentSlideIndex + 1) % slideIds.length
    setCurrentSlide(slideIds[nextIdx])
  }

  const goToPrevSlide = () => {
    setSlideProgress(0)
    const prevIdx = (currentSlideIndex - 1 + slideIds.length) % slideIds.length
    setCurrentSlide(slideIds[prevIdx])
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'p-6 sm:p-10 bg-slate-950 text-white min-h-screen overflow-y-auto' : ''}`}>
      {/* ============================================================== */}
      {/* 1. TOP BANNER: Smart Display Header & Real-time Clock           */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl border border-teal-700/40">
        <div className="hero-dots absolute inset-0 opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/25 text-teal-200 ring-2 ring-teal-400/40 shadow-inner">
              <Tv className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
                  Live Smart Display Board
                </p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Pusat Informasi & Jadwal Terpadu
              </h1>
              <p className="text-xs text-teal-100 font-medium hidden sm:block">
                Prodi Psikologi Islam STIT Muhammadiyah Kediri
              </p>
            </div>
          </div>

          {/* Clock & Display Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Clock Widget (High Contrast) */}
            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-teal-400/40 bg-black/60 px-4 py-2.5 backdrop-blur-md shadow-lg">
              <Clock className="h-5 w-5 text-teal-300 shrink-0" />
              <div className="text-right">
                <p className="font-mono text-lg sm:text-xl font-extrabold tracking-wider text-teal-300 leading-none">
                  {timeString} <span className="text-xs font-bold text-teal-100">WIB</span>
                </p>
                <p className="text-xs font-semibold text-white mt-1 leading-none">{dateString}</p>
              </div>
            </div>

            {/* Auto-Slide Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-xs font-bold transition shadow-md ${
                autoRotate
                  ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40'
                  : 'border-white/20 bg-black/40 text-slate-200 hover:bg-black/60'
              }`}
              title={autoRotate ? 'Jeda pergantian slide otomatis' : 'Nyalakan pergantian slide otomatis'}
            >
              {autoRotate ? (
                <>
                  <Pause className="h-4 w-4 text-emerald-300" />
                  <span>Auto-Slide: Aktif</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-slate-300" />
                  <span>Auto-Slide: Jeda</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-95"
              title="Mode Layar Penuh (TV Display)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (TV)'}</span>
            </button>
          </div>
        </div>

        {/* Running Announcement Ticker Bar */}
        <div className="border-t border-teal-700/50 bg-black/60 px-6 py-2.5 text-xs font-medium backdrop-blur-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-400 px-2.5 py-1 text-[11px] font-extrabold uppercase text-slate-950 shadow-sm">
              <Megaphone className="h-3 w-3" />
              Sekilas Warta
            </span>
            <div className="truncate text-white font-medium">
              {announcements?.[0]?.title ? (
                <span>
                  <strong>{announcements[0].title}</strong> — {announcements[0].excerpt || 'Periksa rincian lengkap di panel pengumuman.'}
                </span>
              ) : (
                <span>Selamat datang di Psikologi Connect App STIT Muhammadiyah Kediri • Cek jadwal perkuliahan dan tugas secara berkala.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SLIDE NAVIGATION & TABS CONTROL BAR                         */}
      {/* ============================================================== */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Slide Tab Selectors */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            {SLIDES.map((slide, idx) => {
              const Icon = slide.icon
              const isActive = currentSlide === slide.id
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setSlideProgress(0)
                    setCurrentSlide(slide.id)
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-500'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{idx + 1}. {slide.title}</span>
                </button>
              )
            })}

            {/* Overview / All-in-one Grid View Tab */}
            <button
              type="button"
              onClick={() => setCurrentSlide('all')}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                currentSlide === 'all'
                  ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-500'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Tampilkan semua widget dalam satu halaman grid"
            >
              <Layers className="h-4 w-4" />
              <span>Semua (Grid)</span>
            </button>
          </div>

          {/* Slide Prev/Next Arrows & Counter */}
          <div className="flex items-center gap-3">
            {currentSlide !== 'all' && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="rounded-lg p-1.5 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-teal-700 transition"
                  title="Slide Sebelumnya (Arrow Left)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {currentSlideIndex + 1} / {SLIDES.length}
                </span>
                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="rounded-lg p-1.5 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-teal-700 transition"
                  title="Slide Berikutnya (Arrow Right)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <span className="rounded-xl bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs">
              Hari: {currentDayName}
            </span>
          </div>
        </div>

        {/* Auto-Slide Progress Bar */}
        {autoRotate && currentSlide !== 'all' && (
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-teal-600 transition-all duration-200 ease-linear"
              style={{ width: `${slideProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. SLIDE CONTENT RENDERING (FULL VIEW PER SLIDE)               */}
      {/* ============================================================== */}

      {/* -------------------------------------------------------------- */}
      {/* SLIDE 1: JADWAL KULIAH HARI INI                                */}
      {/* -------------------------------------------------------------- */}
      {(currentSlide === 'schedules' || currentSlide === 'all') && (
        <Card className="overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {/* Header Card (High Contrast) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Jadwal Perkuliahan Hari Ini ({currentDayName})
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Daftar sesi perkuliahan aktif untuk seluruh kelas hari ini.
                </p>
              </div>
            </div>

            {/* Mascot Badge: Berjalan */}
            <div className="flex items-center gap-3 rounded-2xl bg-teal-100 dark:bg-teal-950/80 px-4 py-2 border border-teal-300 dark:border-teal-700">
              <MascotCharacter name="berjalan" className="h-10 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-teal-950 dark:text-teal-200">Maskot Disiplin</p>
                <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">Hadir tepat waktu & presensi!</p>
              </div>
            </div>
          </div>

          {/* Schedule List / Empty State */}
          <div className="p-6 sm:p-8">
            {loadingSchedules ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : todaySchedules.length === 0 ? (
              /* State Kosong yang Ramah & Penuh Kontras */
              <div className="py-12 px-6 text-center max-w-2xl mx-auto">
                <div className="mb-4 flex items-center justify-center">
                  <div className="rounded-3xl bg-teal-50 dark:bg-teal-950/40 p-4 border-2 border-teal-200 dark:border-teal-800 shadow-inner">
                    <MascotCharacter name="tertidur" className="h-24 w-auto object-contain" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white">
                  Tidak Ada Jadwal Perkuliahan Hari Ini ({currentDayName})
                </h3>
                <p className="mt-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  Hari ini Anda bebas dari jadwal kelas tatap muka maupun daring. Manfaatkan waktu untuk istirahat yang berkualitas, mengulang materi perkuliahan, atau berkolaborasi menyelesaikan tugas.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide('announcements')}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 shadow-md transition"
                  >
                    <Megaphone className="h-4 w-4" />
                    Lihat Pengumuman Kampus
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide('motivation')}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs px-4 py-2.5 transition dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  >
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    Buka Tips Relaksasi
                  </button>
                </div>
              </div>
            ) : (
              /* List Jadwal dengan Kartu Penuh & Tulisan Tajam */
              <div className="grid gap-4 sm:grid-cols-2">
                {todaySchedules.map((item, idx) => {
                  const startTime = (item.start_time || '').slice(0, 5)
                  const endTime = (item.end_time || '').slice(0, 5)
                  const isOnline = item.mode === 'online'
                  return (
                    <div
                      key={item.id || idx}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-5 transition hover:shadow-md hover:border-teal-400"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md font-mono">
                            <span className="text-sm font-extrabold leading-none">{startTime}</span>
                            <span className="text-[10px] text-teal-200 mt-1 font-bold leading-none">{endTime}</span>
                          </div>
                          <div>
                            <span
                              className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
                                isOnline
                                  ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-200 border border-sky-300'
                                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300'
                              }`}
                            >
                              {isOnline ? 'Online (Daring)' : 'Tatap Muka'}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-1">
                              {item.course_name || item.course?.name || 'Mata Kuliah'}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <div className="space-y-1">
                          {item.room && (
                            <div className="flex items-center gap-1.5">
                              <DoorOpen className="h-4 w-4 text-teal-700 shrink-0" />
                              <span>Ruang: {item.room}</span>
                            </div>
                          )}
                          {item.lecturer_name && (
                            <div className="text-slate-700 dark:text-slate-300 font-semibold">
                              Dosen: {item.lecturer_name}
                            </div>
                          )}
                        </div>

                        {item.meeting_link && (
                          <a
                            href={item.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 text-white px-3.5 py-2 text-xs font-bold shadow-md hover:bg-teal-800 transition"
                          >
                            <Video className="h-4 w-4" />
                            Masuk Kelas
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* -------------------------------------------------------------- */}
      {/* SLIDE 2: PENGUMUMAN & WARTA KAMPUS                             */}
      {/* -------------------------------------------------------------- */}
      {(currentSlide === 'announcements' || currentSlide === 'all') && (
        <Card className="overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Pengumuman & Informasi Kampus
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Warta resmi akademik, kemahasiswaan, dan agenda kegiatan prodi.
                </p>
              </div>
            </div>

            {/* Mascot Menunjuk */}
            <div className="flex items-center gap-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 px-4 py-2 border border-amber-300 dark:border-amber-700">
              <MascotCharacter name="menunjuk" className="h-10 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-amber-950 dark:text-amber-200">Warta Terkini</p>
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Simak pengumuman terbaru!</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loadingAnnouncements ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (announcements || []).length === 0 ? (
              <div className="py-12 px-6 text-center">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Belum ada pengumuman baru yang dipublikasikan saat ini.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(announcements || []).slice(0, 6).map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 p-5 transition hover:shadow-md hover:border-amber-400"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="rounded-lg bg-teal-800 text-white px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
                          {ann.category || 'Akademik'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatDate(ann.published_at || ann.created_at)}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-950 dark:text-white line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                        {ann.excerpt || ann.content?.replace(/<[^>]+>/g, '')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-extrabold text-teal-800 dark:text-teal-300">
                      <span>Baca Pengumuman Lengkap</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* -------------------------------------------------------------- */}
      {/* SLIDE 3: MOTIVASI & SELF-CARE (SPOTLIGHT BESAR & PENUH)       */}
      {/* -------------------------------------------------------------- */}
      {(currentSlide === 'motivation' || currentSlide === 'all') && (
        <Card className="overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-700 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Kesehatan Mental, Motivasi & Self-Care
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Panduan mindfulness, ritme belajar terstruktur, dan perawatan diri mahasiswa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-950 dark:text-indigo-200 px-3 py-1 text-xs font-extrabold border border-indigo-300">
                Tips #{reminderIndex + 1} dari {PSYCHOLOGY_REMINDERS.length}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Main Spotlight Box */}
            <div className="rounded-3xl border-2 border-teal-300 dark:border-teal-800 bg-gradient-to-br from-teal-50 via-slate-50 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-md">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                {/* Left/Mascot Spotlight */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
                  <div className="flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 border-2 border-teal-400 dark:border-teal-600 p-4 shadow-xl">
                    <MascotCharacter
                      name={activeReminder.mascot}
                      className="h-36 sm:h-44 w-auto object-contain transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <span className={`mt-4 inline-block rounded-full px-3.5 py-1 text-xs font-extrabold shadow-sm ${activeReminder.badgeTone}`}>
                    {activeReminder.category}
                  </span>
                </div>

                {/* Right/Message & Quote (High Contrast) */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
                    {activeReminder.title}
                  </h3>

                  <blockquote className="rounded-2xl border-l-4 border-teal-600 bg-white/90 dark:bg-slate-800/90 p-5 shadow-sm text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed italic">
                    "{activeReminder.quote}"
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Aksi Praktis: {activeReminder.actionText}
                      </span>
                    </div>

                    {/* Tip Switcher Dots */}
                    <div className="flex items-center gap-2">
                      {PSYCHOLOGY_REMINDERS.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReminderIndex(idx)}
                          className={`h-3 rounded-full transition-all ${
                            idx === reminderIndex
                              ? 'w-8 bg-teal-700 shadow-xs'
                              : 'w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                          }`}
                          title={`Lihat tips ke-${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars of Mental Health & Self-Care */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  ⏱️ Manajemen Fokus
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">Metode Pomodoro</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  25 menit fokus penuh tanpa notifikasi hp, lalu 5 menit berdiri & peregangan.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                  👁️ Kesehatan Mata
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">Aturan 20-20-20</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  Tiap 20 menit menatap layar, pandang objek 6 meter selama 20 detik agar mata tidak lelah.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  ❤️ Manajemen Emosi
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">Pernapasan Sadar 4-7-8</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  Tarik 4 detik, tahan 7 detik, buang 8 detik. Efektif meredakan ketegangan sebelum ujian.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* -------------------------------------------------------------- */}
      {/* SLIDE 4: PENGINGAT AKADEMIK & LAYANAN KAMPUS                   */}
      {/* -------------------------------------------------------------- */}
      {(currentSlide === 'reminders' || currentSlide === 'all') && (
        <Card className="overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Pengingat Akademik & Layanan Kampus
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Prioritas penting untuk kelancaran masa studi di STIT Muhammadiyah Kediri.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-teal-100 dark:bg-teal-950/80 px-4 py-2 border border-teal-300 dark:border-teal-700">
              <MascotCharacter name="menyapa" className="h-10 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-teal-950 dark:text-teal-200">Siap Mendampingi</p>
                <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">Kebutuhan akademik Anda</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid gap-5 md:grid-cols-3">
            {/* Card 1: Presensi */}
            <div className="rounded-3xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                    Presensi & Kehadiran Kuliah
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  Batas minimal kehadiran perkuliahan untuk dapat mengikuti Ujian Akhir Semester adalah 75%. Pastikan Anda selalu mengisi absensi tepat waktu di setiap sesi kuliah.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                Ketepatan Waktu: Prioritas Utama
              </div>
            </div>

            {/* Card 2: Deadline Tugas */}
            <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-100">
                    Tenggat Pengumpulan Tugas
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                  Periksa menu Materi & Tugas secara berkala. Hindari mengunggah tugas di menit-menit akhir untuk mencegah kendala jaringan internet atau keterlambatan sistem.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-amber-200 dark:border-amber-800 text-xs font-extrabold text-amber-800 dark:text-amber-300">
                Menu: Materi & Tugas Kuliah
              </div>
            </div>

            {/* Card 3: Bimbingan & Konseling */}
            <div className="rounded-3xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
                    <Heart className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-rose-950 dark:text-rose-100">
                    Layanan Konseling & Bimbingan
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
                  Dosen Pembimbing Akademik dan Unit Layanan Konseling Psikologi siap mendampingi Anda menghadapi kendala perkuliahan maupun kesehatan emosional.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-rose-200 dark:border-rose-800 text-xs font-extrabold text-rose-800 dark:text-rose-300">
                Hubungi: Dosen Pembimbing Akademik
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
