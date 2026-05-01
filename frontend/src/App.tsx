import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SelectRolePage from './pages/SelectRolePage'
import VerifyStudentPage from './pages/VerifyStudentPage'
import SMEProfileSetup from './pages/sme/SMEProfileSetup'
import SMEDashboard from './pages/sme/SMEDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import PostJobPage from './pages/sme/PostJobPage'
import ErrorPage from './components/ErrorPage'

function App() {
  const { loading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    if (
      user &&
      !loading &&
      location.pathname !== '/' &&
      location.pathname !== '/login' &&
      location.pathname !== '/signup' &&
      location.pathname !== '/select-role'
    ) {
      sessionStorage.setItem('lastRoute', location.pathname)
    }
  }, [location.pathname, user, loading])

  useEffect(() => {
    if (!loading && isRestoring) {
      const lastRoute = sessionStorage.getItem('lastRoute')
      if (
        lastRoute &&
        lastRoute !== '/' &&
        user &&
        (location.pathname === '/' || location.pathname === '/login')
      ) {
        sessionStorage.removeItem('lastRoute')
        navigate(lastRoute, { replace: true })
      }
      setIsRestoring(false)
    }
  }, [loading, user, location.pathname, navigate, isRestoring])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f7fb',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#1a9c6e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/select-role" element={<SelectRolePage />} />
      <Route path="/verify-student" element={<VerifyStudentPage />} />
      <Route path="/sme-profile-setup" element={<SMEProfileSetup />} />
      <Route path="/dashboard/sme" element={<SMEDashboard />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/post-job" element={<PostJobPage />} />
      <Route path="*" element={<ErrorPage title="Page Not Found" message="The page you're looking for doesn't exist or has been moved." />} />
    </Routes>
  )
}

export default App