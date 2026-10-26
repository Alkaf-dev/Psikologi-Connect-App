import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, errorMessage } from '../lib/api'
import { cn, formatDate } from '../lib/utils'
import { Button, Drawer, EmptyState, Spinner } from './ui'
import { useToast } from '../context/ToastContext'

const toneClasses = {
  info: 'bg-sky-50 text-sky-600',
  danger: 'bg-rose-50 text-rose-600',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-emerald-50 text-emerald-600',
  primary: 'bg-teal-50 text-teal-600',
  gray: 'bg-slate-100 text-slate-600',
}

export default function NotificationDrawer({ open, onClose, notifications, loading, unread, onUpdate }) {
  const navigate = useNavigate()
  const { isStaff } = useAuth()
  const { toast } = useToast()

  const fallbackPath = (notification) => {
    if (notification.type === 'schedule' || notification.group === 'today' || notification.group === 'tomorrow') {
      return isStaff ? '/admin/jadwal' : '/portal/jadwal'
    }
    return isStaff ? '/admin/tugas' : '/portal/tugas'
  }

  const handleOpen = async (notification) => {
    try {
      if (!notification.read) {
        const response = await api.post('/notifications/read', { key: notification.key })
        onUpdate?.({
          notifications: notifications.map((item) =>
            item.key === notification.key ? { ...item, read: true, read_at: new Date().toISOString() } : item,
          ),
          unread: response?.unread_count ?? Math.max(0, unread - 1),
        })
      }
    } catch (error) {
      toast.error('Gagal menandai notifikasi', errorMessage(error))
    }

    onClose?.()
    navigate(fallbackPath(notification))
  }

  const markAll = async () => {
    try {
      await api.post('/notifications/read-all')
      onUpdate?.({
        notifications: notifications.map((item) => ({ ...item, read: true })),
        unread: 0,
      })
      toast.success('Semua notifikasi ditandai sudah dibaca')
    } catch (error) {
      toast.error('Gagal memperbarui notifikasi', errorMessage(error))
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifikasi"
      description={unread > 0 ? `${unread} notifikasi belum dibaca` : 'Anda sudah membaca semua notifikasi'}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button
            as="button"
            variant="ghost"
            size="sm"
            onClick={markAll}
            disabled={unread === 0}
            className="text-teal-700"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai semua dibaca
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose?.()
              navigate(isStaff ? '/admin/notifikasi' : '/portal/notifikasi')
            }}
          >
            Halaman notifikasi
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-500">
          <Spinner className="mr-2 h-5 w-5 text-teal-600" />
          Memuat notifikasi...
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum ada notifikasi"
          description="Tugas aktif dan jadwal hari ini atau besok akan muncul di sini."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notification.type === 'schedule' ? CalendarClock : ClipboardList
            return (
              <button
                key={notification.key}
                type="button"
                onClick={() => handleOpen(notification)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition',
                  notification.read
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-teal-100 bg-teal-50/40 hover:border-teal-200 hover:bg-teal-50/70',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    toneClasses[notification.color] || toneClasses.gray,
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">{notification.title}</span>
                    {!notification.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" /> : null}
                  </span>
                  <span className="mt-0.5 block whitespace-pre-line text-xs leading-5 text-slate-500">
                    {notification.description}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="rounded-full bg-white px-2 py-0.5 font-medium text-slate-500 ring-1 ring-slate-200">
                      {notification.badge}
                    </span>
                    <span>{notification.time_label}</span>
                    {notification.external ? <ExternalLink className="h-3 w-3" /> : null}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {!loading && notifications.length > 0 ? (
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Diperbarui {formatDate(new Date(), { time: true })}
        </p>
      ) : null}
    </Drawer>
  )
}
