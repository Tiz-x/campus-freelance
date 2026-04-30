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

  // Save current route when it changes
  useEffect(() => {
    if (user && !loading && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/select-role') {
      sessionStorage.setItem('lastRoute', location.pathname)
    }
  }, [location.pathname, user, loading])

  // Restore last route on refresh - wait for auth to complete
  useEffect(() => {
    if (!loading && isRestoring) {
      const lastRoute = sessionStorage.getItem('lastRoute')
      
      console.log('Restoring route:', { lastRoute, currentPath: location.pathname, user: !!user })
      
      // Only restore if we have a saved route and we're on the root or login page
      if (lastRoute && lastRoute !== '/' && user && (location.pathname === '/' || location.pathname === '/login')) {
        sessionStorage.removeItem('lastRoute')
        navigate(lastRoute, { replace: true })
      }
      setIsRestoring(false)
    }
  }, [loading, user, location.pathname, navigate, isRestoring])

  if (loading) {
    return null
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