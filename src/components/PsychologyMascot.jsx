import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { getLauncherMascot, getMascot } from '../lib/mascots'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const launcherCopy = {
  'admin-tasks': {
    initial: 'Halo! Saya bisa bantu menjelaskan cara mengelola tugas.',
    help: 'Gunakan tombol Tambah Tugas untuk membuat tugas baru, atau klik Detail pada baris untuk melihat rincian.',
  },
  'portal-tasks': {
    initial: 'Halo! Saya bisa bantu memahami cara mengumpulkan tugas.',
    help: 'Klik Detail untuk membaca instruksi, lalu Kumpulkan untuk mengirim tautan tugas.',
  },
}

const tipsMessage = 'Coba bagi tugas besar menjadi langkah kecil, lalu kerjakan 25 menit tanpa distraksi.'
const supportMessage = 'Kamu sudah sampai sejauh ini. Istirahat singkat juga bagian dari progres.'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches)
}

function allowsAnimatedAssets() {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false

  const connection = navigator.connection

  if (!connection) return true
  if (connection.saveData) return false

  return !['slow-2g', '2g', '3g'].includes(connection.effectiveType)
}

function useAnimatedAssets() {
  const [animated, setAnimated] = useState(() => allowsAnimatedAssets())

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined

    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setAnimated(allowsAnimatedAssets())

    update()
    media.addEventListener?.('change', update)

    return () => media.removeEventListener?.('change', update)
  }, [])

  return animated
}

