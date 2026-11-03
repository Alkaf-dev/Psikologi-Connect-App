import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  KeyRound,
  Laptop,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { api, errorMessage } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DetailList,
  Field,
  Input,
  PageHeader,
  Skeleton,
} from '../../components/ui'

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

export default function ProfilePage() {
  const { user, token, updateLocalUser } = useAuth()
  const { toast, confirm } = useToast()
  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [tokens, setTokens] = useState([])
  const [loadingTokens, setLoadingTokens] = useState(true)

  const fileInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Format tidak didukung', 'Silakan pilih file gambar (JPG, PNG, WebP).')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ukuran terlalu besar', 'Maksimal ukuran foto adalah 3 MB.')
      return
    }

    setUploadingAvatar(true)

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result
      const nextUser = { ...user, avatar_url: dataUrl }
      updateLocalUser(nextUser)
      try {
        localStorage.setItem(`psikologi_avatar_${user?.id || user?.email}`, dataUrl)
      } catch {}

      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const response = await api.upload('/auth/avatar', formData)
        if (response?.data?.avatar_url) {
          updateLocalUser({ ...user, avatar_url: response.data.avatar_url })
        }
        toast.success('Foto profil diperbarui', 'Foto profil berhasil disimpan ke server.')
      } catch {
        toast.success('Foto profil diperbarui', 'Foto profil berhasil disimpan.')
      } finally {
        setUploadingAvatar(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = async () => {
    const approved = await confirm({
      title: 'Hapus foto profil?',
      message: 'Foto profil akan dikembalikan ke inisial nama Anda.',
      confirmLabel: 'Hapus foto',
    })
    if (!approved) return

    try {
      localStorage.removeItem(`psikologi_avatar_${user?.id || user?.email}`)
    } catch {}

    updateLocalUser({ ...user, avatar_url: null, avatar: null })

    try {
      await api.delete('/auth/avatar')
    } catch {}

    toast.success('Foto profil dihapus', 'Inisial nama Anda digunakan kembali.')
  }

  const coverInputRef = useRef(null)
  const [coverUrl, setCoverUrl] = useState(() => {
    try {
      return (
        localStorage.getItem(`psikologi_cover_${user?.id || user?.email}`) ||
        user?.cover_url ||
        ''
      )
    } catch {
      return ''
    }
  })
  const [uploadingCover, setUploadingCover] = useState(false)
  const [showCoverMenu, setShowCoverMenu] = useState(false)
  const [showCoverGalleryModal, setShowCoverGalleryModal] = useState(false)

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Format tidak didukung', 'Silakan pilih file gambar (JPG, PNG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran terlalu besar', 'Maksimal ukuran foto sampul adalah 5 MB.')
      return
    }

    setUploadingCover(true)
    setShowCoverMenu(false)
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result
      setCoverUrl(dataUrl)
      try {
        localStorage.setItem(`psikologi_cover_${user?.id || user?.email}`, dataUrl)
      } catch {}

      const formData = new FormData()
      formData.append('cover', file)
      try {
        await api.upload('/auth/cover', formData)
      } catch {}

      toast.success('Sampul diperbarui', 'Foto sampul berhasil dipasang.')
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleSelectPresetCover = async (presetUrl) => {
    setCoverUrl(presetUrl)
    try {
      localStorage.setItem(`psikologi_cover_${user?.id || user?.email}`, presetUrl)
    } catch {}
    setShowCoverGalleryModal(false)
    setShowCoverMenu(false)
    toast.success('Sampul diperbarui', 'Foto sampul berhasil diterapkan.')

    try {
      await api.patch('/auth/profile', { cover_url: presetUrl })
    } catch {}
  }

  const removeCover = async () => {
    setShowCoverMenu(false)
    const approved = await confirm({
      title: 'Hapus foto sampul?',
      message: 'Foto sampul akan dikembalikan ke tema gradasi bawaan.',
      confirmLabel: 'Hapus sampul',
    })
    if (!approved) return

    try {
      localStorage.removeItem(`psikologi_cover_${user?.id || user?.email}`)
    } catch {}

    setCoverUrl('')
    try {
      await api.delete('/auth/cover')
    } catch {}

    toast.success('Foto sampul dihapus', 'Sampul dikembalikan ke tampilan bawaan.')
  }

  useEffect(() => {
    setProfile({ name: user?.name || '', phone: user?.phone || '' })
  }, [user?.name, user?.phone])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoadingTokens(true)
      try {
        const response = await api.get('/auth/tokens')
        if (active) setTokens(response?.data || [])
      } catch {
        if (active) setTokens([])
      } finally {
        if (active) setLoadingTokens(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const saveProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})

    try {
      const response = await api.patch('/auth/profile', {
        name: profile.name,
        phone: profile.phone || null,
      })
      const nextUser = response?.data
      if (nextUser) updateLocalUser(nextUser)
      toast.success('Profil diperbarui', 'Perubahan profil berhasil disimpan.')
    } catch (error) {
      setProfileErrors(error.errors || {})
      toast.error('Gagal menyimpan profil', errorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordErrors({})

    try {
      const response = await api.put('/auth/password', passwords)
      toast.success('Password diperbarui', response?.message || 'Password berhasil diubah.')
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
    } catch (error) {
      setPasswordErrors(error.errors || {})
      toast.error('Gagal mengubah password', errorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  const revokeToken = async (item) => {
    const approved = await confirm({
      title: 'Cabut sesi perangkat?',
      message: `Sesi "${item.name}" akan langsung keluar dan perlu login kembali.`,
      confirmLabel: 'Cabut sesi',
    })
    if (!approved) return

    try {
      await api.delete(`/auth/tokens/${item.id}`)
      setTokens((current) => current.filter((tokenItem) => tokenItem.id !== item.id))
      toast.success('Sesi dicabut', 'Token perangkat tersebut sudah tidak berlaku.')
    } catch (error) {
      toast.error('Gagal mencabut sesi', errorMessage(error))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akun"
        title="Profil Saya"
        description="Perbarui identitas akun, ganti password, dan kelola sesi perangkat yang terhubung."
      />

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            {/* Facebook/LinkedIn-style Cover Banner */}
            <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 group">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Foto Sampul"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
                  <div className="hero-dots absolute inset-0 opacity-20" />
                  <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />
                  <div className="absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

              {/* Facebook-style Cover Button with Popover Menu */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCoverMenu((prev) => !prev)}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition active:scale-95 disabled:opacity-50"
                    title="Edit foto sampul"
                  >
                    {uploadingCover ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                    ) : (
                      <Camera className="h-3.5 w-3.5 text-white" />
                    )}
                    <span className="font-medium">{coverUrl ? 'Ganti Sampul' : 'Tambahkan Sampul'}</span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </button>

                  {showCoverMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowCoverMenu(false)}
                      />
                      <div className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl border border-slate-200/80 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 p-1.5 shadow-2xl backdrop-blur-md z-40">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCoverMenu(false)
                            coverInputRef.current?.click()
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                            <Upload className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">Unggah Foto</p>
                            <p className="text-[10px] text-slate-400">Pilih dari HP / Laptop</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowCoverMenu(false)
                            setShowCoverGalleryModal(true)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">Tema Estetik</p>
                            <p className="text-[10px] text-slate-400">Koleksi pemandangan & seni</p>
                          </div>
                        </button>

                        {coverUrl && (
                          <>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button
                              type="button"
                              onClick={removeCover}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500">
                                <Trash2 className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <p className="font-semibold">Hapus Sampul</p>
                                <p className="text-[10px] text-rose-400/80">Kembali ke tampilan awal</p>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            <div className="relative z-10 px-5 sm:px-6 pb-6">
              <div className="-mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex items-end gap-3.5">
                  <div className="relative group">
                    <Avatar
                      name={user?.name}
                      src={user?.avatar_url || user?.avatar}
                      className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-white dark:border-[#0c0d10] text-3xl shadow-2xl ring-2 ring-black/10 transition group-hover:opacity-95"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-1 right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white dark:border-[#0c0d10] bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 disabled:opacity-50"
                      title="Ganti foto profil"
                      aria-label="Ganti foto profil"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="mb-2 hidden sm:block">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{user?.name}</h2>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-end">
                  {(user?.avatar_url || user?.avatar) ? (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition shadow-xs"
                      title="Hapus foto profil"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Hapus Foto</span>
                    </button>
                  ) : null}
                  <Badge variant="teal">{user?.role_label || user?.role}</Badge>
                </div>
              </div>

              <div className="mt-3 sm:hidden">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{user?.name}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-slate-400">NIM / NIP</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{user?.npm || '-'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-slate-400">Kelas</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{user?.class_name || '-'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-slate-400">Prodi</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{user?.prodi_name || '-'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-medium text-slate-400">Angkatan</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{user?.cohort || '-'}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {user?.phone || 'Nomor telepon belum diisi'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  Terdaftar {formatDate(user?.created_at)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Informasi Akun"
              icon={ShieldCheck}
              description="Data akademik dikelola oleh admin program studi."
            />
            <div className="px-5 py-2">
              <DetailList
                items={[
                  { label: 'Role', value: user?.role_label || user?.role },
                  { label: 'Prodi', value: user?.prodi_name },
                  { label: 'Status', value: <Badge variant={user?.active ? 'success' : 'danger'}>{user?.active ? 'Aktif' : 'Nonaktif'}</Badge> },
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Data Profil" description="Nama dan nomor telepon yang dapat Anda ubah." icon={UserRound} />
            <form onSubmit={saveProfile} className="space-y-4 p-5">
              <Field label="Nama lengkap" required error={profileErrors.name?.[0]}>
                <Input
                  value={profile.name}
                  onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                  required
                  maxLength={120}
                />
              </Field>
              <Field label="Nomor telepon" error={profileErrors.phone?.[0]}>
                <Input
                  value={profile.phone}
                  onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="0812-0000-0000"
                  maxLength={30}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input value={user?.email || ''} disabled />
                </Field>
                <Field label="NIM / NIP">
                  <Input value={user?.npm || ''} disabled />
                </Field>
              </div>
              <Button type="submit" loading={savingProfile}>
                <Save className="h-4 w-4" />
                Simpan Profil
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Ubah Password"
              description="Password baru minimal 8 karakter. Sesi lain akan otomatis dicabut."
              icon={KeyRound}
            />
            <form onSubmit={changePassword} className="space-y-4 p-5">
              <Field label="Password saat ini" required error={passwordErrors.current_password?.[0]}>
                <Input
                  type="password"
                  value={passwords.current_password}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, current_password: event.target.value }))
                  }
                  autoComplete="current-password"
                  required
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Password baru" required error={passwordErrors.password?.[0]}>
                  <Input
                    type="password"
                    value={passwords.password}
                    onChange={(event) => setPasswords((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </Field>
                <Field label="Konfirmasi password" required error={passwordErrors.password_confirmation?.[0]}>
                  <Input
                    type="password"
                    value={passwords.password_confirmation}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, password_confirmation: event.target.value }))
                    }
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </Field>
              </div>
              <Button type="submit" variant="dark" loading={savingPassword}>
                <KeyRound className="h-4 w-4" />
                Perbarui Password
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Sesi Perangkat"
              description="Daftar token aktif yang terhubung dengan akun Anda."
              icon={Laptop}
              action={
                <Badge variant="neutral">{tokens.length} sesi aktif</Badge>
              }
            />
            <div className="divide-y divide-slate-100 px-5">
              {loadingTokens ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </div>
              ) : tokens.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Tidak ada sesi aktif.</p>
              ) : (
                tokens.map((item) => {
                  const isCurrent = item.current || item.id === token?.id
                  return (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <Laptop className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            {item.name}
                            {isCurrent ? <Badge variant="success">Sesi ini</Badge> : null}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Dibuat {formatDate(item.created_at, { time: true })}
                            {item.last_used_at ? ` · Terakhir dipakai ${formatDate(item.last_used_at, { time: true })}` : ''}
                          </p>
                        </div>
                      </div>
                      {!isCurrent ? (
                        <Button variant="danger-soft" size="sm" onClick={() => revokeToken(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Cabut
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <GraduationCap className="h-3 w-3" />
        Perubahan data akademik hanya dapat dilakukan oleh admin program studi.
      </p>

      {/* Preset Cover Gallery Modal */}
      {showCoverGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pilih Tema Sampul Estetik</h3>
                  <p className="text-xs text-slate-400">Pilih salah satu banner untuk tampilan profil profesional & menenangkan.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCoverGalleryModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {COVER_PRESETS.map((preset) => {
                const isSelected = coverUrl === preset.url
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPresetCover(preset.url)}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:shadow-lg'
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute top-2 left-2 rounded-md bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-white shadow-md">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <p className="text-xs font-bold truncate">{preset.title}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowCoverGalleryModal(false)
                  coverInputRef.current?.click()
                }}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Atau unggah foto dari file Anda
              </button>
              <button
                type="button"
                onClick={() => setShowCoverGalleryModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
