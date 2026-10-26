import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { MascotGif } from './PsychologyMascot'

const buttonVariants = {
  primary:
    'bg-teal-600 text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700 focus-visible:outline-teal-600 disabled:bg-teal-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-slate-400 disabled:text-slate-400',
  soft: 'bg-teal-50 text-teal-700 hover:bg-teal-100 focus-visible:outline-teal-600 disabled:text-teal-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
  danger: 'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus-visible:outline-rose-600 disabled:bg-rose-300',
  'danger-soft': 'bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:outline-rose-500',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900',
  white: 'bg-white text-teal-700 shadow-sm hover:bg-teal-50 focus-visible:outline-white',
  'outline-white': 'border border-white/40 text-white hover:bg-white/10 focus-visible:outline-white',
}

const buttonSizes = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-5 text-sm',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-lg',
}

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  children,
  ...props
}) {
  const isNativeButton = Component === 'button'

  return (
    <Component
      {...(isNativeButton ? { type: props.type || 'button' } : {})}
      {...props}
      disabled={isNativeButton ? loading || props.disabled : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </Component>
  )
}

export function Spinner({ className }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

const badgeVariants = {
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  dark: 'bg-slate-800 text-white ring-slate-700',
}

export function Badge({ variant = 'neutral', className, children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset',
        badgeVariants[variant] || badgeVariants.neutral,
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action, className, icon: Icon }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Icon className="h-4.5 w-4.5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export function Field({ label, htmlFor, required, error, help, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-semibold text-slate-700">
          {label}
          {required ? <span className="text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      {!error && help ? <p className="text-xs leading-5 text-slate-500">{help}</p> : null}
    </div>
  )
}

const fieldClass =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm shadow-slate-900/[0.02] outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function Input({ className, error, ...props }) {
  return <input className={cn(fieldClass, error ? 'border-rose-300' : 'border-slate-300', className)} {...props} />
}

export function Textarea({ className, error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldClass, 'resize-y leading-6', error ? 'border-rose-300' : 'border-slate-300', className)}
      {...props}
    />
  )
}

export function Select({ className, error, children, ...props }) {
  return (
    <select
      className={cn(fieldClass, 'appearance-none bg-white pr-9', error ? 'border-rose-300' : 'border-slate-300', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364758b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.65rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.1em 1.1em',
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function Checkbox({ label, description, className, ...props }) {
  const id = useId()
  return (
    <label
      htmlFor={props.id || id}
      className={cn('flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300', className)}
    >
      <input
        id={props.id || id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Cari...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Bersihkan pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

const statTones = {
  teal: { icon: 'bg-teal-50 text-teal-600', bar: 'bg-teal-500' },
  sky: { icon: 'bg-sky-50 text-sky-600', bar: 'bg-sky-500' },
  amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  violet: { icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
  rose: { icon: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  slate: { icon: 'bg-slate-100 text-slate-600', bar: 'bg-slate-500' },
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'teal', href, onClick }) {
  const styles = statTones[tone] || statTones.teal
  const Wrapper = href ? Link : onClick ? 'button' : 'div'

  return (
    <Wrapper
      {...(href ? { to: href } : {})}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-900/[0.02] transition',
        (href || onClick) && 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value ?? '-'}</p>
          {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <span className={cn('absolute inset-x-0 bottom-0 h-0.5 scale-x-0 transition group-hover:scale-x-100', styles.bar)} />
    </Wrapper>
  )
}

export function EmptyState({
  icon: Icon,
  mascot,
  mascotTitle,
  mascotMessage,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center',
        mascot ? 'border border-transparent bg-transparent' : 'border border-dashed border-slate-300 bg-slate-50/70',
        className,
      )}
    >
      {mascot ? (
        <MascotGif
          mascot={mascot}
          variant="empty"
          title={mascotTitle ?? title}
          message={mascotMessage ?? description}
          className="psy-empty-mascot"
        />
      ) : (
        <>
          {Icon ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <Icon className="h-6 w-6" />
            </span>
          ) : null}
          <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
        </>
      )}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/80', className)} />
}

export function Avatar({ name, className, tone = 'teal' }) {
  const initials = String(name || 'PC')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const tones = {
    teal: 'bg-teal-100 text-teal-700',
    sky: 'bg-sky-100 text-sky-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-bold',
        tones[tone] || tones.teal,
        className,
      )}
      aria-hidden="true"
    >
      {initials || 'PC'}
    </span>
  )
}

export function Pagination({ currentPage = 1, lastPage = 1, total, perPage, onChange, className }) {
  if (!lastPage || lastPage <= 1) {
    return total !== undefined ? (
      <p className={cn('text-xs text-slate-500', className)}>{total} data ditemukan</p>
    ) : null
  }

  const pages = []
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(lastPage, currentPage + 2)

  for (let page = start; page <= end; page += 1) pages.push(page)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-xs text-slate-500">
        {total !== undefined ? `${total} data` : 'Data'}
        {perPage ? ` · ${perPage} per halaman` : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {start > 1 ? <span className="px-1 text-xs text-slate-400">...</span> : null}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            className={cn(
              'h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition',
              page === currentPage
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {page}
          </button>
        ))}
        {end < lastPage ? <span className="px-1 text-xs text-slate-400">...</span> : null}
        <button
          type="button"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function FilterChip({ active, children, count, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700',
        className,
      )}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] leading-none',
            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [locked])
}

function useEscape(active, onClose) {
  useEffect(() => {
    if (!active) return undefined
    const handler = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [active, onClose])
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  useLockBody(open)
  useEscape(open, onClose)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Tutup dialog"
      />
      <div
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-scale-in sm:rounded-2xl',
          modalSizes[size] || modalSizes.md,
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, description, children, footer, width = 'max-w-xl' }) {
  useLockBody(open)
  useEscape(open, onClose)

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-label="Tutup panel"
      />
      <aside
        className={cn(
          'absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl animate-slide-in-right',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  )
}

export function DetailList({ items, className }) {
  return (
    <dl className={cn('divide-y divide-slate-100', className)}>
      {items.filter(Boolean).map((item) => (
        <div key={item.label} className="grid gap-1 py-2.5 sm:grid-cols-3 sm:gap-4">
          <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
          <dd className="text-sm text-slate-800 sm:col-span-2">{item.value ?? '-'}</dd>
        </div>
      ))}
    </dl>
  )
}
