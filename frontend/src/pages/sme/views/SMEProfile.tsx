import { useState, useRef } from 'react'
import { FiEdit, FiCamera, FiUser, FiBriefcase, FiMapPin, FiPhone, FiMail, FiSave } from 'react-icons/fi'

const SMEProfile = () => {
  const [editing, setEditing] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    business_name: "Bola's Bakery",
    business_type: 'Food & Bakery',
    phone: '08012345678',
    location: 'Akungba-Akoko, Ondo',
    email: 'bola@gmail.com',
    bio: "We are a small bakery business based in Akungba-Akoko. We specialize in cakes, bread and pastries. Looking for talented students to help grow our brand.",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">My Profile</h1>
          <p className="view-sub">Manage your business profile</p>
        </div>
        <button
          className={editing ? 'btn-primary' : 'btn-outline'}
          onClick={() => setEditing(!editing)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {editing ? <><FiSave /> Save Changes</> : <><FiEdit /> Edit Profile</>}
        </button>
      </div>

      <div className="profile-layout">
        {/* LEFT */}
        <div className="profile-left">
          <div className="profile-card">
            <div className="profile-photo-wrap">
              <div className="profile-photo" onClick={() => editing && fileRef.current?.click()}>
                {photo ? (
                  <img src={photo} alt="Profile" />
                ) : (
                  <div className="profile-photo-placeholder">
                    <FiUser />
                  </div>
                )}
                {editing && (
                  <div className="profile-photo-overlay">
                    <FiCamera />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </div>
            <h2 className="profile-name">{form.business_name}</h2>
            <p className="profile-type">{form.business_type}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">8</span>
                <span className="profile-stat-label">Jobs Posted</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">6</span>
                <span className="profile-stat-label">Completed</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">4.8</span>
                <span className="profile-stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="profile-right">
          <div className="profile-form-card">
            <h3>Business Information</h3>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Business name</label>
                  <div className="input-wrap">
                    <FiBriefcase className="input-icon" />
                    <input
                      type="text"
                      name="business_name"
                      value={form.business_name}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Business type</label>
                  <div className="input-wrap">
                    <FiBriefcase className="input-icon" />
                    <input
                      type="text"
                      name="business_type"
                      value={form.business_type}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone number</label>
                  <div className="input-wrap">
                    <FiPhone className="input-icon" />
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrap">
                    <FiMail className="input-icon" />
                    <input
                      type="text"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="input-wrap">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  className="textarea-input"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SMEProfile