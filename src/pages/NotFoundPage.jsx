import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, GraduationCap, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { APP_NAME, BRAND_SUBTITLE } from '../lib/brand'
import { Button } from '../components/ui'

export default function NotFoundPage() {
  const { user, isStaff } = useAuth()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative w-full max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold text-slate-900">{APP_NAME}</span>
            <span className="block text-[10px] text-slate-500">{BRAND_SUBTITLE}</span>
          </span>
        </Link>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Compass className="h-7 w-7" />
          </span>
          <p className="mt-6 text-5xl font-black tracking-tight text-slate-900">404</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Kembali ke halaman utama untuk melanjutkan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button as={Link} to="/" variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Beranda
            </Button>
            {user ? (
              <Button as={Link} to={isStaff ? '/admin' : '/portal'}>
                <LayoutDashboard className="h-4 w-4" />
                {isStaff ? 'Panel Admin' : 'Portal Saya'}
              </Button>
            ) : (
              <Button as={Link} to="/login">
                Masuk Portal
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
