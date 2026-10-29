import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import { ApiError, errorMessage } from '../../lib/api'
import { APP_NAME, BRAND_SUBTITLE, DEFAULT_SETTINGS } from '../../lib/brand'
import { Button, Field, Input, Select, Spinner } from '../../components/ui'
import { MascotGif } from '../../components/PsychologyMascot'

export const DEFAULT_PROGRAMS = [
  { id: '01M60CY00TAFA0HV21NX7JFNDF', code: 'psi', name: 'Psikologi Islam', degree: 'S1', label: 'S1 Psikologi Islam' },
  { id: '01M60M042VB05KZ8D99P9D6MJE', code: 'hki', name: 'Hukum Keluarga Islam', degree: 'S1', label: 'S1 Hukum Keluarga Islam' },
  { id: '01M60M043GTP41WPV6GWJ61FHH', code: 'es', name: "Ekonomi Syari'ah", degree: 'S1', label: "S1 Ekonomi Syari'ah" },
  { id: '01M60M043QTPAWJT4PQJ4HQWE5', code: 'pgmi', name: 'Pendidikan Guru Madrasah Ibtidaiyah', degree: 'S1', label: 'S1 Pendidikan Guru Madrasah Ibtidaiyah' },
]

export default function LoginPage() {
  const { user, isStaff, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: programs, loading: programsLoading } = useApiData('/study-programs', undefined, {
    keepPrevious: false,
  })
  const { data: settingsResponse } = useApiData('/settings', undefined, { keepPrevious: false })
  const settings = { ...DEFAULT_SETTINGS, ...(settingsResponse || {}) }

  const availablePrograms = (programs && programs.length > 0) ? programs : DEFAULT_PROGRAMS

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('psikologi_remember_me') !== 'false'
  })

  const [form, setForm] = useState(() => {
    const isRemembered = localStorage.getItem('psikologi_remember_me') !== 'false'
    const savedLogin = isRemembered ? localStorage.getItem('psikologi_remember_login') || '' : ''
    const savedProdi = isRemembered ? localStorage.getItem('psikologi_remember_prodi') || '' : ''
    return {
      login: savedLogin,
      password: '',
      prodiId: savedProdi || DEFAULT_PROGRAMS[0].id,
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (user) {
      navigate(isStaff ? '/admin' : '/portal', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!form.prodiId && availablePrograms.length) {
      const psychology = availablePrograms.find((program) => program.name?.toLowerCase().includes('psikologi'))
      const active = availablePrograms.filter((program) => program.active !== false)
      const selected = psychology || active[0] || availablePrograms[0]
      if (selected) setForm((current) => ({ ...current, prodiId: selected.id }))
    }
  }, [availablePrograms, form.prodiId])

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.prodiId) {
      setError('Pilih program studi terlebih dahulu.')
      return
    }

    setSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      if (rememberMe) {
        localStorage.setItem('psikologi_remember_me', 'true')
        localStorage.setItem('psikologi_remember_login', form.login.trim())
        localStorage.setItem('psikologi_remember_prodi', form.prodiId)
      } else {
        localStorage.setItem('psikologi_remember_me', 'false')
        localStorage.removeItem('psikologi_remember_login')
        localStorage.removeItem('psikologi_remember_prodi')
      }

      const signedInUser = await login({
        ...form,
        login: form.login.trim(),
        rememberMe,
      })
      const destination = signedInUser.role === 'mahasiswa' ? '/portal' : '/admin'
      const from = location.state?.from
      const allowedFrom =
        from &&
        ((signedInUser.role === 'mahasiswa' && from.startsWith('/portal')) ||
          (signedInUser.role !== 'mahasiswa' && from.startsWith('/admin')))
      navigate(allowedFrom ? from : destination, { replace: true })
    } catch (loginError) {
      if (loginError instanceof ApiError) {
        const mapped = {}
        Object.entries(loginError.errors || {}).forEach(([key, messages]) => {
          const normalized = key.replace('data.', '')
          mapped[normalized] = Array.isArray(messages) ? messages[0] : messages
        })
        setFieldErrors(mapped)
        setError(errorMessage(loginError, 'Username/email/NIM atau password salah.'))
      } else {
        setError(loginError.message || 'Tidak dapat masuk. Coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-bold">{APP_NAME}</span>
              <span className="block text-xs text-teal-100/80">{BRAND_SUBTITLE}</span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            Portal Akademik
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight xl:text-[2.8rem]">
            Satu pintu untuk jadwal, tugas, kelompok, dan pengumuman.
          </h1>
          <p className="mt-5 text-sm leading-7 text-teal-50/85">
            Masuk dengan akun program studi Anda untuk melihat seluruh aktivitas akademik dalam satu portal yang
            terintegrasi.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Jadwal kuliah offline dan online',
              'Pengumpulan tugas beserta nilai dan feedback',
              'Informasi kelompok dan pengumuman prodi',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-sm text-teal-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/15 pt-5 text-[11px] text-teal-100/70">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          <span>{settings.academic_year} · Semester {settings.semester}</span>
        </div>
      </section>

      <section className="flex min-h-screen flex-col lg:min-h-0">
        <div className="flex items-center justify-between p-5 sm:p-8 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">{APP_NAME}</span>
              <span className="block text-[10px] text-slate-500">{BRAND_SUBTITLE}</span>
            </span>
          </Link>
          <Link to="/" className="rounded-lg p-2 text-slate-500 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="hidden lg:block">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke beranda
              </Link>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Masuk ke Psikologi Connect
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih Prodi, lalu gunakan username, email, atau NIM yang terdaftar beserta password.
            </p>

            <MascotGif mascot="laptop" variant="login" />

            {error ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Prodi" required error={fieldErrors.prodi_id || fieldErrors.prodiId}>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Select
                    value={form.prodiId}
                    onChange={(event) => update('prodiId', event.target.value)}
                    className="pl-10"
                    required
                  >
                    {availablePrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.label || `${program.degree || ''} ${program.name || ''}`.trim()}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>

              <Field label="Username, email, atau NIM" required error={fieldErrors.login}>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={form.login}
                    onChange={(event) => update('login', event.target.value)}
                    placeholder="eka, nama@psikologi.test, atau NIM"
                    autoComplete="username"
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </Field>

              <Field label="Password" required error={fieldErrors.password}>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => update('password', event.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="px-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((show) => !show)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span>Ingat saya</span>
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={submitting}>
                {submitting ? 'Memverifikasi...' : 'Masuk Portal'}
                {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Butuh bantuan? Hubungi {settings.contact_email || 'admin program studi'}
            </div>
          </div>
        </div>

        {submitting ? (
          <div className="pointer-events-none fixed inset-x-0 top-0 h-0.5 overflow-hidden bg-teal-100 lg:hidden">
            <div className="h-full w-1/2 animate-pulse bg-teal-500" />
          </div>
        ) : null}
      </section>
    </div>
  )
}
