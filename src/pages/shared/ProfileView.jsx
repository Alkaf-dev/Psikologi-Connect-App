import { useEffect, useState, useLocation } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Skeleton,
} from '../../components/ui'
import { api, errorMessage } from '../../lib/api'
import { formatDate } from '../../lib/utils'

const COVER_PRESETS = [
  {
    id: 'calm-teal',
    title: 'Calm Mindfulness',
    category: 'Relaksasi',
    url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'peaceful-nature',
    title: 'Forest Serenity',
    category: 'Alam',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'warm-sunset',
    title: 'Warm Twilight',
    category: 'Senja',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cozy-library',
    title: 'Academic & Focus',
    category: 'Edukasi',
    url: 'https://images.unsplash.com/photo-1507842229453-769a6327389a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'aurora-emerald',
    title: 'Emerald Aurora',
    category: 'Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'minimal-abstract',
    title: 'Minimal Geometric',
    category: 'Modern',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function ProfileView() {
  const location = useLocation()
  const userId = location.pathname.match(/\/profil\/([^/]+)/)?.[1] || null

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) {
    return (
      <Card>
        <CardHeader title="Profil" icon={Loader2} />
        <div className="p-8 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
          <Skeleton className="h-96 rounded-md mb-4 mx-auto" />
          <Skeleton className="h-16 w-40 mb-2 mx-auto text-sm" />
          <Skeleton className="h-16 w-40 mb-2 mx-auto text-sm" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Profil" icon={Loader2} />
        <div className="p-8 text-center text-slate-500">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </Card>
    )
  }

  if (!profile) {
    return <p className="text-center text-slate-500">Profil tidak ditemukan</p>
  }

  const user = profile
  const npm = user.npm || '-'
  const prodiName = user.prodi_name || '-'
  const cohort = user.cohort || '-'
  const roleLabel = user.role_label || user.role || '-'
  const phone = user.phone || '-'
  const email = user.email || '-'

  const avatarSrc = user.avatar_url || user.avatar || null
  const coverSrc = user.cover_url || null

  return (
    <Card>
      <CardHeader title="Profil Saya" icon={UserRound} />

      <div className="relative h-64 sm:h-72 overflow-hidden sm:rounded-t-lg">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt="Foto Sampul"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900"
          >
            <div className="hero-dots absolute inset-0 opacity-20" />
            <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />
            <div className="absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-xl" />
          </div>
        )}

        <div
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 rounded-full bg-white/90 backdrop-blur-md p-2"
        >
          {avatarSrc ? (
            <Avatar
              name={user?.name}
              src={avatarSrc}
              className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white dark:border-[#0c0d10]"
            />
          ) : (
            <div
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-300 flex items-center justify-center text-2xl font-bold text-slate-600"
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {user.name}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          {user.email}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-[10px] font-medium text-slate-400">NIM / NIP</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">{npm}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Prodi</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">{prodiName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-[10px] font-medium text-slate-400">Angkatan</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">Angkatan {cohort}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-slate-400">Role</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">{roleLabel}</p>
          </div>
        </div>

        {phone !== '-' && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {phone}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          Terdaftar {formatDate(user.created_at)}
        </div>
      </div>
    </Card>
  )
}