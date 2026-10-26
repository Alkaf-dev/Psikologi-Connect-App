import { Link } from 'react-router-dom'
import { BrainCircuit } from 'lucide-react'
import { APP_NAME, BRAND_SUBTITLE } from '../lib/brand'
import { cn } from '../lib/utils'

export function Logo({ to = '/', compact = false, subtitle, dark = false, className }) {
  const content = (
    <span className={cn('flex items-center gap-3', className)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-600/20">
        <BrainCircuit className="h-5 w-5" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className={cn('block truncate text-[15px] font-bold leading-tight', dark ? 'text-white' : 'text-slate-900')}>
            {APP_NAME}
          </span>
          <span className={cn('block truncate text-[11px]', dark ? 'text-teal-100/80' : 'text-slate-500')}>
            {subtitle || BRAND_SUBTITLE}
          </span>
        </span>
      ) : null}
    </span>
  )

  if (!to) return content

  return (
    <Link to={to} className="inline-flex items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
      {content}
    </Link>
  )
}
