import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiZap, FiHome, FiBriefcase, FiMessageSquare,
  FiDollarSign, FiUser, FiLogOut, FiBell,
  FiSearch, FiCheckCircle, FiClock, FiTrendingUp,
  FiArrowRight, FiStar, FiFilter, FiBookmark,
  FiMapPin, FiUsers
} from 'react-icons/fi'
import '../../styles/dashboard.css'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Web Dev', 'Design', 'Marketing', 'Writing', 'AI & Tech']

  const stats = [
    { icon: <FiBriefcase />, label: 'Active Jobs', value: '2', color: 'stat-green' },
    { icon: <FiCheckCircle />, label: 'Completed', value: '5', color: 'stat-purple' },
    { icon: <FiDollarSign />, label: 'Total Earned', value: '₦85,000', color: 'stat-orange' },
    { icon: <FiStar />, label: 'My Rating', value: '4.8', color: 'stat-blue' },
  ]

  const availableJobs = [
    {
      id: 1,
      title: 'Logo Design for my bakery',
      description: 'Looking for a creative student to design a modern, clean logo for my new bakery business in Akungba.',
      budget: '₦15,000',
      category: 'Design',
      bids: 4,
      posted: '2 hours ago',
      location: 'Akungba-Akoko',
      client: 'Bola Adeyemi',
      clientAvatar: 'BA',
    },
    {
      id: 2,
      title: 'Social media management for fashion brand',
      description: 'Need a student to manage Instagram and Facebook pages. Create content, reply DMs and grow the page.',
      budget: '₦30,000',
      category: 'Marketing',
      bids: 7,
      posted: '5 hours ago',
      location: 'Owo, Ondo',
      client: 'Temi Fashion',
      clientAvatar: 'TF',
    },
    {
      id: 3,
      title: 'Restaurant website development',
      description: 'Build a simple but professional website for my restaurant with menu, gallery and contact page.',
      budget: '₦75,000',
      category: 'Web Dev',
      bids: 2,
      posted: '1 day ago',
      location: 'Akure, Ondo',
      client: 'Mr. Okafor',
      clientAvatar: 'MO',
    },
    {
      id: 4,
      title: 'Product photography for online store',
      description: 'Professional photos of fashion products for online store. Must have good camera and editing skills.',
      budget: '₦20,000',
      category: 'Design',
      bids: 3,
      posted: '2 days ago',
      location: 'Akungba-Akoko',
      client: 'Shade Stores',
      clientAvatar: 'SS',
    },
    {
      id: 5,
      title: 'WhatsApp chatbot for my business',
      description: 'Set up an automated WhatsApp chatbot for customer service for my small business.',
      budget: '₦45,000',
      category: 'AI & Tech',
      bids: 1,
      posted: '3 hours ago',
      location: 'Remote',
      client: 'Kunle Ventures',
      clientAvatar: 'KV',
    },
    {
      id: 6,
      title: 'Blog articles for tech website',
      description: 'Write 10 SEO-friendly blog articles about technology and gadgets. Must be original content.',
      budget: '₦18,000',
      category: 'Writing',
      bids: 6,
      posted: '1 day ago',
      location: 'Remote',
      client: 'TechNG Blog',
      clientAvatar: 'TB',
    },
  ]

  const myBids = [
    { id: 1, job: 'Flyer design for event', amount: '₦8,000', status: 'pending', date: '1 day ago', client: 'Ade Events' },
    { id: 2, job: 'Instagram page management', amount: '₦25,000', status: 'accepted', date: '3 days ago', client: 'Temi Fashion' },
    { id: 3, job: 'Blog writing for tech company', amount: '₦12,000', status: 'rejected', date: '5 days ago', client: 'TechNG Blog' },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <span className="badge badge-blue">Pending</span>
    if (status === 'accepted') return <span className="badge badge-green">Accepted ✓</span>
    if (status === 'rejected') return <span className="badge badge-gray">Rejected</span>
  }

  const filteredJobs = availableJobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = activeCategory === 'All' || job.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
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

      {/* MAIN */}
      <main className="dashboard-main">

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Welcome back, Adeola 👋</h1>
            <p className="topbar-sub">You have {filteredJobs.length} jobs available today</p>
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

        {/* SEARCH + FILTER */}
        <div className="browse-header">
          <h2 className="section-title">Browse Jobs</h2>
          <div className="search-filter-row">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <FiFilter /> Filter
            </button>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill ${activeCategory === cat ? 'pill-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* JOB CARDS GRID */}
        <div className="jobs-card-grid">
          {filteredJobs.map(job => (
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

        {/* MY BIDS */}
        <div className="section-header">
          <h2 className="section-title">My Recent Bids</h2>
          <button className="card-link">View all <FiArrowRight /></button>
        </div>

        <div className="my-bids-grid">
          {myBids.map(bid => (
            <div className="my-bid-card" key={bid.id}>
              <div className="my-bid-left">
                <div className="bid-job-icon"><FiBriefcase /></div>
                <div>
                  <p className="my-bid-title">{bid.job}</p>
                  <p className="my-bid-client">{bid.client} · <FiClock /> {bid.date}</p>
                </div>
              </div>
              <div className="my-bid-right">
                <p className="my-bid-amount">{bid.amount}</p>
                {getStatusBadge(bid.status)}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}

export default StudentDashboard