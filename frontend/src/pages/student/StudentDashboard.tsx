import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ChatPage from "../../components/Chat/ChatPage";
import NotificationsPopup from "../../components/NotificationsPopup";
import { useRoutePersistence } from "../../hooks/useRoutePersistence";
import {
  FiZap,
  FiHome,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiUser,
  FiLogOut,
  FiBell,
  FiCheckCircle,
  FiArrowRight,
  FiSearch,
  FiClock,
  FiMenu,
  FiX,
  FiSend,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";
import "../../styles/dashboard.css";
import "../../styles/student.css";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [activePage, setActivePage] = useState<string>("home");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [jobs, setJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidProposal, setBidProposal] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string>("");
  const [successBidData, setSuccessBidData] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [jobKeyword, setJobKeyword] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  useRoutePersistence();

  const [statsCards, setStatsCards] = useState([
    { icon: <FiBriefcase />, label: "TOTAL JOBS", value: 0, color: "#1a9c6e" },
    { icon: <FiTrendingUp />, label: "TOTAL BIDS", value: 0, color: "#3b82f6" },
    { icon: <FiBarChart2 />, label: "ACTIVE JOBS", value: 0, color: "#f97316" },
    { icon: <FiDollarSign />, label: "TOTAL EARNED", value: "₦0", color: "#8b5cf6" },
  ]);

  const categoryColors: Record<string, string> = {
    "Web & Software Dev": "#3b82f6",
    "Graphic Design & Branding": "#8b5cf6",
    "Digital Marketing": "#f97316",
    "Writing & Copywriting": "#10b981",
    "AI & Automation": "#06b6d4",
  };

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  const fetchCategories = async () => {
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("category")
      .eq("status", "open");

    if (jobsData && jobsData.length > 0) {
      const categoryCounts: Record<string, number> = {};
      jobsData.forEach((job) => {
        if (job.category) {
          categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
        }
      });

      const categoryList = Object.keys(categoryCounts).map((cat) => ({
        name: cat,
        count: categoryCounts[cat],
        color: categoryColors[cat] || "#1a9c6e",
      }));
      setCategories(categoryList);
    } else {
      setCategories([]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    checkUser();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showBidModal || showSuccessModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showBidModal, showSuccessModal]);

  useEffect(() => {
    if (userId) {
      fetchUnreadMessageCount();
      fetchUnreadNotificationCount();
      const messageSubscription = supabase
        .channel("messages-count")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` }, () => fetchUnreadMessageCount())
        .subscribe();
      const notificationSubscription = supabase
        .channel("notifications-count")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => fetchUnreadNotificationCount())
        .subscribe();
      return () => {
        messageSubscription.unsubscribe();
        notificationSubscription.unsubscribe();
      };
    }
  }, [userId]);

  const fetchUnreadMessageCount = async () => {
    const { data } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);
    setChatUnreadCount(data?.length || 0);
  };

  const fetchUnreadNotificationCount = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(data?.length || 0);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      setUserId(user.id);
      await fetchJobs();
      await fetchMyBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        *,
        client:profiles!jobs_created_by_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (jobsError) {
      setJobs([]);
      setLoading(false);
      return;
    }

    if (jobsData && jobsData.length > 0) {
      setJobs(jobsData);
      
      const totalBids = await fetchTotalBidsCount();
      const totalEarned = await fetchTotalEarned();

      setStatsCards([
        { icon: <FiBriefcase />, label: "TOTAL JOBS", value: jobsData.length, color: "#1a9c6e" },
        { icon: <FiTrendingUp />, label: "TOTAL BIDS", value: totalBids, color: "#3b82f6" },
        { icon: <FiBarChart2 />, label: "ACTIVE JOBS", value: jobsData.filter((j) => j.status === "open").length, color: "#f97316" },
        { icon: <FiDollarSign />, label: "TOTAL EARNED", value: `₦${totalEarned.toLocaleString()}`, color: "#8b5cf6" },
      ]);
    } else {
      setJobs([]);
    }
    setLoading(false);
  };

  const fetchTotalBidsCount = async () => {
    const { count } = await supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("student_id", userId);
    return count || 0;
  };

  const fetchTotalEarned = async () => {
    const { data } = await supabase
      .from("bids")
      .select("amount")
      .eq("student_id", userId)
      .eq("status", "accepted");
    const total = data?.reduce((sum, bid) => sum + (bid.amount || 0), 0) || 0;
    return total;
  };

  const fetchMyBids = async (studentId: string) => {
    if (!studentId) return;

    const { data: bidsData } = await supabase
      .from("bids")
      .select(`*, jobs:job_id (id, title, budget, created_by, description, location, duration, category, client:profiles!jobs_created_by_fkey (id, full_name, email))`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (bidsData && bidsData.length > 0) {
      const enrichedBids = bidsData.map((bid: any) => ({
        ...bid,
        job: bid.jobs ? { ...bid.jobs, client: bid.jobs.client || { full_name: "Client" } } : null,
      }));
      setMyBids(enrichedBids);
    } else {
      setMyBids([]);
    }
  };

  const handleBid = async () => {
    setBidError("");
    if (!bidAmount) { setBidError("Please enter your bid amount"); return; }
    if (!bidProposal) { setBidError("Please write a proposal"); return; }
    const bidAmountNum = parseInt(bidAmount);
    if (bidAmountNum > selectedJob.budget) {
      setBidError(`Your bid cannot exceed the job budget of ${formatBudget(selectedJob.budget)}`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bids").insert([{
      job_id: selectedJob.id,
      student_id: userId,
      amount: bidAmountNum,
      proposal: bidProposal,
      status: "pending",
    }]);
    if (!error) {
      setSuccessBidData({ jobTitle: selectedJob.title, amount: bidAmountNum, clientName: selectedJob.client?.full_name || "the client" });
      setShowBidModal(false);
      setBidAmount("");
      setBidProposal("");
      setShowSuccessModal(true);
      await fetchMyBids(userId);
      await fetchJobs();
      setTimeout(() => setShowSuccessModal(false), 3000);
    } else {
      setBidError(error.message);
    }
    setSubmitting(false);
  };

  const openBidModal = (job: any) => {
    setSelectedJob(job);
    setShowBidModal(true);
    setBidAmount("");
    setBidProposal("");
    setBidError("");
  };

  const handleLogout = async () => {
    localStorage.removeItem('lastRoute');
    sessionStorage.clear();
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(budget);
  };

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "Browse Jobs", key: "jobs" },
    { icon: <FiTrendingUp />, label: "My Bids", key: "bids" },
    { icon: <FiMessageSquare />, label: "Messages", key: "messages", badge: chatUnreadCount.toString() },
    { icon: <FiDollarSign />, label: "Earnings", key: "earnings" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const bottomNavItems = [
    { icon: <FiHome />, label: "Home", key: "home" },
    { icon: <FiBriefcase />, label: "Jobs", key: "jobs" },
    { icon: <FiMessageSquare />, label: "Chat", key: "messages", badge: chatUnreadCount.toString() },
    { icon: <FiDollarSign />, label: "Earn", key: "earnings" },
  ];

  const JobCard = ({ job, onClick, showApplyButton = true, isBid = false, bidStatus = null }: any) => (
    <div className="job-day-card" onClick={onClick}>
      {isBid && bidStatus && (
        <div className={`bid-status-badge ${bidStatus}`}>
          {bidStatus === "accepted" ? "✓ Accepted" : bidStatus === "rejected" ? "✗ Rejected" : "⏳ Pending"}
        </div>
      )}
      <div className="job-day-header">
        <div className="company-badge">
          {job.client?.avatar_url ? (
            <img src={job.client.avatar_url} alt={job.client?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
          ) : (
            job.client?.full_name?.charAt(0).toUpperCase() || "C"
          )}
        </div>
        <div className="company-details">
          <h4>{job.client?.full_name || "Company"}</h4>
          <p><span className="flag">📍</span> {job.location || "Remote"}</p>
        </div>
      </div>
      <h3 className="job-day-title">{job.title}</h3>
      <p className="job-posted"><FiClock /> Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}</p>
      <p className="job-description">{job.description?.substring(0, 100)}...</p>
      <div className="job-day-footer">
        <div className="price"><span className="amount">{formatBudget(job.budget)}</span><span className="unit">/project</span></div>
        {showApplyButton && <button className="apply-btn">Apply Now</button>}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case "jobs":
        const filteredJobs = jobKeyword ? jobs.filter(job => job.title?.toLowerCase().includes(jobKeyword.toLowerCase())) : jobs;
        return (
          <div className="jobs-page">
            <div className="page-header"><h2>Browse All Jobs</h2><p>Find the perfect opportunity for your skills</p></div>
            <div className="search-bar"><FiSearch /><input type="text" placeholder="Search jobs..." value={jobKeyword} onChange={(e) => setJobKeyword(e.target.value)} /></div>
            {loading ? <div className="loading-state">Loading jobs...</div> : filteredJobs.length === 0 ? <div className="empty-state">No jobs available yet</div> : (
              <div className="jobs-day-grid">{filteredJobs.map((job) => <JobCard key={job.id} job={job} onClick={() => openBidModal(job)} />)}</div>
            )}
          </div>
        );
      case "bids":
        return (
          <div className="bids-page">
            <div className="page-header"><h2>My Bids</h2><p>Track all your job proposals</p></div>
            {myBids.length === 0 ? (
              <div className="empty-state"><p>No bids yet. Browse jobs to get started!</p><button className="btn-primary" onClick={() => setActivePage("jobs")}>Browse Jobs</button></div>
            ) : (
              <div className="jobs-day-grid">{myBids.map((bid: any) => <JobCard key={bid.id} job={bid.job} isBid={true} bidStatus={bid.status} showApplyButton={false} />)}</div>
            )}
          </div>
        );
      case "messages":
        return <ChatPage userId={userId} userRole="student" />;
      case "earnings":
        const totalEarned = myBids.filter((b: any) => b.status === "accepted").reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
        return (
          <div className="earnings-page">
            <h2>My Earnings</h2>
            <div className="earnings-card"><div className="total-earned"><span>Total Earned</span><div className="amount">{formatBudget(totalEarned)}</div></div></div>
            <div className="info-card"><FiCheckCircle /><div><h4>How payments work</h4><p>Funds are held in escrow until job completion</p></div></div>
          </div>
        );
      case "profile":
        return (
          <div className="profile-page">
            <div className="profile-card">
              <div className="profile-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  userName?.charAt(0).toUpperCase()
                )}
              </div>
              <h3>{userName}</h3><p>Student</p>
            </div>
            <div className="profile-form"><h3>Personal Information</h3><input type="text" value={userName} disabled /><textarea placeholder="Bio / Skills" rows={3} /><button className="btn-primary">Update Profile</button></div>
          </div>
        );
      default:
        return (
          <div className="student-home">
            <div className="hero-section-kkw">
              <div className="hero-content-kkw">
                <h1>Find your dream jobs in <span className="highlight">Akungba</span></h1>
                <div className="welcome-message">Welcome back, {userName}</div>
                <div className="hero-search-kkw">
                  <div className="search-field-kkw"><FiSearch /><input type="text" placeholder="Job title or keywords" value={jobKeyword} onChange={(e) => setJobKeyword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && setActivePage("jobs")} /></div>
                  <button className="search-btn-kkw" onClick={() => setActivePage("jobs")}>Search</button>
                </div>
              </div>
            </div>
            <div className="stats-cards-section">
              <div className="stats-cards-grid">
                {statsCards.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                    <div className="stat-content"><div className="stat-value">{stat.value}</div><div className="stat-label">{stat.label}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="categories-section-jw">
              <div className="section-header-jw">
                <div><h2>Browse by category</h2><p>Find the job that's perfect for you</p></div>
                <button className="view-all-jw" onClick={() => setActivePage("jobs")}>View all <FiArrowRight /></button>
              </div>
              <div className="categories-grid-jw" ref={categoriesScrollRef}>
                {categories.map((cat, idx) => (
                  <div key={idx} className="category-card-jw" onClick={() => setActivePage("jobs")}>
                    <div className="category-icon-jw" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}><FiBriefcase /></div>
                    <h3>{cat.name}</h3>
                    <p>{cat.count} jobs available</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="jobs-day-section">
              <div className="section-header-jw">
                <div><h2>Recent Jobs</h2><p>Latest opportunities from clients</p></div>
                <button className="view-all-jw" onClick={() => setActivePage("jobs")}>View all jobs <FiArrowRight /></button>
              </div>
              {loading ? <div className="loading-state">Loading jobs...</div> : jobs.length === 0 ? <div className="empty-state small"><p>No jobs available yet. Check back later!</p></div> : (
                <div className="jobs-day-grid">{jobs.slice(0, 6).map((job) => <JobCard key={job.id} job={job} onClick={() => openBidModal(job)} />)}</div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
  <nav className="sidebar-nav">
    {navItems.map((item) => (
      <div
        key={item.key}
        className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
        onClick={() => setActivePage(item.key)}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge && parseInt(item.badge) > 0 && (
          <span className="nav-badge">{item.badge}</span>
        )}
      </div>
    ))}
  </nav>
  <div className="sidebar-bottom">
    <div className="sidebar-profile">
      <div className="sidebar-avatar">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          userName.charAt(0).toUpperCase()
        )}
      </div>
      <div>
        <p className="sidebar-name">{userName}</p>
        <p className="sidebar-role">Student</p>
      </div>
    </div>
    <div className="nav-item logout-item" onClick={handleLogout}>
      <FiLogOut /> <span>Logout</span>
    </div>
  </div>
</aside>

{/* Mobile Drawer */}
<div className={`sidebar-drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
<div className={`sidebar-drawer ${drawerOpen ? "open" : ""}`}>
  <div className="drawer-header-right">
    <button onClick={() => setDrawerOpen(false)} className="drawer-close-btn-right"><FiX /></button>
  </div>
  <nav className="drawer-nav">
    {navItems.map((item) => (
      <div
        key={item.key}
        className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
        onClick={() => { setActivePage(item.key); setDrawerOpen(false); }}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge && parseInt(item.badge) > 0 && (
          <span className="nav-badge">{item.badge}</span>
        )}
      </div>
    ))}
  </nav>
  <div className="drawer-bottom">
    <div className="drawer-profile">
      <div className="drawer-avatar">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          userName.charAt(0).toUpperCase()
        )}
      </div>
      <div>
        <p className="drawer-name">{userName}</p>
        <p className="drawer-role">Student</p>
      </div>
    </div>
    <div className="drawer-logout" onClick={handleLogout}>
      <FiLogOut /> <span>Logout</span>
    </div>
  </div>
</div>

      <div className="main-content-area">
        <div className="topbar-sticky">
          <div className="topbar">
            <div className="topbar-left">{isMobile && <button className="mobile-menu-btn" onClick={() => setDrawerOpen(true)}><FiMenu /></button>}</div>
            <div className="topbar-logo-center"><div className="logo-wrapper" onClick={() => setActivePage("home")}><FiZap className="logo-icon-topbar" /><span className="logo-text-topbar">CampusFreelance</span></div></div>
            <div className="topbar-actions">
              <div className="notification-wrapper"><button className="topbar-notif" onClick={() => setShowNotifications(!showNotifications)}><FiBell />{unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{showNotifications && <NotificationsPopup userId={userId} onClose={() => setShowNotifications(false)} />}</div>
              <div className="profile-avatar-topbar" onClick={() => setActivePage("profile")}>
                <div className="student-topbar-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="scrollable-content">{renderContent()}</div>
      </div>

      {isMobile && (
        <div className="bottom-nav">{bottomNavItems.map((item) => (
          <button key={item.key} className={`bottom-nav-item ${activePage === item.key ? "active" : ""}`} onClick={() => setActivePage(item.key)}>
            {item.icon}<span>{item.label}</span>{item.badge && parseInt(item.badge) > 0 && <span className="bottom-nav-badge">{item.badge}</span>}
          </button>
        ))}</div>
      )}

      {showBidModal && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header"><h2>Place a Bid</h2><button onClick={() => setShowBidModal(false)} className="modal-close"><FiX /></button></div>
            <div className="modal-body">
              <p><strong>Job:</strong> {selectedJob.title}</p><p><strong>Budget:</strong> {formatBudget(selectedJob.budget)}</p>
              {bidError && <div className="error-message">{bidError}</div>}
              <div className="form-group"><label>Your Bid Amount (₦)</label><input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Enter your bid amount" /><small>Maximum: {formatBudget(selectedJob.budget)}</small></div>
              <div className="form-group"><label>Proposal</label><textarea value={bidProposal} onChange={(e) => setBidProposal(e.target.value)} placeholder="Why are you the best fit?" rows={4} /></div>
            </div>
            <div className="modal-footer"><button onClick={handleBid} disabled={submitting} className="btn-primary btn-block">{submitting ? "Submitting..." : "Submit Bid"} <FiSend /></button></div>
          </div>
        </div>
      )}

      {showSuccessModal && successBidData && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="success-icon"><FiCheckCircle /></div>
            <h2>Bid Placed! 🎉</h2><p>Your bid has been submitted to {successBidData.clientName}.</p>
            <div className="bid-summary"><p><strong>Job:</strong> {successBidData.jobTitle}</p><p><strong>Amount:</strong> {formatBudget(successBidData.amount)}</p></div>
            <div className="modal-buttons"><button onClick={() => { setShowSuccessModal(false); setActivePage("bids"); }} className="btn-primary">View My Bids</button><button onClick={() => setShowSuccessModal(false)} className="btn-outline">Continue Browsing</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;