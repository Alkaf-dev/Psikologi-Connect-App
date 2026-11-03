import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  DoorOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  LogIn,
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
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { formatDate } from '../../lib/utils'
import { Card, Skeleton } from '../../components/ui'
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

// Curated academic schedule dataset with attendance, material, and group division links
const DEFAULT_ACADEMIC_SCHEDULES = [
  {
    id: 'sch-1',
    day: 'Senin',
    course_code: 'PSI-101',
    course_name: 'Psikologi Umum I',
    lecturer_name: 'Dr. H. Ahmad Fauzi, M.Ag',
    credits: 3,
    start_time: '08:00:00',
    end_time: '09:40:00',
    mode: 'offline',
    room: '102 (Gedung A)',
    class_name: 'PSI-1A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi101',
    material_link: 'https://drive.google.com/drive/folders/psikologi-umum-1',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Sejarah Perkembangan & Definisi Psikologi', leader: 'Ahmad Zaki', members: ['Ahmad Zaki', 'Nabila Putri', 'Rizky Pratama', 'Siti Fatimah'] },
      { name: 'Kelompok 2', topic: 'Struktur dan Fungsi Otak dalam Perilaku', leader: 'Farhan Maulana', members: ['Farhan Maulana', 'Dewi Lestari', 'Bayu Anggoro', 'Alfi Rahma'] },
      { name: 'Kelompok 3', topic: 'Sensasi, Persepsi, dan Kesadaran Manusia', leader: 'Chusnul Hidayah', members: ['Chusnul Hidayah', 'M. Ilham', 'Nurul Aini', 'Rendi Septian'] },
      { name: 'Kelompok 4', topic: 'Prinsip Belajar, Memori, dan Kognisi', leader: 'Dina Anatasya', members: ['Dina Anatasya', 'Taufik Hidayat', 'Vina Melati', 'Zulfa Hanum'] },
    ],
  },
  {
    id: 'sch-2',
    day: 'Senin',
    course_code: 'PSI-103',
    course_name: 'Sejarah & Aliran Psikologi',
    lecturer_name: 'Nurul Hidayah, M.Psi., Psikolog',
    credits: 2,
    start_time: '10:00:00',
    end_time: '11:40:00',
    mode: 'offline',
    room: '102 (Gedung A)',
    class_name: 'PSI-1A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi103',
    material_link: 'https://drive.google.com/drive/folders/sejarah-aliran-psikologi',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Aliran Strukturalisme & Fungsionalisme', leader: 'Bagus Setiawan', members: ['Bagus Setiawan', 'Anisa Rahma', 'Dimas Prasetyo'] },
      { name: 'Kelompok 2', topic: 'Psikoanalisis Klasik Sigmund Freud', leader: 'Laila Munawaroh', members: ['Laila Munawaroh', 'Fikri Haikal', 'Tiara Putri'] },
      { name: 'Kelompok 3', topic: 'Behaviorisme: Watson, Pavlov, dan Skinner', leader: 'Galih Ramadhan', members: ['Galih Ramadhan', 'Rina Wulandari', 'Yusuf Hakim'] },
      { name: 'Kelompok 4', topic: 'Psikologi Humanistik Carl Rogers & Maslow', leader: 'Siti Aminah', members: ['Siti Aminah', 'Rian Kurniawan', 'Hana Safitri'] },
    ],
  },
  {
    id: 'sch-3',
    day: 'Selasa',
    course_code: 'PSI-201',
    course_name: 'Psikologi Perkembangan Anak & Remaja',
    lecturer_name: 'Dra. Hj. Siti Masruroh, M.Psi',
    credits: 3,
    start_time: '08:00:00',
    end_time: '09:40:00',
    mode: 'offline',
    room: '201 (Gedung B)',
    class_name: 'PSI-2A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi201',
    material_link: 'https://drive.google.com/drive/folders/psikologi-perkembangan',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Tahapan Perkembangan Kognitif Jean Piaget', leader: 'Fajar Nugroho', members: ['Fajar Nugroho', 'Adinda Pratiwi', 'Bima Saputra', 'Citra Kirana'] },
      { name: 'Kelompok 2', topic: 'Tugas Perkembangan Psikososial Erik Erikson', leader: 'Hendra Gunawan', members: ['Hendra Gunawan', 'Eka Susanti', 'Irfan Hakim', 'Kiki Amelia'] },
      { name: 'Kelompok 3', topic: 'Dinamika Identitas Diri pada Masa Remaja', leader: 'Mega Puspita', members: ['Mega Puspita', 'Lutfi Hakim', 'Nada Salsabila', 'Oscar Surya'] },
      { name: 'Kelompok 4', topic: 'Pengaruh Pola Asuh Orang Tua terhadap Emosi Anak', leader: 'Putri Handayani', members: ['Putri Handayani', 'Qori Akbar', 'Rani Permata', 'Syahrul Ramadhan'] },
    ],
  },
  {
    id: 'sch-4',
    day: 'Selasa',
    course_code: 'PSI-205',
    course_name: 'Psikologi Kepribadian Islam',
    lecturer_name: 'M. Arif Wicaksono, M.Pd.I',
    credits: 2,
    start_time: '10:00:00',
    end_time: '11:40:00',
    mode: 'online',
    room: 'Virtual Room',
    class_name: 'PSI-2A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi205',
    material_link: 'https://drive.google.com/drive/folders/kepribadian-islam',
    meeting_link: 'https://zoom.us/j/psikologiconnect-stit',
    groups: [
      { name: 'Kelompok 1', topic: 'Konsep Nafs, Qalb, dan Ruh dalam Psikologi Islam', leader: 'Rifqi Pratama', members: ['Rifqi Pratama', 'Salma Zahra', 'Taufiqurrahman', 'Ulfah Fauziyah'] },
      { name: 'Kelompok 2', topic: 'Tipologi Kepribadian menurut Imam Al-Ghazali', leader: 'Wira Kusuma', members: ['Wira Kusuma', 'Vira Amanda', 'Yayan Ruhian', 'Zaskia Fitri'] },
      { name: 'Kelompok 3', topic: 'Pendidikan Karakter & Tazkiyatun Nafs', leader: 'Aldi Taher', members: ['Aldi Taher', 'Bella Safira', 'Cahya Kamila', 'Dani Saputra'] },
      { name: 'Kelompok 4', topic: 'Kesehatan Mental Perspektif Hadis Nabi', leader: 'Erna Marlina', members: ['Erna Marlina', 'Fandy Christian', 'Gina Sonia', 'Hafizh Syahrin'] },
    ],
  },
  {
    id: 'sch-5',
    day: 'Selasa',
    course_code: 'PSI-307',
    course_name: 'Metodologi Penelitian Kualitatif',
    lecturer_name: 'Dr. Muhammad Ridwan, M.Si',
    credits: 3,
    start_time: '13:00:00',
    end_time: '14:40:00',
    mode: 'offline',
    room: 'Lab Psikologi Terpadu',
    class_name: 'PSI-3A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi307',
    material_link: 'https://drive.google.com/drive/folders/metlit-kualitatif',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Riset Fenomenologis Mahasiswa Berprestasi', leader: 'Iqbal Ramadhan', members: ['Iqbal Ramadhan', 'Jihan Audy', 'Kevin Julio', 'Luna Maya'] },
      { name: 'Kelompok 2', topic: 'Studi Kasus Penanganan Trauma Korban Bencana', leader: 'Mario Teguh', members: ['Mario Teguh', 'Nadine Chandrawinata', 'Oki Setiana', 'Pevita Pearce'] },
      { name: 'Kelompok 3', topic: 'Teknik Wawancara Mendalam & Triangulasi Data', leader: 'Raffi Ahmad', members: ['Raffi Ahmad', 'Sule Prikitiw', 'Titi Kamal', 'Uus Rizky'] },
    ],
  },
  {
    id: 'sch-6',
    day: 'Rabu',
    course_code: 'PSI-203',
    course_name: 'Psikometri & Konstruksi Tes',
    lecturer_name: 'Dian Permatasari, M.Psi., Psikolog',
    credits: 3,
    start_time: '08:00:00',
    end_time: '09:40:00',
    mode: 'offline',
    room: 'Lab Psikodiagnostika',
    class_name: 'PSI-2A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi203',
    material_link: 'https://drive.google.com/drive/folders/psikometri-tes',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Validitas dan Reliabilitas Alat Ukur', leader: 'Aji Pangestu', members: ['Aji Pangestu', 'Bunga Citra', 'Cakra Khan'] },
      { name: 'Kelompok 2', topic: 'Penyusunan Skala Likert Psikologis', leader: 'Doni Tata', members: ['Doni Tata', 'Enzy Storia', 'Fero Walandouw'] },
    ],
  },
  {
    id: 'sch-7',
    day: 'Rabu',
    course_code: 'PSI-301',
    course_name: 'Psikologi Sosial & Dinamika Kelompok',
    lecturer_name: 'Drs. Bambang Sutikno, M.Si',
    credits: 3,
    start_time: '10:00:00',
    end_time: '11:40:00',
    mode: 'offline',
    room: '202 (Gedung B)',
    class_name: 'PSI-3A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi301',
    material_link: 'https://drive.google.com/drive/folders/psikologi-sosial',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Konformitas, Kepatuhan, dan Pengaruh Sosial', leader: 'Gilang Dirga', members: ['Gilang Dirga', 'Hesti Purwadinata', 'Indra Bekti'] },
      { name: 'Kelompok 2', topic: 'Prasangka Sosial & Resolusi Konflik', leader: 'Judika Sihotang', members: ['Judika Sihotang', 'Kunto Aji', 'Lyodra Ginting'] },
    ],
  },
  {
    id: 'sch-8',
    day: 'Kamis',
    course_code: 'PSI-305',
    course_name: 'Teori Konseling & Psikoterapi Islam',
    lecturer_name: 'Dr. Hj. Zulaikha, M.Pd.I',
    credits: 3,
    start_time: '08:00:00',
    end_time: '09:40:00',
    mode: 'offline',
    room: '301 (Gedung C)',
    class_name: 'PSI-3A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi305',
    material_link: 'https://drive.google.com/drive/folders/konseling-islam',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Keterampilan Dasar Micro-Counseling', leader: 'Marcell Siahaan', members: ['Marcell Siahaan', 'Novia Bachmid', 'Once Mekel'] },
      { name: 'Kelompok 2', topic: 'Integrasi Nilai Qurani dalam Konseling', leader: 'Prilly Latuconsina', members: ['Prilly Latuconsina', 'Rossa Roslaina', 'Slank Bimbim'] },
    ],
  },
  {
    id: 'sch-9',
    day: 'Jumat',
    course_code: 'PSI-401',
    course_name: 'Praktikum Asesmen Bakat & Minat',
    lecturer_name: 'Tim Laboratorium Psikologi STIT',
    credits: 2,
    start_time: '08:00:00',
    end_time: '09:40:00',
    mode: 'offline',
    room: 'Ruang Asesmen Terpadu',
    class_name: 'PSI-4A',
    attendance_link: 'https://presensi.stitmuh-kediri.ac.id/psi401',
    material_link: 'https://drive.google.com/drive/folders/praktikum-asesmen',
    meeting_link: '',
    groups: [
      { name: 'Kelompok 1', topic: 'Instruksi Administrasi Tes RMIB & DAT', leader: 'Tulus Rusydi', members: ['Tulus Rusydi', 'Upi Avianto', 'Vidi Aldiano'] },
      { name: 'Kelompok 2', topic: 'Skoring & Laporan Psikologis Siswa', leader: 'Widy Soediro', members: ['Widy Soediro', 'Yura Yunita', 'Ziva Magnolya'] },
    ],
  },
]

