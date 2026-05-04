import { FiX, FiCheckCircle, FiMessageCircle, FiBriefcase, FiFile, FiGrid, FiChevronLeft, FiChevronRight,  FiBookOpen, FiMapPin } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { supabase } from "../lib/supabase";

interface Props {
  student: any
  onClose: () => void
  onMessage: (id: string, name: string) => void
  onHire: (student: any) => void
}

const StudentProfileModal = ({ student, onClose, onMessage, onHire }: Props) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.body.classList.add('modal-open')
    fetchCompleteStudentData()
    return () => document.body.classList.remove('modal-open')
  }, [])

  const fetchCompleteStudentData = async () => {
    setLoading(true)
    try {
      // Fetch complete student profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', student.id)
        .single()

      // Fetch portfolio items from signup
      const { data: portfolioData } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', student.id)
        .order('created_at', { ascending: false })

      setStudentData({
        ...student,
        ...profileData,
        portfolio: portfolioData || []
      })
    } catch (error) {
      console.error("Error fetching student data:", error)
      setStudentData(student)
    } finally {
      setLoading(false)
    }
  }

  const portfolioItems = studentData?.portfolio || student?.portfolio || []
  
  const openPortfolioViewer = (item: any, index: number) => {
    setSelectedPortfolio(item)
    setCurrentIndex(index)
  }

  const closePortfolioViewer = () => {
    setSelectedPortfolio(null)
  }

  const nextPortfolio = () => {
    if (currentIndex < portfolioItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedPortfolio(portfolioItems[currentIndex + 1])
    }
  }

  const prevPortfolio = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedPortfolio(portfolioItems[currentIndex - 1])
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Loading student profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
        backdropFilter: 'blur(3px)',
      }} onClick={onClose}>
        <div style={{
          background: 'white', borderRadius: '20px', width: '100%',
          maxWidth: '560px', maxHeight: '92vh', overflow: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }} onClick={e => e.stopPropagation()}>

          {/* BIG PHOTO — TOP HALF */}
          <div style={{ 
            position: 'relative', height: '260px', 
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a4f 100%)', 
            borderRadius: '20px 20px 0 0', overflow: 'hidden', flexShrink: 0
          }}>
            {studentData?.avatar_url ? (
              <img src={studentData.avatar_url} alt={studentData.full_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 800, color: 'rgba(255,255,255,0.15)' }}>
                {studentData?.full_name?.charAt(0).toUpperCase() || 'S'}
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />

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

            <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {studentData?.full_name || 'Student'}
                </h2>
                {studentData?.matric_number && (
                  <span style={{ background: '#1a9c6e', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.18rem 0.6rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiCheckCircle size={9} /> VERIFIED
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                  {studentData?.department || 'Student'} · {studentData?.level || 'University'}
                </span>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div style={{ padding: '1.5rem' }}>

            {/* STATS - Department, Faculty, Level */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f4f6f9', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <FiBriefcase size={20} color="#1a9c6e" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a9c6e', lineHeight: 1.3 }}>{studentData?.department || 'Not specified'}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem', fontWeight: 600 }}>Department</div>
              </div>
              <div style={{ background: '#f4f6f9', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <FiBookOpen size={20} color="#8b5cf6" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6', lineHeight: 1.3 }}>{studentData?.faculty || 'Not specified'}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem', fontWeight: 600 }}>Faculty</div>
              </div>
              <div style={{ background: '#f4f6f9', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <FiMapPin size={20} color="#f59e0b" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', lineHeight: 1.3 }}>{studentData?.level || 'Not specified'}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem', fontWeight: 600 }}>Level</div>
              </div>
            </div>

            {/* BIO */}
            {studentData?.bio && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>About</h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, background: '#f4f6f9', padding: '0.85rem 1rem', borderRadius: '10px', margin: 0 }}>{studentData.bio}</p>
              </div>
            )}

            {/* SKILLS */}
            {studentData?.skills?.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {studentData.skills.map((skill: string, i: number) => (
                    <span key={i} style={{ background: 'rgba(26,156,110,0.08)', color: '#1a9c6e', border: '1px solid rgba(26,156,110,0.18)', padding: '0.3rem 0.85rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACT INFO */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Contact Information</h4>
              <div style={{ background: '#f4f6f9', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0' }}>
                  <strong>Email:</strong> {studentData?.email || student?.email || 'Not provided'}
                </p>
                {studentData?.phone && (
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                    <strong>Phone:</strong> {studentData.phone}
                  </p>
                )}
              </div>
            </div>

            {/* PORTFOLIO SECTION */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiBriefcase /> Portfolio ({portfolioItems.length})
              </h4>
              
              {portfolioItems.length > 0 ? (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    {portfolioItems.map((item: any, index: number) => (
                      <div 
                        key={item.id}
                        onClick={() => openPortfolioViewer(item, index)}
                        style={{
                          cursor: 'pointer',
                          background: '#f4f6f9',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          aspectRatio: '1/1'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,156,110,0.2)'
                          e.currentTarget.style.borderColor = '#1a9c6e'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                        }}
                      >
                        {item.file_type?.startsWith('image/') ? (
                          <img 
                            src={item.file_url} 
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'rgba(26,156,110,0.05)'
                          }}>
                            <FiFile size={32} style={{ color: '#1a9c6e', marginBottom: '0.5rem' }} />
                            <span style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', padding: '0 0.25rem' }}>
                              {item.title?.substring(0, 15) || 'File'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (portfolioItems.length > 0) {
                        openPortfolioViewer(portfolioItems[0], 0)
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(26,156,110,0.08)',
                      border: '1px solid rgba(26,156,110,0.18)',
                      borderRadius: '10px',
                      color: '#1a9c6e',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontFamily: 'inherit'
                    }}
                  >
                    <FiGrid size={14} /> View All Portfolio ({portfolioItems.length} items)
                  </button>
                </>
              ) : (
                <div style={{ background: '#f4f6f9', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
                  <FiBriefcase style={{ fontSize: '1.8rem', color: '#cbd5e1', display: 'block', margin: '0 auto 0.6rem' }} />
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No portfolio added yet</p>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { onMessage(student.id, studentData?.full_name || student.full_name); onClose(); }} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: '#1a9c6e', border: '1.5px solid #1a9c6e', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                <FiMessageCircle /> Message
              </button>
              <button onClick={() => { onHire(student); onClose(); }} style={{ flex: 1, padding: '0.9rem', background: '#1a9c6e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(26,156,110,0.3)' }}>
                <FiBriefcase /> Hire Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Viewer Modal */}
      {selectedPortfolio && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '1rem',
        }} onClick={closePortfolioViewer}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '100%',
            position: 'relative',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            
            <button onClick={closePortfolioViewer} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(0,0,0,0.5)', border: 'none',
              borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', zIndex: 10,
            }}>
              <FiX size={20} />
            </button>

            {portfolioItems.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button onClick={prevPortfolio} style={{
                    position: 'absolute', left: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)', border: 'none',
                    borderRadius: '50%', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', zIndex: 10,
                  }}>
                    <FiChevronLeft size={24} />
                  </button>
                )}
                {currentIndex < portfolioItems.length - 1 && (
                  <button onClick={nextPortfolio} style={{
                    position: 'absolute', right: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)', border: 'none',
                    borderRadius: '50%', width: '40px', height: '40px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', zIndex: 10,
                  }}>
                    <FiChevronRight size={24} />
                  </button>
                )}
              </>
            )}

            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{selectedPortfolio.title}</h3>
              {selectedPortfolio.description && (
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>{selectedPortfolio.description}</p>
              )}
              
              {selectedPortfolio.file_type?.startsWith('image/') ? (
                <img 
                  src={selectedPortfolio.file_url} 
                  alt={selectedPortfolio.title}
                  style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                />
              ) : selectedPortfolio.file_type === 'application/pdf' ? (
                <iframe 
                  src={selectedPortfolio.file_url} 
                  title={selectedPortfolio.title}
                  style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <FiFile size={64} style={{ color: '#1a9c6e', marginBottom: '1rem' }} />
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>{selectedPortfolio.file_name}</p>
                  <a 
                    href={selectedPortfolio.file_url} 
                    download 
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      background: '#1a9c6e',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: 600
                    }}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentProfileModal