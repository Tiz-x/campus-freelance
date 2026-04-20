import {
  FiDollarSign, FiClock, FiCheckCircle,
  FiArrowUpRight, FiShield
} from 'react-icons/fi'

const transactions = [
  { id: 1, title: 'Logo Design Payment', student: 'Adeola Okonkwo', amount: '₦12,000', status: 'held', date: '2 days ago', type: 'escrow' },
  { id: 2, title: 'Social Media Management', student: 'Funmi Bello', amount: '₦28,000', status: 'released', date: '1 week ago', type: 'released' },
  { id: 3, title: 'Website Development', student: 'Chidi Nwosu', amount: '₦75,000', status: 'released', date: '2 weeks ago', type: 'released' },
  { id: 4, title: 'Product Photography', student: 'Temi Ade', amount: '₦20,000', status: 'pending', date: '1 day ago', type: 'pending' },
]

const SMEPayments = () => {
  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Payments</h1>
          <p className="view-sub">Track all your job payments and escrow</p>
        </div>
      </div>

      {/* PAYMENT STATS */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card stat-green">
          <div className="stat-card-icon"><FiDollarSign /></div>
          <div>
            <p className="stat-card-value">₦135,000</p>
            <p className="stat-card-label">Total Spent</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-card-icon"><FiShield /></div>
          <div>
            <p className="stat-card-value">₦12,000</p>
            <p className="stat-card-label">In Escrow</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-card-icon"><FiCheckCircle /></div>
          <div>
            <p className="stat-card-value">₦103,000</p>
            <p className="stat-card-label">Released</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-card-icon"><FiClock /></div>
          <div>
            <p className="stat-card-value">₦20,000</p>
            <p className="stat-card-label">Pending</p>
          </div>
        </div>
      </div>

      {/* ESCROW INFO */}
      <div className="escrow-info-card">
        <FiShield className="escrow-info-icon" />
        <div>
          <h3>How escrow works</h3>
          <p>When you hire a student, your payment is held securely in escrow. The money is only released to the student when you confirm the work is completed to your satisfaction.</p>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Transaction History</h2>
        </div>
        <div className="transactions-list">
          {transactions.map(tx => (
            <div className="transaction-item" key={tx.id}>
              <div className="tx-icon">
                {tx.type === 'released' ? <FiArrowUpRight className="tx-out" /> :
                  tx.type === 'escrow' ? <FiShield className="tx-hold" /> :
                    <FiClock className="tx-pending" />}
              </div>
              <div className="tx-info">
                <p className="tx-title">{tx.title}</p>
                <p className="tx-sub">{tx.student} · {tx.date}</p>
              </div>
              <div className="tx-right">
                <p className="tx-amount">{tx.amount}</p>
                {tx.status === 'held' && <span className="badge badge-blue">In Escrow</span>}
                {tx.status === 'released' && <span className="badge badge-green">Released</span>}
                {tx.status === 'pending' && <span className="badge badge-gray">Pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SMEPayments