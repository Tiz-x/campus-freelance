import { FiX, FiStar, FiCheckCircle, FiHash, FiMessageCircle, FiBriefcase, FiExternalLink, FiAward } from 'react-icons/fi'
import { useEffect } from 'react'


interface Props {
  student: any
  onClose: () => void
  onMessage: (id: string, name: string) => void
  onHire: (student: any) => void
}


useEffect(() => {
  document.body.classList.add('modal-open')
  return () => document.body.classList.remove('modal-open')
}, [])

const StudentProfileModal = ({ student, onClose, onMessage, onHire }: Props) => {
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
      backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '100%',
        maxWidth: '520px', maxHeight: '92vh', overflow: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>

        {/* BIG PHOTO — TOP HALF */}
        <div style={{ position: 'relative', height: '260px', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a4f 100%)', borderRadius: '20px 20px 0 0', overflow: 'hidden', flexShrink: 0 }}>
          {student.avatar_url ? (
            <img src={student.avatar_url} alt={student.full_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 800, color: 'rgba(255,255,255,0.15)' }}>
              {student.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
          {/* GRADIENT OVERLAY */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />

          {/* CLOSE BTN */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(0,0,0,0.4)', border: 'none',
            borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', fontSize: '1.1rem',
            backdropFilter: 'blur(4px)',
          }}>
            <FiX />
          </button>

          {/* NAME OVERLAY AT BOTTOM */}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {student.full_name || 'Student'}
              </h2>
              {student.matric_number && (
                <span style={{ background: '#1a9c6e', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.18rem 0.6rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FiCheckCircle size={9} /> VERIFIED
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                {student.skills?.[0] || 'Student'} · AAUA
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>
                <FiStar size={12} /> {student.rating || '4.5'}
              </span>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '1.5rem' }}>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Jobs Done', value: student.total_jobs || 0, color: '#1a9c6e' },
              { label: 'Rating', value: student.rating || '4.5', color: '#f59e0b' },
              { label: 'Level', value: student.level || '300L', color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#f4f6f9', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* BIO */}
          {student.bio && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>About</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, background: '#f4f6f9', padding: '0.85rem 1rem', borderRadius: '10px', margin: 0 }}>{student.bio}</p>
            </div>
          )}

          {/* SKILLS */}
          {student.skills?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {student.skills.map((skill: string, i: number) => (
                  <span key={i} style={{ background: 'rgba(26,156,110,0.08)', color: '#1a9c6e', border: '1px solid rgba(26,156,110,0.18)', padding: '0.3rem 0.85rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MATRIC */}
          {student.matric_number && (
            <div style={{ marginBottom: '1.25rem', background: '#f4f6f9', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,156,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a9c6e', flexShrink: 0 }}>
                <FiHash />
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Matric Number</p>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0d1b2a', margin: 0 }}>{student.matric_number}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1a9c6e', fontSize: '0.72rem', fontWeight: 700 }}>
                <FiAward size={14} /> AAUA Student
              </div>
            </div>
          )}

          {/* PORTFOLIO */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Portfolio / Previous Work</h4>
            {student.portfolio_url ? (
              <a href={student.portfolio_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(26,156,110,0.08)', color: '#1a9c6e', padding: '0.6rem 1.1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(26,156,110,0.18)' }}>
                <FiExternalLink /> View Portfolio
              </a>
            ) : (
              <div style={{ background: '#f4f6f9', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
                <FiBriefcase style={{ fontSize: '1.8rem', color: '#cbd5e1', display: 'block', margin: '0 auto 0.6rem' }} />
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No portfolio added yet</p>
                <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '0.3rem 0 0' }}>Student can add their work samples from their profile</p>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => { onMessage(student.id, student.full_name); onClose(); }} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: '#1a9c6e', border: '1.5px solid #1a9c6e', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <FiMessageCircle /> Message
            </button>
            <button onClick={() => { onHire(student); onClose(); }} style={{ flex: 1, padding: '0.9rem', background: '#1a9c6e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(26,156,110,0.3)' }}>
              <FiBriefcase /> Hire Student
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfileModal