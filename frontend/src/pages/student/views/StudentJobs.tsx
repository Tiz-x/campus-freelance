import { useState } from 'react'
import {
  FiSearch, FiBriefcase, FiClock, FiMapPin,
  FiUsers, FiBookmark, FiFilter
} from 'react-icons/fi'

const allJobs = [
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

const categories = ['All', 'Web Dev', 'Design', 'Marketing', 'Writing', 'AI & Tech']

const StudentJobs = () => {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [saved, setSaved] = useState<number[]>([])

  const filtered = allJobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'All' || job.category === activeCategory
    return matchSearch && matchCategory
  })

  const toggleSave = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Browse Jobs</h1>
          <p className="view-sub">{filtered.length} jobs available for you</p>
        </div>
      </div>

      <div className="view-toolbar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search jobs by title or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <FiFilter /> Filter
        </button>
      </div>

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

      <div className="jobs-card-grid">
        {filtered.map(job => (
          <div className="job-card" key={job.id}>
            <div className="job-card-top">
              <span className="job-card-category">{job.category}</span>
              <button
                className={`bookmark-btn ${saved.includes(job.id) ? 'bookmarked' : ''}`}
                onClick={() => toggleSave(job.id)}
              >
                <FiBookmark />
              </button>
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

      {filtered.length === 0 && (
        <div className="empty-state">
          <FiBriefcase className="empty-icon" />
          <h3>No jobs found</h3>
          <p>Try a different search or category</p>
        </div>
      )}
    </div>
  )
}

export default StudentJobs