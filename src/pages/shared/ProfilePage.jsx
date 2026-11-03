import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Laptop,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
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
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600">
              <div className="hero-dots absolute inset-0 opacity-25" />
              <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-xl" />
              <div className="absolute -left-6 -bottom-8 h-24 w-24 rounded-full bg-white/10 blur-lg" />
              <div className="absolute right-3 -bottom-1 flex items-end pointer-events-none select-none">
                <img
                  src="/images/psychology/mascot/greeting.png"
                  alt="Maskot Psikologi Connect"
                  className="h-24 w-auto object-contain drop-shadow-md opacity-95"
                />
              </div>
            </div>
            <div className="relative z-10 px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between gap-3">
                <div className="relative group">
                  <Avatar
                    name={user?.name}
                    src={user?.avatar_url || user?.avatar}
                    className="h-20 w-20 border-4 border-white text-xl shadow-md ring-1 ring-slate-900/5 transition group-hover:opacity-95"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-md transition hover:bg-teal-700 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 disabled:opacity-50"
                    title="Ganti foto profil"
                    aria-label="Ganti foto profil"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
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

                <div className="flex items-center gap-2">
                  {(user?.avatar_url || user?.avatar) ? (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition shadow-xs"
                      title="Hapus foto profil"
                      aria-label="Hapus foto profil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  <Badge variant="teal">{user?.role_label || user?.role}</Badge>
                </div>
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>

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
    </div>
  )
}
