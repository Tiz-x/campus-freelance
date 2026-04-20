import { useState, useRef } from 'react'
import {
  FiEdit, FiCamera, FiUser, FiMail,
  FiMapPin, FiHash, FiSave, FiStar,
  FiCheckCircle, FiCode, FiPenTool
} from 'react-icons/fi'

const StudentProfile = () => {
  const [editing, setEditing] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    full_name: 'Adeola Okonkwo',
    email: 'adeola@gmail.com',
    matric: '220404001',
    department: 'Computer Science',
    level: '300',
    location: 'AAUA, Akungba-Akoko',
    bio: 'I am a 300 level Computer Science student at AAUA with skills in UI/UX design, graphic design and social media management. I have completed over 5 freelance projects.',
    skills: ['UI/UX Design', 'Graphic Design', 'Social Media', 'Logo Design'],
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
          <p className="view-sub">Manage your student profile</p>
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
            <h2 className="profile-name">{form.full_name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <FiCheckCircle style={{ color: 'var(--primary)', fontSize: '0.9rem' }} />
              <p className="profile-type">Verified Student</p>
            </div>
            <p className="profile-type">{form.department} · {form.level}L</p>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">5</span>
                <span className="profile-stat-label">Completed</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">4.8</span>
                <span className="profile-stat-label">Rating</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">₦85k</span>
                <span className="profile-stat-label">Earned</span>
              </div>
            </div>

            <div className="profile-rating-row">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} style={{ color: s <= 4 ? '#f59e0b' : 'var(--border)', fontSize: '1rem' }} />
              ))}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '0.3rem' }}>4.8 (12 reviews)</span>
            </div>
          </div>

          <div className="profile-card" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '1rem' }}>Skills</h3>
            <div className="skills-list">
              {form.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="profile-right">
          <div className="profile-form-card">
            <h3>Personal Information</h3>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full name</label>
                  <div className="input-wrap">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Matric number</label>
                  <div className="input-wrap">
                    <FiHash className="input-icon" />
                    <input
                      type="text"
                      name="matric"
                      value={form.matric}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <div className="input-wrap">
                    <FiCode className="input-icon" />
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <div className="input-wrap">
                    <FiPenTool className="input-icon" />
                    <input
                      type="text"
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                      disabled={!editing}
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
                      value={form.location}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
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

export default StudentProfile