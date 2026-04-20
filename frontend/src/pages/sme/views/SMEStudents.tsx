import { useState } from 'react'
import { FiSearch, FiStar, FiMapPin, FiCheckCircle, FiMessageSquare } from 'react-icons/fi'

const students = [
  { id: 1, name: 'Adeola Okonkwo', avatar: 'AO', skill: 'UI/UX Designer', rating: 4.8, reviews: 12, location: 'AAUA', completed: 8, verified: true },
  { id: 2, name: 'Chidi Nwosu', avatar: 'CN', skill: 'Web Developer', rating: 4.5, reviews: 8, location: 'AAUA', completed: 5, verified: true },
  { id: 3, name: 'Funmi Bello', avatar: 'FB', skill: 'Social Media Manager', rating: 5.0, reviews: 20, location: 'AAUA', completed: 15, verified: true },
  { id: 4, name: 'Temi Ade', avatar: 'TA', skill: 'Content Writer', rating: 4.7, reviews: 9, location: 'AAUA', completed: 7, verified: true },
  { id: 5, name: 'Emeka Obi', avatar: 'EO', skill: 'Graphic Designer', rating: 4.9, reviews: 15, location: 'AAUA', completed: 11, verified: true },
  { id: 6, name: 'Sade Williams', avatar: 'SW', skill: 'Video Editor', rating: 4.6, reviews: 6, location: 'AAUA', completed: 4, verified: true },
]

const SMEStudents = () => {
  const [search, setSearch] = useState('')

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.skill.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Browse Students</h1>
          <p className="view-sub">Find verified AAUA students for your jobs</p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bidders-grid">
        {filtered.map(student => (
          <div className="bidder-card" key={student.id}>
            <div className="bidder-top">
              <div className="bidder-avatar">{student.avatar}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <p className="bidder-name">{student.name}</p>
                  {student.verified && <FiCheckCircle style={{ color: 'var(--primary)', fontSize: '0.85rem' }} />}
                </div>
                <p className="bidder-job">{student.skill}</p>
              </div>
            </div>
            <div className="bidder-rating">
              <FiStar className="star" />
              <span>{student.rating}</span>
              <span className="rating-count">({student.reviews} reviews)</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiMapPin /> {student.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiCheckCircle /> {student.completed} jobs done
              </span>
            </div>
            <div className="bidder-footer">
              <button className="btn-outline btn-small" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiMessageSquare /> Message
              </button>
              <button className="btn-primary btn-small">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SMEStudents