import {
  FiDollarSign, FiTrendingUp, FiClock,
  FiCheckCircle, FiArrowUpRight
} from 'react-icons/fi'

const earnings = [
  { id: 1, job: 'Instagram page management', client: 'Temi Fashion', amount: '₦25,000', date: '3 days ago', status: 'received' },
  { id: 2, job: 'Logo design for school', client: 'AAUA SUG', amount: '₦15,000', date: '1 week ago', status: 'received' },
  { id: 3, job: 'Website landing page', client: 'Kunle Ventures', amount: '₦35,000', date: '2 weeks ago', status: 'received' },
  { id: 4, job: 'Social media content', client: 'Shade Stores', amount: '₦10,000', date: '3 weeks ago', status: 'received' },
]

const StudentEarnings = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">My Earnings</h1>
          <p className="view-sub">Track all your payments</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-green">
          <div className="stat-card-icon"><FiDollarSign /></div>
          <div>
            <p className="stat-card-value">₦85,000</p>
            <p className="stat-card-label">Total Earned</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-card-icon"><FiClock /></div>
          <div>
            <p className="stat-card-value">₦25,000</p>
            <p className="stat-card-label">In Escrow</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-card-icon"><FiTrendingUp /></div>
          <div>
            <p className="stat-card-value">₦45,000</p>
            <p className="stat-card-label">This Month</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-card-icon"><FiCheckCircle /></div>
          <div>
            <p className="stat-card-value">5</p>
            <p className="stat-card-label">Jobs Completed</p>
          </div>
        </div>
      </div>

      <div className="escrow-info-card">
        <FiClock className="escrow-info-icon" />
        <div>
          <h3>Your escrow balance</h3>
          <p>You have ₦25,000 held in escrow for an active job. This will be released to you once the client confirms the work is completed.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2>Payment History</h2>
        </div>
        <div className="transactions-list">
          {earnings.map(e => (
            <div className="transaction-item" key={e.id}>
              <div className="tx-icon">
                <FiArrowUpRight className="tx-out" />
              </div>
              <div className="tx-info">
                <p className="tx-title">{e.job}</p>
                <p className="tx-sub">{e.client} · {e.date}</p>
              </div>
              <div className="tx-right">
                <p className="tx-amount">{e.amount}</p>
                <span className="badge badge-green">Received</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentEarnings