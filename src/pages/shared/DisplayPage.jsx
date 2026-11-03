import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  DoorOpen,
  ExternalLink,
  Heart,
  Layers,
  MapPin,
  Maximize2,
  Megaphone,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  Tv,
  UsersRound,
  Video,
  Volume2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { DAYS, dayOrder, formatDate, formatDayDate } from '../../lib/utils'
import { Badge, Button, Card, EmptyState, Skeleton } from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

const PSYCHOLOGY_REMINDERS = [
  {
    id: 1,
    title: 'Teknik Pomodoro & Istirahat',
    message: 'Fokus belajar 25 menit, lalu istirahat 5 menit. Otak Anda butuh jeda untuk menyerap informasi secara optimal.',
    category: 'Manajemen Belajar',
    tone: 'teal',
    mascot: 'minum',
  },
  {
    id: 2,
    title: 'Pernapasan 4-7-8 untuk Ketenangan',
    message: 'Tarik napas 4 detik, tahan 7 detik, dan hembuskan perlahan 8 detik. Efektif menurunkan detak jantung dan kecemasan.',
    category: 'Mindfulness',
    tone: 'sky',
    mascot: 'memeluk-hati',
  },
  {
    id: 3,
    title: 'Hidrasi Cukup Menjaga Fokus',
    message: 'Dehidrasi ringan 2% bisa menurunkan daya konsentrasi hingga 20%. Pastikan minum air putih secara teratur.',
    category: 'Kebugaran',
    tone: 'amber',
    mascot: 'semangat',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20 untuk Mata',
    message: 'Setiap 20 menit menatap layar laptop/HP, alihkan pandangan sejauh 20 kaki (6 meter) selama 20 detik.',
    category: 'Kesehatan Mata',
    tone: 'violet',
    mascot: 'laptop',
  },
]