function MascotImage({ asset, animated, loading = 'eager', className, alt, width, height }) {
  const [failed, setFailed] = useState(false)
  const [showGif, setShowGif] = useState(false)

  useEffect(() => {
    setFailed(false)
    setShowGif(false)

    if (!asset?.gif || !animated) return undefined

    let cancelled = false
    const start = () => {
      if (!cancelled) setShowGif(true)
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(start, { timeout: 1200 })

      return () => {
        cancelled = true
        window.cancelIdleCallback?.(idleId)
      }
    }

    const timer = window.setTimeout(start, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [asset, animated])

  if (!asset) return null

  const src = animated && showGif && !failed ? asset.gif : asset.poster || asset.gif

  return (
    <img
      src={src}
      alt={alt ?? asset.alt ?? 'Maskot Psikologi Connect'}
      width={width ?? asset.width}
      height={height ?? asset.height}
      loading={loading}
      decoding="async"
      draggable={false}
      className={className}
      onError={() => {
        if (asset.poster) setFailed(true)
      }}
    />
  )
}

export function MascotGif({ mascot, variant = 'banner', title, message, alt, className, loading }) {
  const asset = getMascot(mascot)
  const animated = useAnimatedAssets()

  if (!asset) return null

  const resolvedLoading =
    loading || (['banner', 'login'].includes(variant) ? 'eager' : 'lazy')
  const resolvedTitle = title ?? asset.title
  const resolvedMessage = message ?? asset.message

  return (
    <div
      className={cn('psy-mascot-gif', `psy-mascot-gif--${variant}`, className)}
      data-mascot-gif={mascot}
    >
      <MascotImage
        asset={asset}
        animated={animated}
        loading={resolvedLoading}
        className="psy-mascot-gif__image"
        alt={alt ?? asset.alt}
      />

      {resolvedTitle || resolvedMessage ? (
        <div className="psy-mascot-gif__copy">
          {resolvedTitle ? <p className="psy-mascot-gif__title">{resolvedTitle}</p> : null}
          {resolvedMessage ? <p className="psy-mascot-gif__message">{resolvedMessage}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export function MascotGreeting({ context = 'portal-dashboard', name, className }) {
  const asset = getMascot('melambai')
  const animated = useAnimatedAssets()
  const title = name ? `Halo, ${name}!` : 'Halo!'
  const message =
    context === 'admin-dashboard'
      ? 'Siap bantu memantau tugas dan pengumpulan hari ini.'
      : 'Jangan lupa cek tenggat terdekat, ya. Saya temani belajarmu.'

  if (!asset) return null

  return (
    <div
      className={cn('psy-mascot-greeting', className)}
      data-mascot-greeting
      data-mascot-greeting-key={context}
    >
      <MascotImage
        asset={asset}
        animated={animated}
        loading="eager"
        className="psy-mascot-greeting__image"
        alt={asset.alt}
      />

      <div className="psy-mascot-greeting__copy">
        <p className="psy-mascot-greeting__title">{title}</p>
        <p className="psy-mascot-greeting__message">{message}</p>
      </div>
    </div>
  )
}

export function MascotState({ state = 'idle', size = '6.25rem', className, alt, loading = 'eager' }) {
  const asset = getLauncherMascot(state)
  const animated = useAnimatedAssets()

  if (!asset) return null

  return (
    <span
      className={cn('psy-mascot-state', className)}
      style={{ '--psy-mascot-size': size }}
    >
      <MascotImage
        asset={asset}
        animated={animated}
        loading={loading}
        alt={alt ?? asset.alt}
      />
    </span>
  )
}

export function MascotLauncher({ context = 'portal-tasks', className }) {
  const copy = launcherCopy[context] || launcherCopy['portal-tasks']
  const panelId = useId()
  const titleId = `${panelId}-title`
  const containerRef = useRef(null)
  const toggleRef = useRef(null)
  const closeRef = useRef(null)
  const openRef = useRef(false)
  const pulseTimer = useRef(null)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState('greeting')
  const [message, setMessage] = useState(copy.initial)
  const [pending, setPending] = useState(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const timer = window.setTimeout(() => closeRef.current?.focus(), 30)

    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
        setState('idle')
        setMessage(copy.initial)
      }
    }

    document.addEventListener('mousedown', handleOutside)

    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, copy.initial])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || !openRef.current) return

      setOpen(false)
      setState('idle')
      setMessage(copy.initial)
      toggleRef.current?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [copy.initial])

  useEffect(() => {
    const handleCelebrate = (event) => {
      const rawDetail = event.detail
      const detail = Array.isArray(rawDetail)
        ? rawDetail[0] || {}
        : rawDetail && typeof rawDetail === 'object'
          ? rawDetail
          : {}
      const nextState = detail.state || 'success'
      const nextMessage = detail.message || 'Kerja bagus!'

      if (openRef.current) {
        setState(nextState)
        setMessage(nextMessage)
        return
      }

      setPending({ state: nextState, message: nextMessage })
      setPulse(true)
      window.clearTimeout(pulseTimer.current)
      pulseTimer.current = window.setTimeout(() => setPulse(false), 3200)
    }

    window.addEventListener('psychology-mascot:celebrate', handleCelebrate)

    return () => {
      window.removeEventListener('psychology-mascot:celebrate', handleCelebrate)
      window.clearTimeout(pulseTimer.current)
    }
  }, [])

  const show = (nextState, nextMessage) => {
    setOpen(true)
    setState(nextState)
    setMessage(nextMessage)
  }

  const close = () => {
    setOpen(false)
    setState('idle')
    setMessage(copy.initial)
  }

  const toggle = () => {
    if (open) {
      close()
      return
    }

    const celebration = pending
    setPending(null)
    show(celebration?.state || 'greeting', celebration?.message || copy.initial)
  }

  const suggestions = [
    { label: 'Tips belajar', state: 'studying', message: tipsMessage },
    { label: 'Butuh semangat', state: 'supportive', message: supportMessage },
    { label: 'Cara pakai', state: 'thinking', message: copy.help },
  ]

  return (
    <div
      ref={containerRef}
      className={cn('psy-mascot-launcher', pulse && 'psy-mascot-launcher--celebrate', className)}
      data-mascot-launcher
      data-mascot-context={context}
    >
      <div
        id={panelId}
        className="psy-mascot-launcher__panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
      >
        <div className="psy-mascot-launcher__header">
          <div>
            <p className="psy-mascot-launcher__eyebrow">Teman belajar</p>
            <p id={titleId} className="psy-mascot-launcher__title">Maskot Psikologi</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="psy-mascot-launcher__close"
            onClick={close}
            aria-label="Tutup bantuan maskot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="psy-mascot-launcher__body">
          {open ? (
            <MascotState
              state={state}
              size="6.25rem"
              className="psy-mascot-launcher__mascot"
              loading="eager"
            />
          ) : null}

          <p className="psy-mascot-launcher__message" aria-live="polite">
            {message}
          </p>
        </div>

        <div className="psy-mascot-launcher__actions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              className="psy-mascot-launcher__suggestion"
              onClick={() => show(suggestion.state, suggestion.message)}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className="psy-mascot-launcher__toggle"
        onClick={toggle}
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? 'Tutup bantuan maskot' : 'Buka bantuan maskot'}
      >
        <span className="psy-mascot-launcher__pulse" aria-hidden="true" />
        <MascotState state="idle" size="3.4rem" alt="" loading="eager" />
      </button>
    </div>
  )
}

export function celebrateMascot(message = 'Kerja bagus! Tugas berhasil dikumpulkan.') {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent('psychology-mascot:celebrate', {
      detail: { state: 'success', message },
    }),
  )
}
