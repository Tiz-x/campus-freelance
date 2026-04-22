import { Routes, Route } from 'react-router-dom'
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

function App() {
  const { loading } = useAuth()

  console.log('App loading state:', loading)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#f5f7fa'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #1a9c6e',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
    </Routes>
  )
}

export default App