export default function DisplayPage() {
  const { user, isStaff } = useAuth()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'schedules', 'announcements', 'reminders'
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [reminderIndex, setReminderIndex] = useState(0)

  // Real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto rotate tabs if enabled (e.g. for TV display)
  useEffect(() => {
    if (!autoRotate) return
    const tabs = ['all', 'schedules', 'announcements', 'reminders']
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const nextIndex = (tabs.indexOf(current) + 1) % tabs.length
        return tabs[nextIndex]
      })
    }, 12000)
    return () => clearInterval(interval)
  }, [autoRotate])

  // Cycle psychological tips every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setReminderIndex((prev) => (prev + 1) % PSYCHOLOGY_REMINDERS.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Fetch announcements
  const { data: announcements, loading: loadingAnnouncements } = useApiData('/announcements', {
    per_page: 6,
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

  return (
    <div className={`space-y-6 ${isFullscreen ? 'p-6 sm:p-8 bg-slate-950 text-white min-h-screen overflow-y-auto' : ''}`}>
      {/* Top Banner / Ticker Display */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="hero-dots absolute inset-0 opacity-15" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
              <Tv className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">
                  Live Smart Display Board
                </p>
              </div>
              <h1 className="text-lg font-bold sm:text-xl text-white">
                Pusat Informasi & Jadwal Terpadu
              </h1>
            </div>
          </div>

          {/* Clock & Fullscreen Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Card */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3.5 py-1.5 backdrop-blur-md">
              <Clock className="h-4 w-4 text-teal-400" />
              <div className="text-right">
                <p className="font-mono text-sm font-bold tracking-wider text-teal-300">
                  {timeString} <span className="text-[10px] font-normal text-slate-400">WIB</span>
                </p>
                <p className="text-[10px] text-slate-300">{dateString}</p>
              </div>
            </div>

            {/* Auto-Slide Toggle */}
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                autoRotate
                  ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200'
                  : 'border-white/10 bg-black/20 text-slate-300 hover:bg-black/40'
              }`}
              title="Putar otomatis tiap 12 detik"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Auto-Slide</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-teal-600 hover:bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              title="Mode Layar Penuh (TV Display)"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (TV)'}</span>
            </button>
          </div>
        </div>

        {/* Running Ticker Bar */}
        <div className="border-t border-white/10 bg-black/40 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-teal-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-950">
              Sekilas Info
            </span>
            <div className="truncate text-slate-200">
              {announcements?.[0]?.title ? (
                <span>📢 {announcements[0].title} — {announcements[0].excerpt || 'Cek rincian di panel pengumuman.'}</span>
              ) : (
                <span>Selamat datang di Psikologi Connect App STIT Muhammadiyah Kediri • Cek jadwal dan tugas secara berkala.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Semua Tampilan', icon: Layers },
            { id: 'schedules', label: `Jadwal Hari Ini (${todaySchedules.length})`, icon: CalendarDays },
            { id: 'announcements', label: 'Pengumuman Terkini', icon: Megaphone },
            { id: 'reminders', label: 'Pengingat & Motivasi', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <Badge variant="teal">Hari: {currentDayName}</Badge>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Jadwal Kuliah & Pengumuman (8 cols) */}
        <div className={`space-y-6 ${activeTab === 'reminders' ? 'hidden' : 'lg:col-span-8'}`}>
          {/* SECTION 1: JADWAL KULIAH HARI INI */}
          {(activeTab === 'all' || activeTab === 'schedules') && (
            <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Jadwal Perkuliahan Hari Ini ({currentDayName})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Daftar mata kuliah yang berlangsung hari ini.
                    </p>
                  </div>
                </div>

                {/* Sesuai Permintaan: Maskot Jadwal (Berjalan) */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 px-3 py-1.5 border border-teal-100 dark:border-teal-900/50">
                  <div className="h-10 w-8 overflow-hidden">
                    <MascotGif mascot="berjalan" className="h-10 w-auto object-contain" />
                  </div>
                  <p className="text-[11px] font-medium text-teal-800 dark:text-teal-300 leading-tight">
                    Jaga ritme akademik & hadir tepat waktu!
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingSchedules ? (
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : todaySchedules.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                      <MascotGif mascot="tertidur" className="h-12 w-auto object-contain" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tidak ada jadwal perkuliahan hari ini
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Waktu yang tepat untuk istirahat, mengulang materi, atau menyelesaikan tugas.
                    </p>
                  </div>
                ) : (
                  todaySchedules.map((item, idx) => {
                    const startTime = (item.start_time || '').slice(0, 5)
                    const endTime = (item.end_time || '').slice(0, 5)
                    const isOnline = item.mode === 'online'
                    return (
                      <div
                        key={item.id || idx}
                        className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm font-mono">
                            <span className="text-xs font-bold leading-none">{startTime}</span>
                            <span className="text-[9px] text-teal-200 mt-0.5 leading-none">{endTime}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.course_name || item.course?.name || 'Mata Kuliah'}
                              </h3>
                              <Badge variant={isOnline ? 'info' : 'success'}>
                                {isOnline ? 'Online (Daring)' : 'Tatap Muka'}
                              </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              {item.room && (
                                <span className="flex items-center gap-1">
                                  <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
                                  Ruang {item.room}
                                </span>
                              )}
                              {item.class_name && (
                                <span className="flex items-center gap-1">
                                  <UsersRound className="h-3.5 w-3.5 text-slate-400" />
                                  Kelas {item.class_name}
                                </span>
                              )}
                              {item.lecturer_name && (
                                <span className="truncate">Dosen: {item.lecturer_name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.meeting_link && (
                          <a
                            href={item.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition shadow-xs"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Masuk Kelas
                          </a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          )}

          {/* SECTION 2: PENGUMUMAN TERBARU */}
          {(activeTab === 'all' || activeTab === 'announcements') && (
            <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Pengumuman & Informasi Kampus
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Warta terbaru dari Program Studi & Akademik.
                    </p>
                  </div>
                </div>

                {/* Sesuai Permintaan: Maskot Pengumuman (Menunjuk) */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 px-3 py-1.5 border border-amber-100 dark:border-amber-900/50">
                  <div className="h-10 w-8 overflow-hidden">
                    <MascotGif mascot="menunjuk" className="h-10 w-auto object-contain" />
                  </div>
                  <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300 leading-tight">
                    Cek informasi terbaru di sini!
                  </p>
                </div>
              </div>

              <div className="grid divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {loadingAnnouncements ? (
                  <div className="p-5 space-y-3 col-span-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (announcements || []).length === 0 ? (
                  <div className="p-8 text-center col-span-2">
                    <p className="text-sm text-slate-500">Belum ada pengumuman aktif saat ini.</p>
                  </div>
                ) : (
                  (announcements || []).slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-5 flex flex-col justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                            {ann.category || 'Akademik'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(ann.published_at || ann.created_at)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                          {ann.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                          {ann.excerpt || ann.content?.replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                        <span>Baca selengkapnya</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Pengingat, Motivasi & Maskot Interaktif (4 cols / full if tab) */}
        <div className={`space-y-6 ${activeTab === 'reminders' ? 'col-span-12 max-w-4xl mx-auto' : 'lg:col-span-4'}`}>
          {/* Sesuai Permintaan: Widget Pengingat & Motivasi Kesehatan Mental */}
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-teal-500/10 via-slate-50 to-white dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-teal-600" />
                  {activeReminder.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Tips #{reminderIndex + 1}
                </span>
              </div>

              {/* Animated Mascot Showcase */}
              <div className="my-4 flex items-center justify-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500/20 to-teal-100/50 dark:from-teal-900/40 dark:to-teal-800/20 p-2 shadow-inner ring-4 ring-white dark:ring-slate-800">
                  <MascotGif
                    mascot={activeReminder.mascot}
                    className="h-28 w-auto object-contain transition duration-500 transform hover:scale-105"
                  />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeReminder.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  "{activeReminder.message}"
                </p>
              </div>

              {/* Dot Indicators */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {PSYCHOLOGY_REMINDERS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReminderIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      reminderIndex === idx
                        ? 'w-6 bg-teal-600'
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={`Lihat tips ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Academic Reminders */}
          <Card className="p-5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Akademik</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Presensi & Kehadiran</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pastikan mengisi absensi kuliah tepat waktu.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Batas Pengumpulan Tugas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Periksa deadline tugas di menu Tugas Saya.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 flex items-start gap-2.5">
                <Heart className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Layanan Konseling</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hubungi pembimbing akademik jika membutuhkan konsultasi.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
