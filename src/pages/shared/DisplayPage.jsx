import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  ExternalLink,
  GraduationCap,
  Laptop,
  Layers,
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
import { Card, Skeleton } from '../../components/ui'
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

// Minimalist self-care tips
const PSYCHOLOGY_TIPS = [
  {
    id: 1,
    title: 'Teknik Pomodoro',
    quote: '25 menit fokus belajar, 5 menit jeda istirahat. Mengistirahatkan pikiran secara teratur terbukti menjaga daya konsentrasi tetap tinggi.',
    category: 'Manajemen Fokus',
    mascot: 'minum',
  },
  {
    id: 2,
    title: 'Pernapasan 4-7-8',
    quote: 'Tarik napas 4 detik, tahan 7 detik, dan hembuskan perlahan 8 detik. Praktik sederhana ini efektif menstabilkan detak jantung saat menghadapi ujian.',
    category: 'Mindfulness',
    mascot: 'memeluk-hati',
  },
  {
    id: 3,
    title: 'Hidrasi Cukup',
    quote: 'Dehidrasi ringan 2% dapat menurunkan ketelitian hingga 20%. Selalu siapkan air minum saat beraktivitas dan belajar.',
    category: 'Kebugaran',
    mascot: 'semangat',
  },
  {
    id: 4,
    title: 'Aturan 20-20-20',
    quote: 'Tiap 20 menit menatap layar, pandang objek berjarak 6 meter selama 20 detik agar otot mata tetap rileks.',
    category: 'Kesehatan Mata',
    mascot: 'laptop',
  },
]

const TABS = [
  { id: 'schedules', title: 'Jadwal & Kuliah', icon: CalendarDays },
  { id: 'announcements', title: 'Pengumuman', icon: Megaphone },
  { id: 'tips', title: 'Tips Belajar', icon: Sparkles },
  { id: 'guidelines', title: 'Ketentuan Studi', icon: Bell },
]

export default function DisplayPage() {
  const { user, isStaff } = useAuth()
  const location = useLocation()
  const isStandaloneRoute = location.pathname === '/display'

  const [activeTab, setActiveTab] = useState('schedules')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Device view mode: 'auto' | 'web' | 'mobile'
  const [deviceMode, setDeviceMode] = useState('auto')
  const [isScreenMobile, setIsScreenMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )

  // Listen to screen resize for automatic responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsScreenMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Effective mode: if 'auto', use viewport detection; otherwise use explicit choice
  const isMobileView = deviceMode === 'auto' ? isScreenMobile : deviceMode === 'mobile'

  // Selected schedule item for Group Detail Modal
  const [selectedGroupSchedule, setSelectedGroupSchedule] = useState(null)
  const [selectedDayFilter, setSelectedDayFilter] = useState('today')
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
  // INTEGRASI TABEL DATABASE APLIKASI
  // --------------------------------------------------------------------------
  const schedulePath = user ? (isStaff ? '/staff/schedules' : '/student/schedules') : null
  const coursePath = user ? (isStaff ? '/staff/courses' : '/student/courses') : null
  const groupPath = user ? (isStaff ? '/staff/groups' : '/student/groups') : null
  const taskPath = user ? (isStaff ? '/staff/tasks' : '/student/tasks') : null

  // 1. Tabel Jadwal
  const { data: rawSchedules, loading: loadingSchedules, refresh: refreshSchedules } =
    useApiData(schedulePath, { per_page: 100 }, { allPages: true, enabled: Boolean(user && schedulePath) })

  // 2. Tabel Mata Kuliah
  const { data: rawCourses, refresh: refreshCourses } =
    useApiData(coursePath, { per_page: 500 }, { allPages: true, enabled: Boolean(user && coursePath) })

  // 3. Tabel Kelompok
  const { data: rawGroups, refresh: refreshGroups } =
    useApiData(groupPath, { per_page: 500, with_members: 1 }, { allPages: true, enabled: Boolean(user && groupPath) })

  // 4. Tabel Tugas & Materi
  const { data: rawTasks, refresh: refreshTasks } =
    useApiData(taskPath, { per_page: 200 }, { allPages: true, enabled: Boolean(user && taskPath) })

  // 5. Tabel Pengumuman
  const { data: announcements, loading: loadingAnnouncements, refresh: refreshAnnouncements } =
    useApiData('/announcements', { per_page: 8, sort: 'published_at', direction: 'desc' })

  // Refresh all tables
  const refreshAll = () => {
    refreshSchedules()
    refreshCourses()
    refreshGroups()
    refreshTasks()
    refreshAnnouncements()
  }

  // Cache for offline/unauthenticated display
  const cachedSchedules = useMemo(() => {
    try {
      const raw = localStorage.getItem('psikologi_display_synced_tables')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return null
  }, [])

  // Assembling live schedules from the 4 database tables
  const masterSchedules = useMemo(() => {
    const rawList = Array.isArray(rawSchedules) && rawSchedules.length > 0 ? rawSchedules : []

    if (rawList.length === 0) {
      if (cachedSchedules && cachedSchedules.length > 0) return cachedSchedules
      return DEFAULT_ACADEMIC_SCHEDULES
    }

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

    return rawList.map((sch, idx) => {
      const course = coursesMap.get(String(sch.course_id)) || sch.course || {}
      const groupsForCourse = groupsMap.get(String(sch.course_id)) || []
      const tasksForCourse = tasksMap.get(String(sch.course_id)) || []
      const taskWithMaterial = tasksForCourse.find((t) => t.attachment_url || t.materials || t.attachment)

      const fallback = DEFAULT_ACADEMIC_SCHEDULES[idx % DEFAULT_ACADEMIC_SCHEDULES.length]

      const formattedGroups =
        groupsForCourse.length > 0
          ? groupsForCourse.map((g, gIdx) => ({
              name: g.name || `Kelompok ${gIdx + 1}`,
              topic: g.topic || g.title || 'Tugas Kelompok',
              leader:
                g.members?.find((m) => m.role === 'ketua')?.name ||
                g.leader_name ||
                g.members?.[0]?.name ||
                'Ketua Tim',
              members: (g.members || []).map((m) => m.name || m),
            }))
          : fallback.groups

      return {
        id: sch.id || `sch-${idx}`,
        day: sch.day || fallback.day,
        start_time: sch.start_time || fallback.start_time,
        end_time: sch.end_time || fallback.end_time,
        mode: sch.mode || fallback.mode,
        room: sch.room || course.room || fallback.room,
        class_name: sch.class_name || course.class_name || fallback.class_name,
        course_code: sch.course_code || course.code || fallback.course_code,
        course_name: sch.course_name || course.name || fallback.course_name,
        lecturer_name: sch.lecturer_name || sch.course_lecturer || course.lecturer || fallback.lecturer_name,
        credits: sch.credits || course.credits || fallback.credits,
        attendance_link: sch.attendance_link || course.attendance_link || fallback.attendance_link,
        material_link:
          taskWithMaterial?.attachment_url ||
          sch.material_link ||
          course.material_link ||
          fallback.material_link,
        meeting_link: sch.meeting_link || course.meeting_link || (sch.mode === 'online' ? fallback.meeting_link : ''),
        groups: formattedGroups,
      }
    })
  }, [rawSchedules, rawCourses, rawGroups, rawTasks, cachedSchedules])

  // Save to cache
  useEffect(() => {
    if (Array.isArray(rawSchedules) && rawSchedules.length > 0) {
      try {
        localStorage.setItem('psikologi_display_synced_tables', JSON.stringify(masterSchedules))
      } catch {}
    }
  }, [masterSchedules, rawSchedules])

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const currentDayName = dayNames[currentTime.getDay()]

  const displayedSchedules = useMemo(() => {
    if (selectedDayFilter === 'today') {
      const todayList = masterSchedules.filter(
        (item) => (item.day || '').toLowerCase() === currentDayName.toLowerCase(),
      )
      return todayList.length > 0 ? todayList : masterSchedules
    }
    if (selectedDayFilter === 'all') return masterSchedules
    return masterSchedules.filter(
      (item) => (item.day || '').toLowerCase() === selectedDayFilter.toLowerCase(),
    )
  }, [masterSchedules, selectedDayFilter, currentDayName])

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
      className={`min-h-screen transition-colors duration-200 ${
        isStandaloneRoute
          ? 'bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 p-4 sm:p-6 lg:p-8'
          : 'text-slate-800 dark:text-slate-100 space-y-6'
      }`}
    >
      {/* Outer wrapper: If forced into mobile view on a wide desktop screen, wrap into a centered mobile container */}
      <div
        className={
          deviceMode === 'mobile' && !isScreenMobile
            ? 'max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-300 dark:border-slate-700 shadow-2xl p-4 sm:p-5 my-6'
            : 'max-w-6xl mx-auto space-y-6'
        }
      >
        {/* ============================================================== */}
        {/* 1. MINIMALIST TOP HEADER                                      */}
        {/* ============================================================== */}
        <header className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  STIT Muhammadiyah Kediri
                </p>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Display Informasi Akademik
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prodi Psikologi Islam • Jadwal, Presensi, Materi & Kelompok
              </p>
            </div>

            {/* Header Right: Clock & Device View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Minimalist Clock */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{timeString} WIB</span>
                <span className="text-slate-400 hidden sm:inline">• {dateString}</span>
              </div>

              {/* Device Mode Switcher (Otomatis | Web | HP) */}
              <div
                className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
                title="Pilih mode tampilan tampilan"
              >
                <button
                  type="button"
                  onClick={() => setDeviceMode('auto')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    deviceMode === 'auto'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Otomatis mengikuti ukuran layar perangkat"
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="hidden sm:inline">Auto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceMode('web')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    deviceMode === 'web'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Kunci tampilan desktop / web"
                >
                  <Laptop className="h-3 w-3" />
                  <span>Web</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceMode('mobile')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    deviceMode === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Kunci tampilan layar HP / ponsel"
                >
                  <Smartphone className="h-3 w-3" />
                  <span>HP</span>
                </button>
              </div>

              {/* Sync Button */}
              {user && (
                <button
                  type="button"
                  onClick={refreshAll}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                  title="Sinkronkan data dari database"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Portal navigation button */}
              {isStandaloneRoute ? (
                user ? (
                  <Link
                    to={isStaff ? '/admin' : '/portal'}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-semibold transition"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 text-xs font-semibold transition"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Masuk</span>
                  </Link>
                )
              ) : null}
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 2. MINIMALIST NAVIGATION TABS                                  */}
        {/* ============================================================== */}
        <nav aria-label="Tab Menu" className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-200/90 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.title}</span>
                </button>
              )
            })}
          </div>

          <span className="text-xs font-semibold text-slate-500 shrink-0">
            {displayedSchedules.length} Sesi Kuliah
          </span>
        </nav>

        {/* ============================================================== */}
        {/* 3. TAB 1: JADWAL KULIAH, PRESENSI, MATERI & KELOMPOK           */}
        {/* ============================================================== */}
        {activeTab === 'schedules' && (
          <div className="space-y-4">
            {/* Filter Hari */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-semibold text-slate-500 mr-1 shrink-0">Hari:</span>
              {[
                { id: 'today', label: `Hari Ini (${currentDayName})` },
                { id: 'Senin', label: 'Senin' },
                { id: 'Selasa', label: 'Selasa' },
                { id: 'Rabu', label: 'Rabu' },
                { id: 'Kamis', label: 'Kamis' },
                { id: 'Jumat', label: 'Jumat' },
                { id: 'all', label: 'Semua' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDayFilter(item.id)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    selectedDayFilter === item.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sesi List: Responsive Grid (1 col on Mobile, 2-3 cols on Web) */}
            {displayedSchedules.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-md mx-auto">
                <MascotCharacter name="tertidur" className="h-16 w-auto mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tidak Ada Jadwal Kuliah</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Gunakan filter hari lain di atas untuk memeriksa sesi perkuliahan lainnya.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-3.5 ${
                  isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {displayedSchedules.map((item, idx) => {
                  const startTime = (item.start_time || '').slice(0, 5)
                  const endTime = (item.end_time || '').slice(0, 5)
                  const isOnline = item.mode === 'online'
                  const groupCount = item.groups ? item.groups.length : 0

                  return (
                    <div
                      key={item.id || idx}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-teal-600/40 hover:shadow-xs"
                    >
                      <div>
                        {/* Time & Mode Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 px-2 py-0.5 rounded-md">
                            {startTime} - {endTime}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOnline
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {isOnline ? 'Online' : 'Tatap Muka'}
                          </span>
                        </div>

                        {/* Course Name & Code */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {item.course_name}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.course_code} • {item.credits ? `${item.credits} SKS` : '3 SKS'} • {item.class_name}
                        </p>

                        {/* Room & Lecturer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <DoorOpen className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                            <span>Ruang: {item.room}</span>
                          </div>
                          {item.lecturer_name && (
                            <p className="truncate text-[11px] text-slate-500">
                              Dosen: <strong className="text-slate-700 dark:text-slate-300">{item.lecturer_name}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4 Clean Actions: Presensi, Materi, Kelompok, Virtual */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <a
                            href={item.attendance_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800 px-2.5 py-1.5 text-xs font-semibold transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                            <span>Presensi</span>
                          </a>

                          <a
                            href={item.material_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                            <span>Materi</span>
                          </a>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedGroupSchedule(item)}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold transition"
                          >
                            <UsersRound className="h-3.5 w-3.5 text-slate-600" />
                            <span>Kelompok ({groupCount})</span>
                          </button>

                          {item.meeting_link ? (
                            <a
                              href={item.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 px-2.5 py-1.5 text-xs font-semibold transition"
                            >
                              <Video className="h-3.5 w-3.5 text-sky-600" />
                              <span>Zoom</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[11px] py-1.5">
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
        {/* 4. TAB 2: PENGUMUMAN KAMPUS                                   */}
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
                Belum ada pengumuman baru yang dipublikasikan.
              </div>
            ) : (
              <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {(announcements || []).map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition hover:border-teal-600/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {ann.category || 'Akademik'}
                        </span>
                        <span className="text-[11px] text-slate-400">
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
        {/* 5. TAB 3: TIPS & SELF-CARE MINIMALIS                           */}
        {/* ============================================================== */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            {/* Spotlight Card */}
            <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/30 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-2 border border-teal-200 dark:border-teal-800 shadow-xs">
                  <MascotCharacter name={activeTip.mascot} className="h-20 w-auto object-contain" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="inline-block rounded-full bg-teal-700 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
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

              {/* Indicator dots */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {PSYCHOLOGY_TIPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTipIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === tipIndex ? 'w-6 bg-teal-700' : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 3 Pillar Cards */}
            <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-700 dark:text-teal-400">⏱️ Pomodoro 25/5</span>
                <p className="text-slate-600 dark:text-slate-300">25 menit fokus belajar, 5 menit berdiri & rileks.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-700 dark:text-teal-400">👁️ Relaksasi Mata</span>
                <p className="text-slate-600 dark:text-slate-300">Tiap 20 menit, pandang objek 6 meter selama 20 detik.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs space-y-1">
                <span className="font-bold text-teal-700 dark:text-teal-400">💧 Hidrasi Otak</span>
                <p className="text-slate-600 dark:text-slate-300">Minum air teratur agar fokus konsentrasi tidak menurun.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. TAB 4: KETENTUAN STUDI & PENGINGAT                           */}
        {/* ============================================================== */}
        {activeTab === 'guidelines' && (
          <div className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Presensi Kuliah (Min. 75%)</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Syarat mutlak untuk mengikuti Ujian Akhir Semester adalah kehadiran kuliah minimal 75%. Isi link absensi pada tiap mata kuliah.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tenggat Tugas Kuliah</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kumpulkan tugas kelompok maupun individu sebelum batas akhir sistem agar tidak terkena pengurangan nilai keterlambatan.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Etika & Ketertiban</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Jaga orisinalitas karya ilmiah, hindari plagiarisme, serta berbusana rapi dan sopan sesuai pedoman kampus STIT Kediri.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 7. MODAL: DAFTAR KELOMPOK MATA KULIAH                          */}
      {/* ============================================================== */}
      {selectedGroupSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kelompok: {selectedGroupSchedule.course_name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dosen: {selectedGroupSchedule.lecturer_name} • Ruang: {selectedGroupSchedule.room}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGroupSchedule(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {(selectedGroupSchedule.groups || []).map((grp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-teal-800 dark:text-teal-300">{grp.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Ketua: <strong>{grp.leader}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                    Topik: {grp.topic}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(grp.members || []).map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="rounded-md bg-white dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 text-right">
              <button
                type="button"
                onClick={() => setSelectedGroupSchedule(null)}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 text-xs font-semibold transition"
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