// Professional psychological self-care tips
const PSYCHOLOGY_REMINDERS = [
  {
    id: 1,
    title: 'Teknik Pomodoro & Jeda Belajar Efektif',
    quote: 'Belajar fokus selama 25 menit, lalu luangkan jeda istirahat 5 menit. Otak manusia memerlukan ritme berkala untuk menyerap dan mengonsolidasi memori secara optimal.',
    category: 'Manajemen Belajar',
    mascot: 'minum',
    actionText: 'Rileks sejenak dan minum segelas air putih',
  },
  {
    id: 2,
    title: 'Latihan Pernapasan 4-7-8 untuk Meredakan Kecemasan',
    quote: 'Tarik napas perlahan 4 detik, tahan selama 7 detik, dan hembuskan pelan melalui mulut 8 detik. Latihan ini menstimulasi saraf parasimpatis untuk meredakan ketegangan.',
    category: 'Mindfulness & Relaksasi',
    mascot: 'memeluk-hati',
    actionText: 'Lakukan 3–4 siklus hingga pernapasan teratur',
  },
  {
    id: 3,
    title: 'Kecukupan Hidrasi untuk Daya Konsentrasi Maksimal',
    quote: 'Penurunan cairan tubuh sebesar 2% dapat menurunkan daya konsentrasi, kewaspadaan, dan kecepatan kognitif hingga 20%. Selalu sediakan botol air saat belajar.',
    category: 'Kebugaran Kognitif',
    mascot: 'semangat',
    actionText: 'Minum minimal 250 ml air sekarang',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20 untuk Mencegah Kelelahan Mata',
    quote: 'Tiap 20 menit menatap layar monitor atau ponsel, istirahatkan mata dengan memandang objek berjarak 20 kaki (sekitar 6 meter) selama 20 detik.',
    category: 'Kesehatan Visual',
    mascot: 'laptop',
    actionText: 'Alihkan pandangan ke luar jendela atau tanaman hijau',
  },
]

