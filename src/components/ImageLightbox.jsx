import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Download, ExternalLink, X } from 'lucide-react'

export default function ImageLightbox({ open, onClose, src, alt = 'Foto', title = 'Foto Penuh' }) {
  useEffect(() => {
    if (!open) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !src) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-3 sm:p-6 select-none animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Bar */}
      <div
        className="w-full flex items-center justify-between text-white z-10 max-w-5xl px-2 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 pr-4">
          <h3 className="text-sm sm:text-base font-semibold truncate text-white drop-shadow">
            {title}
          </h3>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Klik di mana saja atau tekan ESC untuk menutup
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Buka gambar asli di tab baru"
            aria-label="Buka gambar asli di tab baru"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-95"
            title="Tutup (ESC)"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center w-full max-w-5xl my-auto py-2"
        onClick={onClose}
      >
        <img
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[82vh] max-w-[95vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl animate-scale-in"
        />
      </div>

      {/* Bottom Hint on Mobile */}
      <div className="sm:hidden text-center pb-2 pointer-events-none">
        <p className="text-[11px] text-slate-400">Ketuk di luar gambar untuk menutup</p>
      </div>
    </div>,
    document.body,
  )
}

