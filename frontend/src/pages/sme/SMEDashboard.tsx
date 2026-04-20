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
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import "../../styles/dashboard.css";
import SMEJobs from "./views/SMEJobs";
import SMEMessages from "./views/SMEMessages";
import SMEPayments from "./views/SMEPayments";
import SMEProfile from "./views/SMEProfile";
import SMEStudents from "./views/SMEStudents";

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

  const renderContent = () => {
    switch (activePage) {
      case "jobs":
        return <SMEJobs />;
      case "students":
        return <SMEStudents />;
      case "messages":
        return <SMEMessages />;
      case "payments":
        return <SMEPayments />;
      case "profile":
        return <SMEProfile />;
      default:
        return (
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
              <h2 className="section-title">Recent Bids</h2>
              <button
                className="card-link"
                onClick={() => setActivePage("jobs")}
              >
                View all jobs <FiArrowRight />
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
                    <span className="rating-count">
                      ({bid.reviews} reviews)
                    </span>
                  </div>
                  <div className="bidder-footer">
                    <span className="bidder-amount">{bid.amount}</span>
                    <div className="bidder-actions">
                      <button
                        className="btn-outline btn-small"
                        onClick={() => setActivePage("messages")}
                      >
                        Message
                      </button>
                      <button className="btn-primary btn-small">Hire</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <div
                className="quick-action"
                onClick={() => navigate("/post-job")}
              >
                <div className="quick-action-icon qa-green">
                  <FiPlus />
                </div>
                <p>Post a new job</p>
              </div>
              <div
                className="quick-action"
                onClick={() => setActivePage("students")}
              >
                <div className="quick-action-icon qa-blue">
                  <FiUsers />
                </div>
                <p>Browse students</p>
              </div>
              <div
                className="quick-action"
                onClick={() => setActivePage("payments")}
              >
                <div className="quick-action-icon qa-purple">
                  <FiTrendingUp />
                </div>
                <p>View payments</p>
              </div>
              <div
                className="quick-action"
                onClick={() => setActivePage("messages")}
              >
                <div className="quick-action-icon qa-orange">
                  <FiMessageSquare />
                </div>
                <p>Messages</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard">
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

      <main className="dashboard-main">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">
              {activePage === "home" && "Good morning, Bola 👋"}
              {activePage === "jobs" && "My Jobs"}
              {activePage === "students" && "Browse Students"}
              {activePage === "messages" && "Messages"}
              {activePage === "payments" && "Payments"}
              {activePage === "profile" && "My Profile"}
            </h1>
            <p className="topbar-sub">
              {activePage === "home" &&
                "Here's what's happening with your jobs today"}
              {activePage === "jobs" && "Manage all your posted jobs"}
              {activePage === "students" &&
                "Find the right student for your job"}
              {activePage === "messages" && "Chat with students"}
              {activePage === "payments" && "Track your payments and escrow"}
              {activePage === "profile" && "Manage your business profile"}
            </p>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            {activePage === "home" && (
              <button
                className="btn-primary post-job-btn"
                onClick={() => navigate("/post-job")}
              >
                <FiPlus /> Post a Job
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default SMEDashboard;
