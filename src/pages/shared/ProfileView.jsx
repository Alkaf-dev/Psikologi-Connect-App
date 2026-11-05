import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Mail,
  Maximize2,
  Phone,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Skeleton,
} from '../../components/ui'
import ImageLightbox from '../../components/ImageLightbox'
import { api, errorMessage } from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function ProfileView() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('psikologi_connect_token')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const userId = location.pathname.match(/\/profil\/([^/]+)/)?.[1] || null

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.getUserProfile(userId)
        if (active) {
          setProfile(response.data)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(errorMessage(err))
          setProfile(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userId])

  const handleBack = () => {
    // 1. Jika tab ini memiliki riwayat navigasi internal (SPA):
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1)
      return
    }

    // 2. Jika dibuka lewat tab baru (target="_blank"), coba tutup tab jika memungkinkan
    if (window.history.length <= 1) {
      window.close()
    }

    // 3. Jika document.referrer berasal dari aplikasi kita, kembali ke halaman asal tersebut
    if (document.referrer && document.referrer.startsWith(window.location.origin)) {
      try {
        const refUrl = new URL(document.referrer)
        const targetPath = refUrl.pathname + refUrl.search
        if (targetPath && targetPath !== window.location.pathname) {
          navigate(targetPath)
          return
        }
      } catch {}
    }

    // 4. Fallback berdasarkan role akun yang sedang login
    try {
      const savedUser = JSON.parse(localStorage.getItem('psikologi_connect_user') || '{}')
      if (savedUser?.role === 'super_admin' || savedUser?.role === 'pjmk') {
        navigate('/dashboard')
        return
      }
      if (savedUser?.role === 'mahasiswa') {
        navigate('/portal')
        return
      }
    } catch {}

    // 5. Default fallback ke beranda
    navigate('/')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <Card className="overflow-hidden">
          <Skeleton className="h-48 sm:h-56 w-full" />
          <div className="p-6 space-y-4">
            <div className="-mt-20 flex items-end gap-4">
              <Skeleton className="h-28 w-28 rounded-full border-2 border-white" />
              <div className="space-y-2 flex-1 pb-2">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-4">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <Card className="p-8">
          <p className="text-sm text-slate-500 mb-4">{error || 'Profil tidak ditemukan'}</p>
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Card>
      </div>
    )
  }

  const user = profile
  const npm = user.npm || '-'
  const prodiName = user.prodi_name || '-'
  const className = user.class_name || '-'
  const cohort = user.cohort || '-'
  const roleLabel = user.role_label || user.role || 'Mahasiswa'
  const isMultiRole = user.role === 'super_admin' || user.role === 'pjmk'
  const phone = user.phone || '-'
  const email = user.email || '-'

  const avatarSrc = user.avatar_url || user.avatar || null
  const coverSrc = user.cover_url || null

  const coverPosX = user.cover_pos_x ?? user.cover_pos ?? 50
  const coverPosY = user.cover_pos_y ?? user.cover_pos ?? 50
  const coverZoom = user.cover_zoom ?? 1

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 space-y-5 animate-fade-in">
      {/* Header navigasi atas */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleBack}
          className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs border-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Detail Pengguna
        </span>
      </div>

      {/* Main Profile Card - Ukuran dan format persis seperti Profil Saya */}
      <Card className="overflow-hidden shadow-sm">
        {/* Cover Photo Banner: Aspect ratio & ukuran sampul persis seperti Profil Saya */}
        <div
          className={`relative h-48 sm:h-56 select-none bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden ${
            coverSrc ? 'cursor-pointer group' : ''
          }`}
          onClick={() => {
            if (coverSrc) {
              setPreviewImage({
                src: coverSrc,
                title: `Foto Sampul · ${user?.name}`,
                alt: `Foto Sampul ${user?.name}`,
              })
            }
          }}
          title={coverSrc ? 'Klik untuk melihat foto sampul penuh' : undefined}
        >
          {coverSrc ? (
            <>
              <img
                src={coverSrc}
                alt="Foto Sampul"
                draggable={false}
                style={{
                  objectPosition: `${coverPosX}% ${coverPosY}%`,
                  transform: `scale(${coverZoom})`,
                  transformOrigin: `${coverPosX}% ${coverPosY}%`,
                }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] pointer-events-none"
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm pointer-events-none flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Lihat Sampul Penuh</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
              <div className="hero-dots absolute inset-0 opacity-20" />
              <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />
              <div className="absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Profile Info Area */}
        <div className="relative z-10 px-5 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Avatar + User Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-4 min-w-0 flex-1">
              {/* Avatar overlapping cover photo on the left */}
              <div
                className={`-mt-16 sm:-mt-20 relative shrink-0 ${
                  avatarSrc ? 'cursor-pointer group' : ''
                }`}
                onClick={() => {
                  if (avatarSrc) {
                    setPreviewImage({
                      src: avatarSrc,
                      title: `Foto Profil · ${user?.name}`,
                      alt: `Foto Profil ${user?.name}`,
                    })
                  }
                }}
                title={avatarSrc ? 'Klik untuk melihat foto profil penuh' : undefined}
              >
                <Avatar
                  name={user?.name}
                  src={avatarSrc}
                  className={`h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-white shadow-xl bg-white transition-all ${
                    avatarSrc
                      ? 'group-hover:scale-105 group-hover:ring-4 group-hover:ring-teal-400/60'
                      : ''
                  }`}
                />
                {avatarSrc && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Eye className="h-6 w-6 text-white drop-shadow" />
                  </div>
                )}
              </div>

              {/* Name, Role & Email */}
              <div className="pt-1 sm:pt-0 sm:pb-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight break-words">
                    {user?.name}
                  </h1>
                  {isMultiRole ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="teal">{user?.role_label || 'Admin'}</Badge>
                      <Badge variant="neutral">Mahasiswa</Badge>
                    </div>
                  ) : (
                    <Badge variant="teal" className="shrink-0">
                      {roleLabel}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 break-all">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Identitas Akademik Grid (Persis seperti Profil Saya) */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                NIM / NIP
              </p>
              <p className="mt-1 truncate text-xs font-bold text-slate-800">{npm}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Kelas
              </p>
              <p className="mt-1 truncate text-xs font-bold text-slate-800">{className}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Program Studi
              </p>
              <p className="mt-1 truncate text-xs font-bold text-slate-800">{prodiName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Angkatan
              </p>
              <p className="mt-1 truncate text-xs font-bold text-slate-800">
                {cohort !== '-' ? `Angkatan ${cohort}` : '-'}
              </p>
            </div>
          </div>

          {/* Informasi Kontak & Tanggal */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{email}</span>
            </div>
            {phone !== '-' && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Terdaftar {formatDate(user?.created_at)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Lightbox Modal Full Screen */}
      <ImageLightbox
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        src={previewImage?.src}
        title={previewImage?.title}
        alt={previewImage?.alt}
      />
    </div>
  )
}
