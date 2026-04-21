import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import TopProgressBar from './components/TopProgressBar'
import LoadingScreen from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import SelectRolePage from './pages/SelectRolePage'
import VerifyStudentPage from './pages/VerifyStudentPage'
import SMEDashboard from './pages/sme/SMEDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import SMEProfileSetup from './pages/sme/SMEProfileSetup'
import PostJobPage from './pages/sme/PostJobPage'
import './styles/global.css'

function App() {
  const { loading: authLoading } = useAuth()
  const [forceShow, setForceShow] = useState(false)

  // Fallback: If loading takes more than 3 seconds, force show the app
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.log('Loading timeout - forcing app to show')
        setForceShow(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [authLoading])

  // Show loading screen while checking authentication (max 3 seconds)
  if (authLoading && !forceShow) {
    return <LoadingScreen />
  }

  return (
    <>
      <TopProgressBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        
        <Route path="/verify-student" element={
          <ProtectedRoute>
            <VerifyStudentPage />
          </ProtectedRoute>
        } />
        
        <Route path="/sme-profile-setup" element={
          <ProtectedRoute allowedRoles={['sme']}>
            <SMEProfileSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/post-job" element={
          <ProtectedRoute allowedRoles={['sme']}>
            <PostJobPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/sme" element={
          <ProtectedRoute allowedRoles={['sme']}>
            <SMEDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App