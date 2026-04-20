import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiZap, FiHome, FiBriefcase, FiMessageSquare,
  FiDollarSign, FiUser, FiLogOut, FiBell,
  FiCheckCircle, FiTrendingUp, FiArrowRight,
  FiStar, FiSearch, FiBookmark,
  FiClock, FiMapPin, FiUsers
} from 'react-icons/fi'
import '../../styles/dashboard.css'
import StudentJobs from './views/StudentJobs'
import StudentBids from './views/StudentBids'
import StudentMessages from './views/StudentMessages'
import StudentEarnings from './views/StudentEarnings'
import StudentProfile from './views/StudentProfile'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')

  const stats = [
    { icon: <FiBriefcase />, label: 'Active Jobs', value: '2', color: 'stat-green' },
    { icon: <FiCheckCircle />, label: 'Completed', value: '5', color: 'stat-purple' },
    { icon: <FiDollarSign />, label: 'Total Earned', value: '₦85,000', color: 'stat-orange' },
    { icon: <FiStar />, label: 'My Rating', value: '4.8', color: 'stat-blue' },
  ]

  const featuredJobs = [
    {
      id: 1,
      title: 'Logo Design for my bakery',
      budget: '₦15,000',
      category: 'Design',
      bids: 4,
      posted: '2 hours ago',
      location: 'Akungba-Akoko',
      client: 'Bola Adeyemi',
      clientAvatar: 'BA',
      description: 'Looking for a creative student to design a modern logo.',
    },
    {
      id: 2,
      title: 'Social media management',
      budget: '₦30,000',
      category: 'Marketing',
      bids: 7,
      posted: '5 hours ago',
      location: 'Owo, Ondo',
      client: 'Temi Fashion',
      clientAvatar: 'TF',
      description: 'Need a student to manage Instagram and Facebook pages.',
    },
    {
      id: 3,
      title: 'WhatsApp chatbot setup',
      budget: '₦45,000',
      category: 'AI & Tech',
      bids: 1,
      posted: '3 hours ago',
      location: 'Remote',
      client: 'Kunle Ventures',
      clientAvatar: 'KV',
      description: 'Set up an automated WhatsApp chatbot for customer service.',
    },
  ]

  const renderContent = () => {
    switch (activePage) {
      case 'jobs': return <StudentJobs />
      case 'bids': return <StudentBids />
      case 'messages': return <StudentMessages />
      case 'earnings': return <StudentEarnings />
      case 'profile': return <StudentProfile />
      default: return (
        <>
          {/* STATS */}
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div className={`stat-card ${stat.color}`} key={i}>
                <div className="stat-card-icon">{stat.icon}</div>
                <div>
                  <p className="stat-card-value">{stat.value}</p>
                  <p className="stat-card-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header">
            <h2 className="section-title">Featured Jobs</h2>
            <button className="card-link" onClick={() => setActivePage('jobs')}>
              Browse all jobs <FiArrowRight />
            </button>
          </div>

          <div className="jobs-card-grid">
            {featuredJobs.map(job => (
              <div className="job-card" key={job.id}>
                <div className="job-card-top">
                  <span className="job-card-category">{job.category}</span>
                  <button className="bookmark-btn"><FiBookmark /></button>
                </div>
                <h3 className="job-card-title">{job.title}</h3>
                <p className="job-card-desc">{job.description}</p>
                <div className="job-card-meta">
                  <span><FiClock /> {job.posted}</span>
                  <span><FiMapPin /> {job.location}</span>
                  <span><FiUsers /> {job.bids} bids</span>
                </div>
                <div className="job-card-client">
                  <div className="client-avatar">{job.clientAvatar}</div>
                  <span className="client-name">{job.client}</span>
                </div>
                <div className="job-card-footer">
                  <span className="job-card-budget">{job.budget}</span>
                  <button className="btn-primary btn-small">Bid Now</button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <div className="quick-action" onClick={() => setActivePage('jobs')}>
              <div className="quick-action-icon qa-green"><FiSearch /></div>
              <p>Browse jobs</p>
            </div>
            <div className="quick-action" onClick={() => setActivePage('bids')}>
              <div className="quick-action-icon qa-blue"><FiTrendingUp /></div>
              <p>My bids</p>
            </div>
            <div className="quick-action" onClick={() => setActivePage('earnings')}>
              <div className="quick-action-icon qa-purple"><FiDollarSign /></div>
              <p>My earnings</p>
            </div>
            <div className="quick-action" onClick={() => setActivePage('messages')}>
              <div className="quick-action-icon qa-orange"><FiMessageSquare /></div>
              <p>Messages</p>
            </div>
          </div>
        </>
      )
    }
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { icon: <FiHome />, label: 'Dashboard', key: 'home' },
            { icon: <FiBriefcase />, label: 'Browse Jobs', key: 'jobs' },
            { icon: <FiTrendingUp />, label: 'My Bids', key: 'bids' },
            { icon: <FiMessageSquare />, label: 'Messages', key: 'messages', badge: '2' },
            { icon: <FiDollarSign />, label: 'Earnings', key: 'earnings' },
            { icon: <FiUser />, label: 'Profile', key: 'profile' },
          ].map(item => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'nav-item-active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              {item.icon} <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">AO</div>
            <div>
              <p className="sidebar-name">Adeola Okonkwo</p>
              <p className="sidebar-role">Student · Verified ✓</p>
            </div>
          </div>
          <div className="nav-item logout-item" onClick={() => navigate('/')}>
            <FiLogOut /> <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">
              {activePage === 'home' && 'Welcome back, Adeola 👋'}
              {activePage === 'jobs' && 'Browse Jobs'}
              {activePage === 'bids' && 'My Bids'}
              {activePage === 'messages' && 'Messages'}
              {activePage === 'earnings' && 'My Earnings'}
              {activePage === 'profile' && 'My Profile'}
            </h1>
            <p className="topbar-sub">
              {activePage === 'home' && 'You have 3 new job matches today'}
              {activePage === 'jobs' && 'Find the perfect job for your skills'}
              {activePage === 'bids' && 'Track all your proposals'}
              {activePage === 'messages' && 'Chat with your clients'}
              {activePage === 'earnings' && 'Track all your payments'}
              {activePage === 'profile' && 'Manage your student profile'}
            </p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            <div className="student-topbar-avatar">AO</div>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default StudentDashboard