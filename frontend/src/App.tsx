import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import SelectRolePage from './pages/SelectRolePage'
import VerifyStudentPage from './pages/VerifyStudentPage'
import SMEDashboard from './pages/sme/SMEDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/verify-student" element={<VerifyStudentPage />} />
        <Route path="/dashboard/sme" element={<SMEDashboard />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App