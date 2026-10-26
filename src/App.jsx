import { lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import PortalLayout from './components/PortalLayout'
import LoginPage from './pages/public/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

const HomePage = lazy(() => import('./pages/public/HomePage'))
const AnnouncementsPage = lazy(() => import('./pages/public/AnnouncementsPage'))
const AnnouncementDetailPage = lazy(() => import('./pages/public/AnnouncementDetailPage'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentTasks = lazy(() => import('./pages/student/StudentTasks'))
const StudentSchedule = lazy(() => import('./pages/student/StudentSchedule'))
const StudentGroups = lazy(() => import('./pages/student/StudentGroups'))
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements'))
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'))
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage'))
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'))
const StaffCourses = lazy(() => import('./pages/staff/StaffCourses'))
const StaffSchedule = lazy(() => import('./pages/staff/StaffSchedule'))
const StaffGroups = lazy(() => import('./pages/staff/StaffGroups'))
const StaffTasks = lazy(() => import('./pages/staff/StaffTasks'))
const StaffSubmissions = lazy(() => import('./pages/staff/StaffSubmissions'))
const StaffStudents = lazy(() => import('./pages/staff/StaffStudents'))
const StaffStudyPrograms = lazy(() => import('./pages/staff/StaffStudyPrograms'))
const StaffAnnouncements = lazy(() => import('./pages/staff/StaffAnnouncements'))
const StaffUsers = lazy(() => import('./pages/staff/StaffUsers'))
const StaffSettings = lazy(() => import('./pages/staff/StaffSettings'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pengumuman" element={<AnnouncementsPage />} />
              <Route path="/pengumuman/:id" element={<AnnouncementDetailPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<Navigate to="/portal" replace />} />

            <Route element={<ProtectedRoute role="student" />}>
              <Route path="/portal" element={<PortalLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="tugas" element={<StudentTasks />} />
                <Route path="jadwal" element={<StudentSchedule />} />
                <Route path="kelompok" element={<StudentGroups />} />
                <Route path="pengumuman" element={<StudentAnnouncements />} />
                <Route path="notifikasi" element={<NotificationsPage />} />
                <Route path="profil" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="staff" />}>
              <Route path="/admin" element={<PortalLayout />}>
                <Route index element={<StaffDashboard />} />
                <Route path="mata-kuliah" element={<StaffCourses />} />
                <Route path="jadwal" element={<StaffSchedule />} />
                <Route path="kelompok" element={<StaffGroups />} />
                <Route path="tugas" element={<StaffTasks />} />
                <Route path="pengumpulan" element={<StaffSubmissions />} />
                <Route path="mahasiswa" element={<StaffStudents />} />
                <Route path="program-studi" element={<StaffStudyPrograms />} />
                <Route path="pengumuman" element={<StaffAnnouncements />} />
                <Route path="user" element={<StaffUsers />} />
                <Route path="notifikasi" element={<NotificationsPage />} />
                <Route path="profil" element={<ProfilePage />} />
                <Route path="pengaturan" element={<StaffSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