const SLIDES = [
  { id: 'schedules', title: 'Jadwal & Ruang Kuliah', icon: CalendarDays },
  { id: 'announcements', title: 'Pengumuman Kampus', icon: Megaphone },
  { id: 'motivation', title: 'Motivasi & Self-Care', icon: Sparkles },
  { id: 'reminders', title: 'Pengingat Akademik', icon: Bell },
]

export default function DisplayPage() {
  const { user, isStaff } = useAuth()
  const location = useLocation()

  // Detect whether this is accessed as a standalone public display (e.g. at /display)
  const isPublicDisplay = location.pathname === '/display'

  const [currentSlide, setCurrentSlide] = useState('schedules')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [reminderIndex, setReminderIndex] = useState(0)
  const [slideProgress, setSlideProgress] = useState(0)

  // Day filter in schedule slide: 'today', 'all', or specific day ('Senin', 'Selasa', etc.)
  const [selectedDayFilter, setSelectedDayFilter] = useState('today')

  // Selected schedule item for Group Detail Modal
  const [selectedGroupSchedule, setSelectedGroupSchedule] = useState(null)

  // Real-time clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto rotate slides every 10 seconds if autoRotate is true
  useEffect(() => {
    if (!autoRotate || currentSlide === 'all' || selectedGroupSchedule) {
      setSlideProgress(0)
      return
    }

    const DURATION = 10000 // 10s per slide
    const STEP = 200
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
  }, [autoRotate, currentSlide, selectedGroupSchedule])

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

  // Fetch schedules if authenticated; fallback cleanly to curated datasets if unauthenticated
  const schedulePath = user ? (isStaff ? '/staff/schedules' : '/student/schedules') : null
  const { data: rawSchedules, loading: loadingSchedules } = useApiData(
    schedulePath,
    { per_page: 50 },
    { enabled: Boolean(user && schedulePath) },
  )

  // Combined master schedules list (enriched with attendance and material links)
  const masterSchedules = useMemo(() => {
    if (Array.isArray(rawSchedules) && rawSchedules.length > 0) {
      return rawSchedules.map((item, idx) => {
        const fallback = DEFAULT_ACADEMIC_SCHEDULES[idx % DEFAULT_ACADEMIC_SCHEDULES.length]
        return {
          ...fallback,
          ...item,
          attendance_link: item.attendance_link || fallback.attendance_link,
          material_link: item.material_link || fallback.material_link,
          meeting_link: item.meeting_link || (item.mode === 'online' ? fallback.meeting_link : ''),
          groups: item.groups || fallback.groups,
        }
      })
    }
    return DEFAULT_ACADEMIC_SCHEDULES
  }, [rawSchedules])

  // Detect current day in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const currentDayName = dayNames[currentTime.getDay()]

  // Filtered schedules based on day filter
  const displayedSchedules = useMemo(() => {
    if (selectedDayFilter === 'today') {
      const todayList = masterSchedules.filter(
        (item) => (item.day || '').toLowerCase() === currentDayName.toLowerCase(),
      )
      // If today is a weekend or has no classes, fallback to showing all active weekly classes
      return todayList.length > 0 ? todayList : masterSchedules
    }
    if (selectedDayFilter === 'all') {
      return masterSchedules
    }
    return masterSchedules.filter(
      (item) => (item.day || '').toLowerCase() === selectedDayFilter.toLowerCase(),
    )
  }, [masterSchedules, selectedDayFilter, currentDayName])

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
      if (selectedGroupSchedule) {
        if (e.key === 'Escape') setSelectedGroupSchedule(null)
        return
      }
      if (currentSlide === 'all') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, selectedGroupSchedule])

  // Digital time and date strings
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
    <div
      className={`min-h-screen space-y-6 ${
        isPublicDisplay
          ? 'p-4 sm:p-8 lg:p-10 bg-slate-900 text-slate-100'
          : isFullscreen
            ? 'p-6 sm:p-10 bg-slate-950 text-white overflow-y-auto'
            : ''
      }`}
    >
      {/* ============================================================== */}
      {/* 1. TOP HEADER: Refined Academic Signage & Realtime Digital Clock */}
      {/* ============================================================== */}
      <header className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-teal-800/40">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 opacity-90 pointer-events-none" />
        <div className="hero-dots absolute inset-0 opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
          {/* Institution & Title */}
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-800/40 text-teal-200 ring-1 ring-teal-500/30 shadow-inner">
              <Tv className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-300">
                  Papan Informasi Digital Terpadu
                </p>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Psikologi Connect STIT
              </h1>
              <p className="text-xs text-slate-300 font-medium hidden sm:block">
                Program Studi Psikologi Islam • STIT Muhammadiyah Kediri
              </p>
            </div>
          </div>

          {/* Clock, Public Controls & Portal Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clock Widget */}
            <div className="flex items-center gap-3 rounded-2xl border border-teal-500/25 bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-inner">
              <Clock className="h-5 w-5 text-teal-300 shrink-0" />
              <div className="text-right">
                <p className="font-mono text-lg sm:text-xl font-extrabold tracking-wider text-teal-300 leading-none">
                  {timeString} <span className="text-[11px] font-semibold text-slate-300">WIB</span>
                </p>
                <p className="text-[11px] font-medium text-slate-300 mt-1 leading-none">{dateString}</p>
              </div>
            </div>

            {/* Auto-Slide Toggle */}
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition shadow-sm ${
                autoRotate
                  ? 'border-teal-500/50 bg-teal-800/30 text-teal-200 hover:bg-teal-800/40'
                  : 'border-slate-700 bg-black/40 text-slate-300 hover:bg-black/60'
              }`}
              title={autoRotate ? 'Jeda pergantian slide otomatis' : 'Nyalakan pergantian slide otomatis'}
            >
              {autoRotate ? (
                <>
                  <Pause className="h-4 w-4 text-teal-300" />
                  <span className="hidden sm:inline">Auto-Slide: Aktif</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-slate-400" />
                  <span className="hidden sm:inline">Auto-Slide: Jeda</span>
                </>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-2xl border border-teal-600/40 bg-teal-800 hover:bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
              title="Mode Layar Penuh (TV Display)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{isFullscreen ? 'Keluar' : 'Layar Penuh (TV)'}</span>
            </button>

            {/* Portal Login / Back to Dashboard Link */}
            {isPublicDisplay ? (
              user ? (
                <Link
                  to={isStaff ? '/admin' : '/portal'}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-white transition shadow-sm"
                >
                  <GraduationCap className="h-4 w-4 text-teal-300" />
                  <span className="hidden sm:inline">Buka Portal</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-teal-500/40 bg-teal-700 hover:bg-teal-600 px-3.5 py-2.5 text-xs font-bold text-white transition shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk Portal</span>
                </Link>
              )
            ) : (
              <Link
                to="/display"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition shadow-sm"
                title="Buka display di tab baru (tampilan layar penuh mandiri)"
              >
                <ExternalLink className="h-4 w-4 text-teal-300" />
                <span className="hidden sm:inline">Buka Mandiri</span>
              </Link>
            )}
          </div>
        </div>

        {/* Running Ticker Bar */}
        <div className="border-t border-teal-900/50 bg-black/40 px-6 py-2 text-xs font-medium backdrop-blur-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 text-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <Megaphone className="h-3 w-3" />
              Sekilas Warta
            </span>
            <div className="truncate text-slate-200">
              {announcements?.[0]?.title ? (
                <span>
                  <strong>{announcements[0].title}</strong> — {announcements[0].excerpt || 'Periksa rincian lengkap di slide Pengumuman.'}
                </span>
              ) : (
                <span>Selamat datang di Display Informasi Prodi Psikologi Islam STIT Muhammadiyah Kediri. Cek jadwal, absensi, dan tautan materi setiap sesi.</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. NAVIGATION BAR: Harmonious Tabs, Controls & Progress Bar    */}
      {/* ============================================================== */}
      <nav aria-label="Navigasi Display" className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                    isActive
                      ? 'bg-teal-800 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{idx + 1}. {slide.title}</span>
                </button>
              )
            })}

            {/* Grid overview */}
            <button
              type="button"
              onClick={() => setCurrentSlide('all')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                currentSlide === 'all'
                  ? 'bg-teal-800 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              title="Tampilkan seluruh slide dalam satu halaman ringkasan"
            >
              <Layers className="h-4 w-4" />
              <span>Semua Panel (Grid)</span>
            </button>
          </div>

          {/* Slide Arrow Controls & Indicator */}
          <div className="flex items-center gap-3">
            {currentSlide !== 'all' && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={goToPrevSlide}
                  className="rounded-lg p-1.5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-teal-800 transition"
                  title="Slide Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {currentSlideIndex + 1} / {SLIDES.length}
                </span>
                <button
                  type="button"
                  onClick={goToNextSlide}
                  className="rounded-lg p-1.5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-teal-800 transition"
                  title="Slide Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <span className="rounded-xl bg-teal-800/10 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-700/20 px-3 py-1.5 text-xs font-bold">
              Hari: {currentDayName}
            </span>
          </div>
        </div>

        {/* Auto-Slide Progress Bar */}
        {autoRotate && currentSlide !== 'all' && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-teal-700 transition-all duration-200 ease-linear"
              style={{ width: `${slideProgress}%` }}
            />
          </div>
        )}
      </nav>

      {/* ============================================================== */}
      {/* 3. SLIDE 1: JADWAL KULIAH, ABSENSI, MATERI & KELOMPOK           */}
      {/* ============================================================== */}
      {(currentSlide === 'schedules' || currentSlide === 'all') && (
        <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          {/* Header Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-sm">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Jadwal Kuliah, Absensi & Materi
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tautan presensi online, materi modul, serta pembagian kelompok per mata kuliah.
                </p>
              </div>
            </div>

            {/* Mascot Disiplin */}
            <div className="flex items-center gap-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 border border-teal-200 dark:border-teal-800">
              <MascotCharacter name="berjalan" className="h-9 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-teal-900 dark:text-teal-200">Kehadiran & Materi</p>
                <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">Presensi tepat waktu</p>
              </div>
            </div>
          </div>

          {/* Filter Hari Perkuliahan */}
          <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Pilih Hari:</span>
                {[
                  { id: 'today', label: `Hari Ini (${currentDayName})` },
                  { id: 'Senin', label: 'Senin' },
                  { id: 'Selasa', label: 'Selasa' },
                  { id: 'Rabu', label: 'Rabu' },
                  { id: 'Kamis', label: 'Kamis' },
                  { id: 'Jumat', label: 'Jumat' },
                  { id: 'all', label: 'Semua Hari' },
                ].map((item) => {
                  const isSelected = selectedDayFilter === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDayFilter(item.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                        isSelected
                          ? 'bg-teal-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Menampilkan <strong>{displayedSchedules.length}</strong> sesi mata kuliah
              </span>
            </div>
          </div>

          {/* Cards Grid: Course Cards with Attendance, Material & Group Links */}
          <div className="p-6 sm:p-8">
            {displayedSchedules.length === 0 ? (
              <div className="py-12 px-6 text-center max-w-xl mx-auto">
                <div className="mb-4 flex items-center justify-center">
                  <div className="rounded-3xl bg-teal-50 dark:bg-teal-950/40 p-4 border border-teal-200 dark:border-teal-800">
                    <MascotCharacter name="tertidur" className="h-20 w-auto object-contain" />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Tidak Ada Jadwal Kuliah pada Hari Ini
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                  Pilih tab hari lain di atas untuk melihat jadwal, tautan materi, dan kelompok matkul lainnya.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedSchedules.map((item, idx) => {
                  const startTime = (item.start_time || '').slice(0, 5)
                  const endTime = (item.end_time || '').slice(0, 5)
                  const isOnline = item.mode === 'online'
                  const groupCount = item.groups ? item.groups.length : 0

                  return (
                    <div
                      key={item.id || idx}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-xs transition hover:shadow-md hover:border-teal-700/50"
                    >
                      <div>
                        {/* Course Header & Time Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-teal-800 text-white font-mono text-xs font-extrabold px-2.5 py-1">
                              {startTime} - {endTime}
                            </span>
                            <span className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              {item.day || currentDayName}
                            </span>
                          </div>

                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
                              isOnline
                                ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                            }`}
                          >
                            {isOnline ? 'Online Zoom' : 'Tatap Muka'}
                          </span>
                        </div>

                        {/* Title & Code */}
                        <div className="mb-3">
                          <p className="text-[11px] font-bold text-teal-800 dark:text-teal-400 font-mono">
                            {item.course_code || 'PSI'} • {item.credits ? `${item.credits} SKS` : '3 SKS'}
                          </p>
                          <h3 className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5 leading-snug">
                            {item.course_name || item.name || 'Mata Kuliah'}
                          </h3>
                        </div>

                        {/* Room & Lecturer */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-1.5">
                            <DoorOpen className="h-4 w-4 text-teal-700 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Ruang: {item.room || 'Ruang Perkuliahan'}
                            </span>
                          </div>
                          {item.lecturer_name && (
                            <p className="truncate font-medium text-slate-700 dark:text-slate-300">
                              Dosen: <strong>{item.lecturer_name}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4 Standard Action Cards / Buttons */}
                      <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-2">
                          {/* 1. Link Absensi */}
                          <a
                            href={item.attendance_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-200 border border-teal-200/90 dark:border-teal-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                            title="Buka form atau tautan absensi kuliah"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                            <span>Presensi</span>
                          </a>

                          {/* 2. Link Materi */}
                          <a
                            href={item.material_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                            title="Buka folder materi dan modul perkuliahan"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Materi</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* 3. Link / Modal Kelompok */}
                          <button
                            type="button"
                            onClick={() => setSelectedGroupSchedule(item)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700/80 dark:text-slate-200 border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-bold transition shadow-2xs"
                            title="Lihat pembagian kelompok dan anggota tugas"
                          >
                            <UsersRound className="h-3.5 w-3.5 text-slate-700" />
                            <span>Kelompok ({groupCount})</span>
                          </button>

                          {/* 4. Link Kelas Online Virtual */}
                          {item.meeting_link ? (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 border border-sky-200/90 dark:border-sky-800 px-3 py-2 text-xs font-bold transition shadow-2xs"
                              title="Masuk ruang Zoom / Google Meet kelas"
                            >
                              <Video className="h-3.5 w-3.5 text-sky-700" />
                              <span>Kelas Virtual</span>
                            </a>
                          ) : (
                            <div className="flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-2 text-[11px] font-medium text-center">
                              Tatap Muka
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 4. SLIDE 2: PENGUMUMAN & WARTA KAMPUS                         */}
      {/* ============================================================== */}
      {(currentSlide === 'announcements' || currentSlide === 'all') && (
        <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-sm">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Pengumuman & Warta Kampus
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Warta resmi akademik, kemahasiswaan, dan agenda kegiatan prodi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 border border-teal-200 dark:border-teal-800">
              <MascotCharacter name="menunjuk" className="h-9 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-teal-900 dark:text-teal-200">Warta Terkini</p>
                <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">Cek info penting prodi</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loadingAnnouncements ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (announcements || []).length === 0 ? (
              <div className="py-12 px-6 text-center">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengumuman baru yang dipublikasikan saat ini.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(announcements || []).slice(0, 6).map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-5 shadow-xs transition hover:shadow-md hover:border-teal-700/50"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="rounded-lg bg-teal-800 text-white px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
                          {ann.category || 'Akademik'}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {formatDate(ann.published_at || ann.created_at)}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-950 dark:text-white line-clamp-2">
                        {ann.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {ann.excerpt || ann.content?.replace(/<[^>]+>/g, '')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
                      <span>Rincian Pengumuman</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 5. SLIDE 3: MOTIVASI & SELF-CARE (SPOTLIGHT SERASI)           */}
      {/* ============================================================== */}
      {(currentSlide === 'motivation' || currentSlide === 'all') && (
        <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Kesehatan Mental & Self-Care Mahasiswa
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Panduan mindfulness, ritme belajar terstruktur, dan pemulihan fokus.
                </p>
              </div>
            </div>

            <span className="rounded-xl bg-teal-800/10 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-700/20 px-3 py-1 text-xs font-extrabold">
              Tips #{reminderIndex + 1} dari {PSYCHOLOGY_REMINDERS.length}
            </span>
          </div>

          <div className="p-6 sm:p-10">
            {/* Main Spotlight Box */}
            <div className="rounded-3xl border border-teal-700/30 bg-slate-50/70 dark:bg-slate-800/50 p-6 sm:p-10 shadow-xs">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                {/* Mascot Frame */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
                  <div className="flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center rounded-3xl bg-white dark:bg-slate-900 border border-teal-600/30 p-4 shadow-md">
                    <MascotCharacter
                      name={activeReminder.mascot}
                      className="h-36 sm:h-44 w-auto object-contain transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-teal-800 text-white px-3.5 py-1 text-xs font-extrabold shadow-2xs">
                    {activeReminder.category}
                  </span>
                </div>

                {/* Message & Quote */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
                    {activeReminder.title}
                  </h3>

                  <blockquote className="rounded-2xl border-l-4 border-teal-700 bg-white dark:bg-slate-900 p-5 shadow-xs text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed italic">
                    "{activeReminder.quote}"
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-bold text-xs">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Langkah Praktis: {activeReminder.actionText}
                      </span>
                    </div>

                    {/* Dot Selectors */}
                    <div className="flex items-center gap-2">
                      {PSYCHOLOGY_REMINDERS.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReminderIndex(idx)}
                          className={`h-2.5 rounded-full transition-all ${
                            idx === reminderIndex
                              ? 'w-7 bg-teal-800 shadow-2xs'
                              : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                          }`}
                          title={`Lihat tips ke-${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  ⏱️ Ritme Pomodoro
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">25 Menit Fokus Penuh</h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Singkirkan gangguan gawai selama 25 menit, lalu berdiri rileks sejenak 5 menit.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  👁️ Relaksasi Visual
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">Metode 20-20-20</h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Tiap 20 menit di depan monitor, alihkan tatapan ke jarak 6 meter selama 20 detik.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4">
                <p className="text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  🧘 Pernapasan Teratur
                </p>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white mt-1">Pernapasan Sadar 4-7-8</h4>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Tarik napas 4 detik, tahan 7 detik, buang 8 detik untuk menstabilkan detak jantung.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 6. SLIDE 4: PENGINGAT AKADEMIK & TATA TERTIB (TANPA KONSELING) */}
      {/* ============================================================== */}
      {(currentSlide === 'reminders' || currentSlide === 'all') && (
        <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-sm">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
                  Pengingat Akademik & Ketertiban Studi
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Pedoman penting untuk kelancaran studi mahasiswa Program Studi Psikologi Islam.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1.5 border border-teal-200 dark:border-teal-800">
              <MascotCharacter name="menyapa" className="h-9 w-auto object-contain shrink-0" />
              <div className="text-left">
                <p className="text-xs font-extrabold text-teal-900 dark:text-teal-200">Kedisiplinan Kampus</p>
                <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">Syarat kelulusan mata kuliah</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid gap-5 md:grid-cols-3">
            {/* Card 1: Presensi Minimal 75% */}
            <div className="rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/60 dark:bg-slate-800/60 p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white shadow-2xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Presensi Kuliah (Min. 75%)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  Batas minimal kehadiran untuk berhak mengikuti Ujian Akhir Semester (UAS) adalah 75%. Pastikan Anda selalu mengisi link presensi yang tertera pada kartu jadwal masing-masing mata kuliah.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-teal-200 dark:border-slate-700 text-xs font-extrabold text-teal-900 dark:text-teal-300">
                Prioritas: Kehadiran Setiap Sesi
              </div>
            </div>

            {/* Card 2: Tenggat Tugas Kelompok & Individu */}
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-2xs">
                    <Clock className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Tenggat Tugas & Kolaborasi
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  Periksa jadwal pengumpulan tugas kelompok dan individu secara berkala. Hindari pengunggahan di batas akhir agar terhindar dari kendala jaringan internet atau keterlambatan sistem.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-300">
                Menu: Materi & Tugas Kuliah
              </div>
            </div>

            {/* Card 3: Etika & Tata Tertib Akademik */}
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-2xs">
                    <FileText className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Etika & Integritas Akademik
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  Seluruh mahasiswa wajib menjaga kejujuran akademik, orisinalitas karya ilmiah bebas plagiarisme, berpakaian rapi dan islami, serta hadir tepat waktu di dalam kelas maupun sesi virtual.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-300">
                Pedoman: Akademik STIT Kediri
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL POPUP: DAFTAR KELOMPOK MATA KULIAH                   */}
      {/* ============================================================== */}
      {selectedGroupSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white">
                  <UsersRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                    Pembagian Kelompok — {selectedGroupSchedule.course_name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Dosen: {selectedGroupSchedule.lecturer_name} • Ruang: {selectedGroupSchedule.room}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGroupSchedule(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Tutup Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Groups List */}
            <div className="p-6 overflow-y-auto space-y-4">
              {(selectedGroupSchedule.groups || []).map((grp, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-lg bg-teal-800 text-white px-2.5 py-0.5 text-xs font-extrabold">
                      {grp.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Ketua: <strong>{grp.leader}</strong>
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                    Topik / Tugas: <span className="font-normal text-slate-700 dark:text-slate-300">{grp.topic}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Anggota Tim ({grp.members?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(grp.members || []).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="rounded-md bg-white dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-3">
              <p className="text-xs text-slate-500 font-medium">
                Gunakan pembagian ini untuk koordinasi tugas perkuliahan.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGroupSchedule(null)}
                className="rounded-xl bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
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
