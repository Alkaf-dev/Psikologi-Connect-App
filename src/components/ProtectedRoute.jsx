import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui'

export default function ProtectedRoute({ role }) {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
          <Spinner className="h-7 w-7 text-teal-600" />
          Memuat sesi Anda...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role === 'student' && user.role !== 'mahasiswa') {
    return <Navigate to="/admin" replace />
  }

  if (role === 'staff' && user.role === 'mahasiswa') {
    return <Navigate to="/portal" replace />
  }

  return <Outlet />
}
