import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi'

const bids = [
  {
    id: 1,
    job: 'Flyer design for event',
    client: 'Ade Events',
    amount: '₦8,000',
    status: 'pending',
    date: '1 day ago',
    proposal: 'I have 3 years experience in graphic design and can deliver this in 2 days.',
  },
  {
    id: 2,
    job: 'Instagram page management',
    client: 'Temi Fashion',
    amount: '₦25,000',
    status: 'accepted',
    date: '3 days ago',
    proposal: 'I manage 5 Instagram pages currently with combined 50k followers.',
  },
  {
    id: 3,
    job: 'Blog writing for tech company',
    client: 'TechNG Blog',
    amount: '₦12,000',
    status: 'rejected',
    date: '5 days ago',
    proposal: 'I write SEO-optimized tech content and can deliver 5 articles per week.',
  },
  {
    id: 4,
    job: 'Logo design for restaurant',
    client: 'Mr. Okafor',
    amount: '₦18,000',
    status: 'pending',
    date: '2 days ago',
    proposal: 'I specialize in food brand identity and logo design.',
  },
]

const getStatusBadge = (status: string) => {
  if (status === 'pending') return <span className="badge badge-blue">Pending</span>
  if (status === 'accepted') return <span className="badge badge-green">Accepted ✓</span>
  if (status === 'rejected') return <span className="badge badge-gray">Rejected</span>
}

const StudentBids = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">My Bids</h1>
          <p className="view-sub">Track all your job proposals</p>
        </div>
      </div>

      <div className="bids-summary">
        <div className="bid-summary-card">
          <FiAlertCircle className="bid-summary-icon pending-icon" />
          <p className="bid-summary-value">2</p>
          <p className="bid-summary-label">Pending</p>
        </div>
        <div className="bid-summary-card">
          <FiCheckCircle className="bid-summary-icon accepted-icon" />
          <p className="bid-summary-value">1</p>
          <p className="bid-summary-label">Accepted</p>
        </div>
        <div className="bid-summary-card">
          <FiXCircle className="bid-summary-icon rejected-icon" />
          <p className="bid-summary-value">1</p>
          <p className="bid-summary-label">Rejected</p>
        </div>
      </div>

      <div className="bids-full-list">
        {bids.map(bid => (
          <div className="bid-full-card" key={bid.id}>
            <div className="bid-full-top">
              <div className="bid-job-icon">
                <FiBriefcase />
              </div>
              <div className="bid-full-info">
                <h3 className="bid-full-title">{bid.job}</h3>
                <p className="bid-full-client">{bid.client} · <FiClock /> {bid.date}</p>
              </div>
              <div className="bid-full-right">
                <p className="bid-full-amount">{bid.amount}</p>
                {getStatusBadge(bid.status)}
              </div>
            </div>
            <div className="bid-proposal">
              <p className="bid-proposal-label">Your proposal:</p>
              <p className="bid-proposal-text">{bid.proposal}</p>
            </div>
            {bid.status === 'accepted' && (
              <div className="bid-accepted-banner">
                <FiCheckCircle />
                <span>Congratulations! Your bid was accepted. The client will contact you soon.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentBids