import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  UserCircle,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { APP_NAME, BRAND_SUBTITLE } from '../lib/brand'
import { cn } from '../lib/utils'
import { Avatar, Badge, Spinner } from './ui'
import NotificationDrawer from './NotificationDrawer'

const iconClass = 'h-4.5 w-4.5'

const staffNavigation = [
  {
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Akademik',
    items: [
      { to: '/admin/mata-kuliah', label: 'Mata Kuliah', icon: BookOpen },
      { to: '/admin/jadwal', label: 'Jadwal', icon: CalendarDays },
      { to: '/admin/kelompok', label: 'Kelompok', icon: UsersRound },
      { to: '/admin/tugas', label: 'Materi dan Tugas', icon: ClipboardList },
      { to: '/admin/pengumpulan', label: 'Pengumpulan', icon: Inbox },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { to: '/admin/mahasiswa', label: 'Mahasiswa', icon: GraduationCap },
      { to: '/admin/program-studi', label: 'Program Studi', icon: Building2 },
    ],
  },
  {
    label: 'Konten',
    items: [{ to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone }],
  },
  {
    label: 'Akun',
    items: [
      { to: '/admin/user', label: 'User', icon: Users },
      { to: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
      { to: '/admin/profil', label: 'Profil Saya', icon: UserCircle },
    ],
  },
  {
    label: 'Sistem',
    items: [{ to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings }],
  },
]

const studentNavigation = [
  {
    items: [{ to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Akademik',
    items: [
      { to: '/portal/jadwal', label: 'Jadwal Kuliah', icon: CalendarDays },
      { to: '/portal/tugas', label: 'Materi dan Tugas', icon: ClipboardList },
      { to: '/portal/kelompok', label: 'Kelompok Saya', icon: UsersRound },
    ],
  },
  {
    label: 'Informasi',
    items: [{ to: '/portal/pengumuman', label: 'Pengumuman', icon: Megaphone }],
  },
  {
    label: 'Akun',
    items: [
      { to: '/portal/notifikasi', label: 'Notifikasi', icon: Bell },
      { to: '/portal/profil', label: 'Profil Saya', icon: UserCircle },
    ],
  },
]

export default function PortalLayout() {
  const { user, logout, isStaff } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const menuRef = useRef(null)

  const navigation = isStaff ? staffNavigation : studentNavigation
  const flatItems = navigation.flatMap((group) => group.items)
  const notificationsPage = location.pathname.endsWith('/notifikasi')
  const currentItem = [...flatItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))

  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) setNotificationsLoading(true)
    try {
      const response = await api.get('/notifications')
      setNotifications(response?.data ?? [])
      setUnread(response?.meta?.unread ?? 0)
    } catch {
      // Notifications should never block the page.
    } finally {
      if (!silent) setNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (notificationsPage) return undefined

    const initial = window.setTimeout(() => loadNotifications(), 2200)
    const interval = window.setInterval(() => loadNotifications(true), 60000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [loadNotifications, notificationsPage])

  useEffect(() => {
    setSidebarOpen(false)
    setUserMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    document.title = currentItem
      ? `${currentItem.label} - ${APP_NAME}`
      : `${isStaff ? 'Panel Admin' : 'Portal Mahasiswa'} - ${APP_NAME}`
  }, [currentItem, isStaff])

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleNotificationUpdate = ({ notifications: nextNotifications, unread: nextUnread }) => {
    if (nextNotifications) setNotifications(nextNotifications)
    if (nextUnread !== undefined) setUnread(nextUnread)
  }

  useEffect(() => {
    const handleNotifications = (event) => handleNotificationUpdate(event.detail || {})
    window.addEventListener('psikologi:notifications', handleNotifications)
    return () => window.removeEventListener('psikologi:notifications', handleNotifications)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-100 px-4">
        <Link to={isStaff ? '/admin' : '/portal'} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">{APP_NAME}</span>
            <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-teal-600">
              {isStaff ? 'Panel Admin' : 'Portal Mahasiswa'}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group, groupIndex) => (
          <div key={group.label || `group-${groupIndex}`} className={groupIndex > 0 ? 'mt-5' : ''}>
            {group.label ? (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn(iconClass, isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600')} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.label === 'Notifikasi' && unread > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <Building2 className="h-3.5 w-3.5" />
          Lihat situs publik
        </Link>
        <div className="mt-1 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
          <Avatar name={user?.name} className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
            <p className="truncate text-[10px] text-slate-500">{user?.role_label || user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-slide-in-right">
            {SidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {currentItem?.label || 'Dashboard'}
                </p>
                <p className="hidden truncate text-[11px] text-slate-500 sm:block">{BRAND_SUBTITLE}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(true)
                  loadNotifications()
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                aria-label="Buka notifikasi"
              >
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-slate-300"
                >
                  <Avatar name={user?.name} className="h-7 w-7 text-[10px]" />
                  <span className="hidden max-w-[120px] truncate text-xs font-semibold text-slate-700 sm:block">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-in">
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                      <Badge variant="teal" className="mt-2">
                        {user?.prodi_name} · {user?.role_label || user?.role}
                      </Badge>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to={isStaff ? '/admin/profil' : '/portal/profil'}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profil Saya
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center">
                <Spinner className="h-6 w-6 text-teal-600" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <NotificationDrawer
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        loading={notificationsLoading}
        unread={unread}
        onUpdate={handleNotificationUpdate}
      />
    </div>
  )
}
