import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
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
  FiMenu,
  FiX,
  FiCheck,
} from "react-icons/fi";
import "../../styles/dashboard.css";
import SMEJobs from "./views/SMEJobs";
import SMEMessages from "./views/SMEMessages";
import SMEPayments from "./views/SMEPayments";
import SMEProfile from "./views/SMEProfile";
import SMEStudents from "./views/SMEStudents";

const SMEDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [activePage, setActivePage] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dashboardData, setDashboardData] = useState({
    stats: [
      { icon: <FiBriefcase />, label: "Active Jobs", value: "3", color: "stat-green" },
      { icon: <FiUsers />, label: "Total Bids", value: "12", color: "stat-blue" },
      { icon: <FiCheckCircle />, label: "Completed", value: "8", color: "stat-purple" },
      { icon: <FiDollarSign />, label: "Total Spent", value: "₦120,000", color: "stat-orange" },
    ],
    recentBids: [
      { id: 1, student: "Adeola Okonkwo", job: "Logo Design", amount: "₦12,000", avatar: "AO", rating: 4.8, reviews: 12, completedJobs: 24 },
      { id: 2, student: "Chidi Nwosu", job: "Website Design", amount: "₦14,000", avatar: "CN", rating: 4.5, reviews: 8, completedJobs: 15 },
      { id: 3, student: "Funmi Bello", job: "Social Media Manager", amount: "₦28,000", avatar: "FB", rating: 5.0, reviews: 20, completedJobs: 42 },
    ]
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle navigation with progress bar
  const handleNavClick = (key: string) => {
    startLoading();
    setActivePage(key);
    setDrawerOpen(false);
    setTimeout(() => {
      stopLoading();
    }, 300);
  };

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "My Jobs", key: "jobs" },
    { icon: <FiUsers />, label: "Browse Students", key: "students" },
    { icon: <FiMessageSquare />, label: "Messages", key: "messages", badge: "3" },
    { icon: <FiDollarSign />, label: "Payments", key: "payments" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const bottomNavItems = [
    { icon: <FiHome />, label: "Home", key: "home" },
    { icon: <FiBriefcase />, label: "Jobs", key: "jobs" },
    { icon: <FiMessageSquare />, label: "Chat", key: "messages" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
    { icon: <FiDollarSign />, label: "Pay", key: "payments" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "jobs": return <SMEJobs />;
      case "students": return <SMEStudents />;
      case "messages": return <SMEMessages />;
      case "payments": return <SMEPayments />;
      case "profile": return <SMEProfile />;
      default:
        return (
          <>
            <div className="stats-grid">
              {dashboardData.stats.map((stat, i) => (
                <div className={`stat-card ${stat.color}`} key={i}>
                  <div className="stat-card-icon">{stat.icon}</div>
                  <div className="stat-info">
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-header">
              <h2 className="section-title">Recent Bids</h2>
              <button className="view-all-link" onClick={() => handleNavClick("jobs")}>
                View all <FiArrowRight size={14} />
              </button>
            </div>

            <div className="bidders-grid">
              {dashboardData.recentBids.map((bid) => (
                <div className="bidder-card" key={bid.id}>
                  <div className="bidder-header">
                    <div className="bidder-avatar">{bid.avatar}</div>
                    <div className="bidder-details">
                      <p className="bidder-name">{bid.student}</p>
                      <span className="bidder-job">{bid.job}</span>
                    </div>
                  </div>
                  <div className="bidder-stats">
                    <div className="bidder-rating">
                      <FiStar className="star" />
                      <span className="rating-score">{bid.rating}</span>
                      <span className="review-count">({bid.reviews})</span>
                    </div>
                    <div className="bidder-completed">
                      <FiCheck size={12} />
                      <span className="completed-count">{bid.completedJobs}</span>
                      <span>jobs done</span>
                    </div>
                  </div>
                  <div className="bidder-footer">
                    <div className="bid-price">
                      <span className="price-amount">{bid.amount}</span>
                      <span className="price-label">Budget</span>
                    </div>
                    <div className="bidder-actions">
                      <button className="chat-btn" onClick={() => handleNavClick("messages")}>
                        <FiMessageSquare size={12} /> Chat
                      </button>
                      <button className="hire-btn">Hire</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <div className="quick-action-card" onClick={() => navigate("/post-job")}>
                <div className="quick-action-icon qa-green"><FiPlus /></div>
                <p>Post Job</p>
              </div>
              <div className="quick-action-card" onClick={() => handleNavClick("students")}>
                <div className="quick-action-icon qa-blue"><FiUsers /></div>
                <p>Browse Students</p>
              </div>
              <div className="quick-action-card" onClick={() => handleNavClick("payments")}>
                <div className="quick-action-icon qa-purple"><FiTrendingUp /></div>
                <p>Payments</p>
              </div>
              <div className="quick-action-card" onClick={() => handleNavClick("messages")}>
                <div className="quick-action-icon qa-orange"><FiMessageSquare /></div>
                <p>Messages</p>
              </div>
            </div>
          </>
        );
    }
  };

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <FiZap className="logo-icon" />
        <span>CampusFreelance</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
            onClick={() => handleNavClick(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
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
        <div className="nav-item logout-item" onClick={async () => {
          startLoading();
          await signOut();
          stopLoading();
          navigate("/login");
        }}>
          <FiLogOut /> <span>Logout</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="dashboard">
      <aside className="sidebar"><SidebarContent /></aside>

      <div className={`sidebar-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`sidebar-drawer ${drawerOpen ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
          <button onClick={() => setDrawerOpen(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <FiX />
          </button>
        </div>
        <SidebarContent />
      </div>

      <main className="dashboard-main">
        <div className="topbar">
          <div className="topbar-left">
            {isMobile && (
              <button className="mobile-menu-btn" onClick={() => setDrawerOpen(true)}>
                <FiMenu />
              </button>
            )}
            <div className="greeting">
              <h1>Good morning, Bola 👋</h1>
              <p>Here's what's happening with your jobs today</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="notification-btn">
              <FiBell />
              <span className="notification-badge"></span>
            </button>
            <button className="post-job-btn" onClick={() => navigate("/post-job")}>
              <FiPlus /> <span>Post a Job</span>
            </button>
          </div>
        </div>
        {renderContent()}
      </main>

      {isMobile && (
        <div className="bottom-nav">
          {bottomNavItems.map((item) => (
            <button
              key={item.key}
              className={`bottom-nav-item ${activePage === item.key ? "active" : ""}`}
              onClick={() => handleNavClick(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SMEDashboard;