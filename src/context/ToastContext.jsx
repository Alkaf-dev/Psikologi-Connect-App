import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Button } from '../components/ui'
import { cn } from '../lib/utils'

const ToastContext = createContext(null)

const toneStyles = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-200 bg-white',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  error: {
    icon: XCircle,
    ring: 'border-rose-200 bg-white',
    iconClass: 'bg-rose-50 text-rose-600',
  },
  info: {
    icon: Info,
    ring: 'border-sky-200 bg-white',
    iconClass: 'bg-sky-50 text-sky-600',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'border-amber-200 bg-white',
    iconClass: 'bg-amber-50 text-amber-600',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmation, setConfirmation] = useState(null)
  const confirmationResolver = useRef(null)
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, title, message) => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current, { id, type, title, message }])
      window.setTimeout(() => dismiss(id), 4500)
      return id
    },
    [dismiss],
  )

  const toast = {
    success: (title, message) => push('success', title, message),
    error: (title, message) => push('error', title, message),
    info: (title, message) => push('info', title, message),
    warning: (title, message) => push('warning', title, message),
  }

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        confirmationResolver.current = resolve
        setConfirmation({
          title: options.title || 'Konfirmasi',
          message: options.message || 'Apakah Anda yakin?',
          confirmLabel: options.confirmLabel || 'Ya, lanjutkan',
          cancelLabel: options.cancelLabel || 'Batal',
          tone: options.tone || 'danger',
        })
      }),
    [],
  )

  const resolveConfirmation = (value) => {
    confirmationResolver.current?.(value)
    confirmationResolver.current = null
    setConfirmation(null)
  }

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-auto sm:right-4 sm:top-4 sm:items-end">
        {toasts.map((item) => {
          const style = toneStyles[item.type] || toneStyles.info
          const Icon = style.icon
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg shadow-slate-900/5 animate-fade-up',
                style.ring,
              )}
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', style.iconClass)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.message ? <p className="mt-1 text-sm leading-5 text-slate-600">{item.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {confirmation ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => resolveConfirmation(false)}
            aria-label="Tutup dialog"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  confirmation.tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-600',
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{confirmation.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{confirmation.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => resolveConfirmation(false)}>
                {confirmation.cancelLabel}
              </Button>
              <Button
                variant={confirmation.tone === 'danger' ? 'danger' : 'primary'}
                onClick={() => resolveConfirmation(true)}
              >
                {confirmation.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast harus digunakan di dalam ToastProvider.')
  return context
}
