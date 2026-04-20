import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPlus, FiBriefcase, FiClock, FiUsers,
  FiEye, FiEdit, FiTrash2, FiSearch
} from 'react-icons/fi'

const allJobs = [
  {
    id: 1,
    title: 'Logo Design for my bakery',
    description: 'Looking for a creative student to design a modern logo.',
    budget: '₦15,000',
    category: 'Graphic Design',
    bids: 4,
    status: 'open',
    date: '2 days ago',
  },
  {
    id: 2,
    title: 'Social media management',
    description: 'Need someone to manage Instagram and Facebook pages.',
    budget: '₦30,000',
    category: 'Digital Marketing',
    bids: 7,
    status: 'in_progress',
    date: '5 days ago',
  },
  {
    id: 3,
    title: 'Website for my restaurant',
    description: 'Build a professional website with menu and contact page.',
    budget: '₦75,000',
    category: 'Web Development',
    bids: 2,
    status: 'completed',
    date: '2 weeks ago',
  },
  {
    id: 4,
    title: 'Product photography',
    description: 'Professional photos of my fashion products.',
    budget: '₦20,000',
    category: 'Photography',
    bids: 5,
    status: 'open',
    date: '1 day ago',
  },
]

const SMEJobs = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = allJobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || job.status === filter
    return matchSearch && matchFilter
  })

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <span className="badge badge-green">Open</span>
    if (status === 'in_progress') return <span className="badge badge-blue">In Progress</span>
    if (status === 'completed') return <span className="badge badge-gray">Completed</span>
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">My Jobs</h1>
          <p className="view-sub">Manage all your posted jobs</p>
        </div>
        <button className="btn-primary post-job-btn" onClick={() => navigate('/post-job')}>
          <FiPlus /> Post a Job
        </button>
      </div>

      <div className="view-toolbar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['all', 'open', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="jobs-card-grid">
        {filtered.map(job => (
          <div className="job-card" key={job.id}>
            <div className="job-card-top">
              <span className="job-card-category">{job.category}</span>
              {getStatusBadge(job.status)}
            </div>
            <h3 className="job-card-title">{job.title}</h3>
            <p className="job-card-desc">{job.description}</p>
            <div className="job-card-meta">
              <span><FiClock /> {job.date}</span>
              <span><FiUsers /> {job.bids} bids</span>
            </div>
            <div className="job-card-footer">
              <span className="job-card-budget">{job.budget}</span>
              <div className="job-card-actions">
                <button className="icon-btn"><FiEye /></button>
                <button className="icon-btn"><FiEdit /></button>
                <button className="icon-btn icon-btn-danger"><FiTrash2 /></button>
                <button className="btn-primary btn-small">View Bids</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <FiBriefcase className="empty-icon" />
          <h3>No jobs found</h3>
          <p>Try a different search or post a new job</p>
          <button className="btn-primary" onClick={() => navigate('/post-job')}>
            <FiPlus /> Post a Job
          </button>
        </div>
      )}
    </div>
  )
}

export default SMEJobs