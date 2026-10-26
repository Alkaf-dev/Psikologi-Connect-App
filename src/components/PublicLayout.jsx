import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, LogIn, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { APP_NAME, BRAND_SUBTITLE } from '../lib/brand'
import { cn } from '../lib/utils'
import { Logo } from './Logo'
import { Spinner } from './ui'

const navLinks = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/pengumuman', label: 'Pengumuman' },
]

export default function PublicLayout() {
  const { isAuthenticated, isStaff } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const portalPath = isStaff ? '/admin' : '/portal'
  const portalLabel = isStaff ? 'Dashboard Admin' : 'Portal Saya'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 transition',
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <Link
                to={portalPath}
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
              >
                {portalLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="ml-1 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                Masuk Portal
              </Link>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 sm:hidden"
            aria-label="Buka menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 sm:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={isAuthenticated ? portalPath : '/login'}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {isAuthenticated ? portalLabel : 'Masuk Portal'}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Spinner className="h-6 w-6 text-teal-600" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-semibold text-slate-700">{APP_NAME}</p>
            <p className="mt-0.5 text-xs">{BRAND_SUBTITLE}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link to="/pengumuman" className="hover:text-slate-800">
              Pengumuman
            </Link>
            <Link to="/login" className="hover:text-slate-800">
              Masuk Portal
            </Link>
            <span className="text-slate-300">|</span>
            <span>&copy; {new Date().getFullYear()} Psikologi Connect</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
