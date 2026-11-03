import { useEffect, useRef, useState } from 'react'
import { BookOpen, Check, Compass, Leaf, Moon, Palette, Sparkles, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

const ICON_MAP = {
  Sun,
  Moon,
  Leaf,
  BookOpen,
  Sparkles,
  Compass,
}

export default function ThemeSelector({ className, compact = false }) {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const currentTheme = themes.find((t) => t.id === theme) || themes[0]
  const CurrentIcon = ICON_MAP[currentTheme.icon] || Palette

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500',
          compact ? 'h-9 w-9 text-slate-600' : 'h-9 px-2.5 text-xs font-medium text-slate-700 sm:px-3',
        )}
        aria-label="Pilih tema tampilan"
        aria-expanded={open}
        title={`Tema saat ini: ${currentTheme.name} (${currentTheme.label})`}
      >
        <CurrentIcon className="h-4 w-4 shrink-0 text-teal-600" />
        {!compact ? (
          <span className="hidden sm:inline font-semibold text-slate-700">
            {currentTheme.name}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-scale-in z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pilihan Tema
            </span>
            <span className="text-[10px] text-teal-600 font-medium">Instan & Ringan</span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const Icon = ICON_MAP[t.icon] || Palette
              const isActive = t.id === theme

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition',
                    isActive
                      ? 'bg-teal-50/80 text-teal-900 font-semibold ring-1 ring-teal-500/20'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-white shadow-xs"
                      style={{
                        backgroundColor: t.previewCard,
                        borderColor: t.accentColor,
                        color: t.accentColor,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {t.name} <span className="text-[10px] opacity-70 font-normal">· {t.label}</span>
                      </p>
                      <p className="truncate text-[10px] text-slate-400">{t.desc}</p>
                    </div>
                  </div>

                  {isActive ? (
                    <Check className="h-4 w-4 shrink-0 text-teal-600" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
