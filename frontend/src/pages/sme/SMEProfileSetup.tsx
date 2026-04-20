import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera, FiUser, FiArrowRight, FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi'
import '../../styles/auth.css'

const SMEProfileSetup = () => {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
    phone: '',
    location: '',
    bio: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard/sme')
    }, 1500)
  }

  return (
    <div className="role-page">
      {/* <div className="role-header">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
        <p className="setup-step">Step 1 of 1 — Profile Setup</p>
      </div> */}

      <div className="role-content">
        <div className="setup-box">
          <h1>Set up your business profile</h1>
          <p>Help students know who they are working for</p>

          {/* PHOTO */}
          <div className="photo-upload-wrap">
            <div className="photo-upload" onClick={() => fileRef.current?.click()}>
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
            <p className="photo-hint">Your business or personal photo</p>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Business name</label>
                <div className="input-wrap">
                  <FiBriefcase className="input-icon" />
                  <input
                    type="text"
                    name="business_name"
                    placeholder="e.g. Bola's Bakery"
                    value={form.business_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Business type</label>
                <div className="input-wrap">
                  <FiBriefcase className="input-icon" />
                  <select
                    name="business_type"
                    value={form.business_type}
                    onChange={handleChange}
                    required
                    className="select-input"
                  >
                    <option value="">Select type</option>
                    <option>Food & Bakery</option>
                    <option>Fashion & Clothing</option>
                    <option>Tech & Software</option>
                    <option>Health & Beauty</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Real Estate</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone number</label>
                <div className="input-wrap">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. 08012345678"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <div className="input-wrap">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Akungba-Akoko, Ondo"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Short bio</label>
              <textarea
                name="bio"
                placeholder="Tell students a little about your business..."
                value={form.bio}
                onChange={handleChange}
                className="textarea-input"
                rows={4}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Saving...' : <><span>Save & Go to Dashboard</span> <FiArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SMEProfileSetup