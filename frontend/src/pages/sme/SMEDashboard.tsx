import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiZap,
  FiHome,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiUser,
  FiLogOut,
  FiBell,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
  FiEdit,
  FiEye,
  FiStar,
} from "react-icons/fi";
import "../../styles/dashboard.css";

const SMEDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");

  const stats = [
    {
      icon: <FiBriefcase />,
      label: "Active Jobs",
      value: "3",
      color: "stat-green",
    },
    { icon: <FiUsers />, label: "Total Bids", value: "12", color: "stat-blue" },
    {
      icon: <FiCheckCircle />,
      label: "Completed",
      value: "8",
      color: "stat-purple",
    },
    {
      icon: <FiDollarSign />,
      label: "Total Spent",
      value: "₦120,000",
      color: "stat-orange",
    },
  ];

  const myJobs = [
    {
      id: 1,
      title: "Logo Design for my bakery",
      description:
        "Looking for a creative student to design a modern, clean logo for my bakery business.",
      budget: "₦15,000",
      category: "Graphic Design",
      bids: 4,
      status: "open",
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Social media management",
      description:
        "Need someone to manage my Instagram and Facebook pages, create content and grow my audience.",
      budget: "₦30,000",
      category: "Digital Marketing",
      bids: 7,
      status: "in_progress",
      date: "5 days ago",
    },
    {
      id: 3,
      title: "Website for my restaurant",
      description:
        "Build a simple but professional website for my restaurant with menu and contact page.",
      budget: "₦75,000",
      category: "Web Development",
      bids: 2,
      status: "completed",
      date: "2 weeks ago",
    },
    {
      id: 4,
      title: "Product photography",
      description:
        "Professional photos of my fashion products for my online store.",
      budget: "₦20,000",
      category: "Photography",
      bids: 5,
      status: "open",
      date: "1 day ago",
    },
  ];

  const recentBids = [
    {
      id: 1,
      student: "Adeola Okonkwo",
      job: "Logo Design",
      amount: "₦12,000",
      avatar: "AO",
      rating: 4.8,
      reviews: 12,
    },
    {
      id: 2,
      student: "Chidi Nwosu",
      job: "Logo Design",
      amount: "₦14,000",
      avatar: "CN",
      rating: 4.5,
      reviews: 8,
    },
    {
      id: 3,
      student: "Funmi Bello",
      job: "Social Media",
      amount: "₦28,000",
      avatar: "FB",
      rating: 5.0,
      reviews: 20,
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "open")
      return <span className="badge badge-green">Open</span>;
    if (status === "in_progress")
      return <span className="badge badge-blue">In Progress</span>;
    if (status === "completed")
      return <span className="badge badge-gray">Completed</span>;
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { icon: <FiHome />, label: "Dashboard", key: "home" },
            { icon: <FiBriefcase />, label: "My Jobs", key: "jobs" },
            { icon: <FiUsers />, label: "Browse Students", key: "students" },
            {
              icon: <FiMessageSquare />,
              label: "Messages",
              key: "messages",
              badge: "3",
            },
            { icon: <FiDollarSign />, label: "Payments", key: "payments" },
            { icon: <FiUser />, label: "Profile", key: "profile" },
          ].map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
              onClick={() => setActivePage(item.key)}
            >
              {item.icon} <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">BA</div>
            <div>
              <p className="sidebar-name">Bola Adeyemi</p>
              <p className="sidebar-role">SME Account</p>
            </div>
          </div>
          <div className="nav-item logout-item" onClick={() => navigate("/")}>
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
            <p className="topbar-sub">
              Here's what's happening with your jobs today
            </p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            <button
              className="btn-primary post-job-btn"
              onClick={() => navigate("/post-job")}
            >
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

        {/* MY JOBS - CARD GRID */}
        <div className="section-header">
          <h2 className="section-title">My Jobs</h2>
          <button className="card-link" onClick={() => navigate("/post-job")}>
            <FiPlus /> Post new job
          </button>
        </div>

        <div className="jobs-card-grid">
          {myJobs.map((job) => (
            <div className="job-card" key={job.id}>
              <div className="job-card-top">
                <div className="job-card-category">{job.category}</div>
                {getStatusBadge(job.status)}
              </div>
              <h3 className="job-card-title">{job.title}</h3>
              <p className="job-card-desc">{job.description}</p>
              <div className="job-card-meta">
                <span>
                  <FiClock /> {job.date}
                </span>
                <span>
                  <FiUsers /> {job.bids} bids
                </span>
              </div>
              <div className="job-card-footer">
                <span className="job-card-budget">{job.budget}</span>
                <div className="job-card-actions">
                  <button className="icon-btn">
                    <FiEye />
                  </button>
                  <button className="icon-btn">
                    <FiEdit />
                  </button>
                  <button className="btn-primary btn-small">View Bids</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT BIDS */}
        <div className="section-header">
          <h2 className="section-title">Recent Bids</h2>
          <button className="card-link">
            View all <FiArrowRight />
          </button>
        </div>

        <div className="bidders-grid">
          {recentBids.map((bid) => (
            <div className="bidder-card" key={bid.id}>
              <div className="bidder-top">
                <div className="bidder-avatar">{bid.avatar}</div>
                <div>
                  <p className="bidder-name">{bid.student}</p>
                  <p className="bidder-job">{bid.job}</p>
                </div>
              </div>
              <div className="bidder-rating">
                <FiStar className="star" />
                <span>{bid.rating}</span>
                <span className="rating-count">({bid.reviews} reviews)</span>
              </div>
              <div className="bidder-footer">
                <span className="bidder-amount">{bid.amount}</span>
                <div className="bidder-actions">
                  <button className="btn-outline btn-small">Message</button>
                  <button className="btn-primary btn-small">Hire</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SMEDashboard;
