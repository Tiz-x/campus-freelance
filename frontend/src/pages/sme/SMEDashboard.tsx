import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiZap, FiHome, FiBriefcase, FiMessageSquare, 
  FiDollarSign, FiUser, FiLogOut, FiBell,
  FiPlus, FiClock, FiCheckCircle, FiUsers,
  FiTrendingUp, FiArrowRight
} from 'react-icons/fi'
import '../../styles/dashboard.css'

const SMEDashboard = () => {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')

  const stats = [
    { icon: <FiBriefcase />, label: 'Active Jobs', value: '3', color: 'stat-green' },
    { icon: <FiUsers />, label: 'Total Bids', value: '12', color: 'stat-blue' },
    { icon: <FiCheckCircle />, label: 'Completed', value: '8', color: 'stat-purple' },
    { icon: <FiDollarSign />, label: 'Total Spent', value: '₦120,000', color: 'stat-orange' },
  ]

  const recentJobs = [
    { id: 1, title: 'Logo Design for my bakery', budget: '₦15,000', bids: 4, status: 'open', date: '2 days ago' },
    { id: 2, title: 'Social media management', budget: '₦30,000', bids: 7, status: 'in_progress', date: '5 days ago' },
    { id: 3, title: 'Website for my restaurant', budget: '₦75,000', bids: 2, status: 'completed', date: '2 weeks ago' },
  ]

  const recentBids = [
    { id: 1, student: 'Adeola Okonkwo', job: 'Logo Design', amount: '₦12,000', avatar: 'AO' },
    { id: 2, student: 'Chidi Nwosu', job: 'Logo Design', amount: '₦14,000', avatar: 'CN' },
    { id: 3, student: 'Funmi Bello', job: 'Social Media', amount: '₦28,000', avatar: 'FB' },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <span className="badge badge-green">Open</span>
    if (status === 'in_progress') return <span className="badge badge-blue">In Progress</span>
    if (status === 'completed') return <span className="badge badge-gray">Completed</span>
  }

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activePage === 'home' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            <FiHome /> <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activePage === 'jobs' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('jobs')}
          >
            <FiBriefcase /> <span>My Jobs</span>
          </div>
          <div
            className={`nav-item ${activePage === 'messages' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('messages')}
          >
            <FiMessageSquare /> <span>Messages</span>
            <span className="nav-badge">3</span>
          </div>
          <div
            className={`nav-item ${activePage === 'payments' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('payments')}
          >
            <FiDollarSign /> <span>Payments</span>
          </div>
          <div
            className={`nav-item ${activePage === 'profile' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <FiUser /> <span>Profile</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-item" onClick={() => navigate('/')}>
            <FiLogOut /> <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Good morning, Bola 👋</h1>
            <p className="topbar-sub">Here's what's happening with your jobs today</p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            <button className="btn-primary post-job-btn" onClick={() => navigate('/post-job')}>
              <FiPlus /> Post a Job
            </button>
          </div>
        </div>

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

        <div className="dashboard-grid">

          {/* RECENT JOBS */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Jobs</h2>
              <button className="card-link">View all <FiArrowRight /></button>
            </div>
            <div className="jobs-list">
              {recentJobs.map(job => (
                <div className="job-item" key={job.id}>
                  <div className="job-item-left">
                    <div className="job-item-icon">
                      <FiBriefcase />
                    </div>
                    <div>
                      <p className="job-item-title">{job.title}</p>
                      <p className="job-item-meta">
                        <FiClock /> {job.date} · {job.bids} bids
                      </p>
                    </div>
                  </div>
                  <div className="job-item-right">
                    <p className="job-item-budget">{job.budget}</p>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT BIDS */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Bids</h2>
              <button className="card-link">View all <FiArrowRight /></button>
            </div>
            <div className="bids-list">
              {recentBids.map(bid => (
                <div className="bid-item" key={bid.id}>
                  <div className="bid-avatar">{bid.avatar}</div>
                  <div className="bid-info">
                    <p className="bid-name">{bid.student}</p>
                    <p className="bid-job">{bid.job}</p>
                  </div>
                  <div className="bid-right">
                    <p className="bid-amount">{bid.amount}</p>
                    <button className="btn-primary btn-small">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <div className="quick-action" onClick={() => navigate('/post-job')}>
              <div className="quick-action-icon qa-green">
                <FiPlus />
              </div>
              <p>Post a new job</p>
            </div>
            <div className="quick-action">
              <div className="quick-action-icon qa-blue">
                <FiUsers />
              </div>
              <p>Browse students</p>
            </div>
            <div className="quick-action">
              <div className="quick-action-icon qa-purple">
                <FiTrendingUp />
              </div>
              <p>View reports</p>
            </div>
            <div className="quick-action">
              <div className="quick-action-icon qa-orange">
                <FiDollarSign />
              </div>
              <p>Payment history</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default SMEDashboard