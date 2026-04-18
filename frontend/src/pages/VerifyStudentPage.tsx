import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiZap, FiArrowRight, FiShield, FiCamera, FiUser } from 'react-icons/fi'
import '../styles/auth.css'

const VerifyStudentPage = () => {
  const navigate = useNavigate()
  const [matric, setMatric] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const formatMatric = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 9)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (matric.length !== 9) {
      setError('Matric number must be 9 digits e.g. 240304004')
      return
    }

    if (!photo) {
      setError('Please upload a profile photo')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard/student')
    }, 2000)
  }

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div>

      <div className="role-content">
        <div className="verify-box">
          <div className="verify-icon">
            <FiShield />
          </div>
          <h1>Verify your student status</h1>
          <p>Enter your AAUA matric number and upload a clear photo of yourself</p>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* PHOTO UPLOAD */}
            <div className="photo-upload-wrap">
              <div
                className="photo-upload"
                onClick={() => fileRef.current?.click()}
              >
                {photo ? (
                  <img src={photo} alt="Profile" className="photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <FiUser className="photo-placeholder-icon" />
                    <p>Upload photo</p>
                  </div>
                )}
                <div className="photo-camera-btn">
                  <FiCamera />
                </div>
              </div>
              <p className="photo-hint">Clear passport photo or selfie</p>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </div>

            {/* MATRIC NUMBER */}
            <div className="form-group">
              <label>Matric number</label>
              <div className="input-wrap">
                <span className="input-icon matric-prefix">AAUA</span>
                <input
                  type="text"
                  placeholder="240304004"
                  value={matric}
                  onChange={(e) => setMatric(formatMatric(e.target.value))}
                  className="matric-input"
                  required
                />
                <span className="matric-count">{matric.length}/9</span>
              </div>
              {error && <p className="input-error">{error}</p>}
            </div>

            <div className="verify-note">
              <FiShield className="verify-note-icon" />
              <p>Your matric number and photo are only used to verify your student status. Your photo will appear on your public profile.</p>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : <><span>Verify & Continue</span> <FiArrowRight /></>}
            </button>
          </form>

          <p className="auth-switch">
            Not a student?{' '}
            <span
              onClick={() => navigate('/select-role')}
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Go back
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyStudentPage