import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  Clock3,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { api, errorMessage } from '../../lib/api'
import { useApiData } from '../../hooks/useApiData'
import { cn } from '../../lib/utils'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterChip,
  PageHeader,
  Skeleton,
} from '../../components/ui'

const toneClasses = {
  info: { icon: 'bg-sky-50 text-sky-600', border: 'border-sky-200' },
  danger: { icon: 'bg-rose-50 text-rose-600', border: 'border-rose-200' },
  warning: { icon: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
  success: { icon: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
  primary: { icon: 'bg-teal-50 text-teal-600', border: 'border-teal-200' },
  gray: { icon: 'bg-slate-100 text-slate-600', border: 'border-slate-200' },
}

export default function NotificationsPage() {
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [marking, setMarking] = useState(false)

  const { data: notifications, meta, loading, setData, refresh } = useApiData('/notifications')

  const unread = meta?.unread ?? 0
  const unreadLocal = (notifications || []).filter((item) => !item.read).length

  useEffect(() => {
    if (!notifications) return
    window.dispatchEvent(
      new CustomEvent('psikologi:notifications', {
        detail: { notifications, unread: unreadLocal },
      }),
    )
  }, [notifications, unreadLocal])

  const filtered = useMemo(() => {
    if (filter === 'unread') return (notifications || []).filter((item) => !item.read)
    if (filter === 'tasks') return (notifications || []).filter((item) => item.type === 'task')
    if (filter === 'schedule') return (notifications || []).filter((item) => item.type === 'schedule')
    return notifications || []
  }, [notifications, filter])

  const goToDestination = (notification) => {
    if (notification.type === 'schedule' || notification.group === 'today' || notification.group === 'tomorrow') {
      navigate(isStaff ? '/admin/jadwal' : '/portal/jadwal')
      return
    }
    navigate(isStaff ? '/admin/tugas' : '/portal/tugas')
  }

  const markRead = async (notification) => {
    if (notification.read) {
      goToDestination(notification)
      return
    }

    try {
      const response = await api.post('/notifications/read', { key: notification.key })
      setData((current) =>
        (current || []).map((item) =>
          item.key === notification.key ? { ...item, read: true, read_at: new Date().toISOString() } : item,
        ),
      )
      refresh()
      goToDestination(notification)
      if (response?.unread_count !== undefined) {
        toast.success('Notifikasi dibaca', `${response.unread_count} notifikasi belum dibaca.`)
      }
    } catch (error) {
      toast.error('Gagal menandai notifikasi', errorMessage(error))
    }
  }

  const markAll = async () => {
    setMarking(true)
    try {
      await api.post('/notifications/read-all')
      setData((current) => (current || []).map((item) => ({ ...item, read: true })))
      refresh()
      toast.success('Semua notifikasi dibaca', 'Daftar notifikasi sudah diperbarui.')
    } catch (error) {
      toast.error('Gagal memperbarui notifikasi', errorMessage(error))
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akun"
        title="Notifikasi"
        description="Tugas aktif serta jadwal hari ini dan besok dalam satu tempat."
        actions={
          <Button
            variant="secondary"
            onClick={markAll}
            disabled={unreadLocal === 0}
            loading={marking}
          >
            <CheckCheck className="h-4 w-4" />
            Tandai semua dibaca
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Total notifikasi</p>
            <p className="text-xl font-bold text-slate-900">{meta?.total ?? notifications?.length ?? 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Belum dibaca</p>
            <p className="text-xl font-bold text-slate-900">{unread}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Jadwal terdekat</p>
            <p className="text-xl font-bold text-slate-900">
              {(notifications || []).filter((item) => item.type === 'schedule').length}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={notifications?.length || 0}>
          Semua
        </FilterChip>
        <FilterChip
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
          count={unreadLocal}
        >
          Belum dibaca
        </FilterChip>
        <FilterChip
          active={filter === 'tasks'}
          onClick={() => setFilter('tasks')}
          count={(notifications || []).filter((item) => item.type === 'task').length}
        >
          Tugas
        </FilterChip>
        <FilterChip
          active={filter === 'schedule'}
          onClick={() => setFilter('schedule')}
          count={(notifications || []).filter((item) => item.type === 'schedule').length}
        >
          Jadwal
        </FilterChip>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          mascot="memeluk-hati"
          title={filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi'}
          description={
            filter === 'unread'
              ? 'Tidak ada notifikasi baru untuk saat ini.'
              : 'Tugas aktif dan jadwal hari ini atau besok akan muncul di sini.'
          }
          action={
            filter !== 'all' ? (
              <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                Lihat semua notifikasi
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notification) => {
            const tone = toneClasses[notification.color] || toneClasses.gray
            const Icon = notification.type === 'schedule' ? CalendarClock : ClipboardList
            return (
              <button
                key={notification.key}
                type="button"
                onClick={() => markRead(notification)}
                className={cn(
                  'group flex w-full items-start gap-3.5 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                  notification.read ? 'border-slate-200' : tone.border,
                )}
              >
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tone.icon)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{notification.title}</span>
                    {!notification.read ? <span className="h-2 w-2 rounded-full bg-teal-500" /> : null}
                    <Badge variant={notification.type === 'schedule' ? 'info' : 'teal'}>
                      {notification.type_label}
                    </Badge>
                    <Badge variant={notification.read ? 'neutral' : 'warning'}>{notification.badge}</Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-500">
                    {notification.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>{notification.meta}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {notification.time_label}
                    </span>
                  </div>
                </div>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 group-hover:text-teal-500" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
