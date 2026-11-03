import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  DoorOpen,
  Heart,
  Layers,
  Maximize2,
  Megaphone,
  Minimize2,
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

const PSYCHOLOGY_REMINDERS = [
  {
    id: 1,
    title: 'Teknik Pomodoro & Istirahat',
    message: 'Fokus belajar 25 menit, lalu istirahat 5 menit. Otak Anda butuh jeda berkala untuk menyerap informasi secara optimal.',
    category: 'Manajemen Belajar',
    mascot: 'minum',
  },
  {
    id: 2,
    title: 'Pernapasan 4-7-8 untuk Ketenangan',
    message: 'Tarik napas 4 detik, tahan 7 detik, dan hembuskan perlahan 8 detik. Terbukti efektif menurunkan detak jantung dan kecemasan.',
    category: 'Mindfulness',
    mascot: 'memeluk-hati',
  },
  {
    id: 3,
    title: 'Hidrasi Cukup Menjaga Fokus',
    message: 'Dehidrasi ringan 2% bisa menurunkan daya konsentrasi hingga 20%. Pastikan selalu sediakan air minum saat belajar.',
    category: 'Kebugaran',
    mascot: 'semangat',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20 untuk Mata',
    message: 'Setiap 20 menit menatap layar laptop/HP, alihkan pandangan sejauh 20 kaki (6 meter) selama 20 detik.',
    category: 'Kesehatan Mata',
    mascot: 'laptop',
  },
]

export default function DisplayPage() {
  const { isStaff } = useAuth()
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

  // Cycle psychological tips every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setReminderIndex((prev) => (prev + 1) % PSYCHOLOGY_REMINDERS.length)
    }, 12000)
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="hero-dots absolute inset-0 opacity-15" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
              <Tv className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">
                  Live Display Board
                </p>
              </div>
              <h1 className="text-xl font-bold sm:text-2xl text-white">
                Pusat Informasi & Jadwal Terpadu
              </h1>
            </div>
          </div>

          {/* Clock & Fullscreen Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/40 px-4 py-2 backdrop-blur-md">
              <Clock className="h-4 w-4 text-teal-400" />
              <div className="text-right">
                <p className="font-mono text-base font-bold tracking-wider text-teal-300 leading-tight">
                  {timeString} <span className="text-[10px] font-normal text-slate-300">WIB</span>
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">{dateString}</p>
              </div>
            </div>

            {/* Auto-Slide Toggle */}
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition ${
                autoRotate
                  ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200'
                  : 'border-white/15 bg-black/20 text-slate-300 hover:bg-black/40'
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
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
              title="Mode Layar Penuh (TV Display)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (TV)'}</span>
            </button>
          </div>
        </div>

        {/* Running Ticker Bar */}
        <div className="border-t border-white/10 bg-black/40 px-6 py-2 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-teal-500 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-950">
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
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

                {/* Maskot Jadwal: Berjalan (Tanpa Teks Menumpuk) */}
                <div className="hidden sm:flex items-center gap-2.5 rounded-2xl bg-teal-500/10 dark:bg-teal-950/40 px-3.5 py-1.5 border border-teal-500/20">
                  <MascotCharacter name="berjalan" className="h-10 w-auto object-contain shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-teal-800 dark:text-teal-300">Maskot Jadwal</p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400">Jaga ritme & hadir tepat waktu!</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingSchedules ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : todaySchedules.length === 0 ? (
                  <div className="py-12 px-6 text-center">
                    <div className="mx-auto mb-3 flex items-center justify-center">
                      <MascotCharacter name="tertidur" className="h-16 w-auto object-contain" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tidak ada jadwal perkuliahan hari ini
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
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
                        className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm font-mono">
                            <span className="text-xs font-bold leading-none">{startTime}</span>
                            <span className="text-[9px] text-teal-200 mt-1 leading-none">{endTime}</span>
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
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition shadow-xs"
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
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

                {/* Maskot Pengumuman: Menunjuk (Tanpa Teks Menumpuk) */}
                <div className="hidden sm:flex items-center gap-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 px-3.5 py-1.5 border border-amber-500/20">
                  <MascotCharacter name="menunjuk" className="h-10 w-auto object-contain shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Warta Terkini</p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">Cek info penting terbaru!</p>
                  </div>
                </div>
              </div>

              <div className="grid divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {loadingAnnouncements ? (
                  <div className="p-6 space-y-3 col-span-2">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <Skeleton className="h-20 w-full rounded-2xl" />
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

        {/* Right Column: Pengingat, Motivasi & Maskot Interaktif (4 cols) */}
        <div className={`space-y-6 ${activeTab === 'reminders' ? 'col-span-12 max-w-3xl mx-auto' : 'lg:col-span-4'}`}>
          {/* Card Motivasi & Self-Care yang Bersih dan Elegan */}
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  {activeReminder.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Tips #{reminderIndex + 1} / {PSYCHOLOGY_REMINDERS.length}
                </span>
              </div>

              {/* Maskot Spotlight (Bersih tanpa teks yang menimpa) */}
              <div className="my-6 flex items-center justify-center">
                <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/20 p-3 shadow-inner">
                  <MascotCharacter
                    name={activeReminder.mascot}
                    className="h-28 w-auto object-contain transition duration-500 hover:scale-110"
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
              <div className="mt-5 flex items-center justify-center gap-1.5">
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
          <Card className="p-6 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengingat Akademik</h3>
                <p className="text-[11px] text-slate-400">Prioritas belajar & perkuliahan</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-3.5 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Presensi & Kehadiran</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pastikan mengisi absensi kuliah tepat waktu setiap sesi perkuliahan.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-3.5 flex items-start gap-3">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Batas Pengumpulan Tugas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Periksa tenggat waktu di menu Materi & Tugas agar tidak terlambat.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-3.5 flex items-start gap-3">
                <Heart className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Kesehatan Mental & Konseling</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Layanan bimbingan & konseling akademik siap membantu saat Anda membutuhkan teman diskusi.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
