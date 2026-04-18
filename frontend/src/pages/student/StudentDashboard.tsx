import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiZap, FiHome, FiBriefcase, FiMessageSquare,
  FiDollarSign, FiUser, FiLogOut, FiBell,
  FiSearch, FiCheckCircle, FiClock, FiTrendingUp,
  FiArrowRight, FiStar, FiFilter
} from 'react-icons/fi'
import '../../styles/dashboard.css'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { icon: <FiBriefcase />, label: 'Active Jobs', value: '2', color: 'stat-green' },
    { icon: <FiCheckCircle />, label: 'Completed', value: '5', color: 'stat-purple' },
    { icon: <FiDollarSign />, label: 'Total Earned', value: '₦85,000', color: 'stat-orange' },
    { icon: <FiStar />, label: 'My Rating', value: '4.8', color: 'stat-blue' },
  ]

  const availableJobs = [
    { id: 1, title: 'Logo Design for my bakery', budget: '₦15,000', category: 'Graphic Design', bids: 4, posted: '2 hours ago' },
    { id: 2, title: 'Social media management for fashion brand', budget: '₦30,000', category: 'Digital Marketing', bids: 7, posted: '5 hours ago' },
    { id: 3, title: 'Website for my restaurant', budget: '₦75,000', category: 'Web Development', bids: 2, posted: '1 day ago' },
    { id: 4, title: 'Product photography for online store', budget: '₦20,000', category: 'Photography', bids: 3, posted: '2 days ago' },
  ]

  const myBids = [
    { id: 1, job: 'Flyer design for event', amount: '₦8,000', status: 'pending', date: '1 day ago' },
    { id: 2, job: 'Instagram page management', amount: '₦25,000', status: 'accepted', date: '3 days ago' },
    { id: 3, job: 'Blog writing for tech company', amount: '₦12,000', status: 'rejected', date: '5 days ago' },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <span className="badge badge-blue">Pending</span>
    if (status === 'accepted') return <span className="badge badge-green">Accepted</span>
    if (status === 'rejected') return <span className="badge badge-gray">Rejected</span>
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
            <FiBriefcase /> <span>Browse Jobs</span>
          </div>
          <div
            className={`nav-item ${activePage === 'bids' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('bids')}
          >
            <FiTrendingUp /> <span>My Bids</span>
          </div>
          <div
            className={`nav-item ${activePage === 'messages' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('messages')}
          >
            <FiMessageSquare /> <span>Messages</span>
            <span className="nav-badge">2</span>
          </div>
          <div
            className={`nav-item ${activePage === 'earnings' ? 'nav-item-active' : ''}`}
            onClick={() => setActivePage('earnings')}
          >
            <FiDollarSign /> <span>Earnings</span>
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
            <h1 className="topbar-title">Welcome back, Adeola 👋</h1>
            <p className="topbar-sub">You have 3 new job matches today</p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            <div className="student-topbar-avatar">AO</div>
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

        {/* SEARCH JOBS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Browse Available Jobs</h2>
            <button className="card-link">View all <FiArrowRight /></button>
          </div>
          <div className="search-bar-wrap">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FiFilter /> Filter
            </button>
          </div>
          <div className="available-jobs">
            {availableJobs
              .filter(job =>
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(job => (
                <div className="available-job-item" key={job.id}>
                  <div className="job-item-left">
                    <div className="job-item-icon">
                      <FiBriefcase />
                    </div>
                    <div>
                      <p className="job-item-title">{job.title}</p>
                      <p className="job-item-meta">
                        <span className="badge badge-green">{job.category}</span>
                        <FiClock /> {job.posted} · {job.bids} bids
                      </p>
                    </div>
                  </div>
                  <div className="job-item-right">
                    <p className="job-item-budget">{job.budget}</p>
                    <button className="btn-primary btn-small">Bid now</button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* MY BIDS */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Recent Bids</h2>
            <button className="card-link">View all <FiArrowRight /></button>
          </div>
          <div className="bids-list">
            {myBids.map(bid => (
              <div className="bid-item" key={bid.id}>
                <div className="bid-avatar" style={{ background: 'var(--secondary)' }}>
                  <FiBriefcase />
                </div>
                <div className="bid-info">
                  <p className="bid-name">{bid.job}</p>
                  <p className="bid-job">
                    <FiClock /> {bid.date}
                  </p>
                </div>
                <div className="bid-right">
                  <p className="bid-amount">{bid.amount}</p>
                  {getStatusBadge(bid.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default StudentDashboard