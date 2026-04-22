import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ChatPage from "../../components/Chat/ChatPage";
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
  FiTrendingUp,
  FiArrowRight,
  FiStar,
  FiSearch,
  FiBookmark,
  FiClock,
  FiMapPin,
  FiUsers,
  FiMenu,
  FiX,
  FiSend,
} from "react-icons/fi";
import "../../styles/dashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [jobs, setJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bidError, setBidError] = useState("");
  const [successBidData, setSuccessBidData] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    
    checkUser();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      setUserId(user.id);
      fetchJobs();
      fetchMyBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const fetchMyBids = async (studentId: string) => {
    if (!studentId) return;
    
    const { data, error } = await supabase
      .from('bids')
      .select('*, jobs(title, budget)')
      .eq('student_id', studentId);

    if (error) {
      console.error("Error fetching bids:", error);
    } else {
      setMyBids(data || []);
    }
  };

  const handleBid = async () => {
    setBidError("");
    setErrorMessage("");
    
    if (!bidAmount) {
      setBidError("Please enter your bid amount");
      return;
    }
    
    if (!bidProposal) {
      setBidError("Please write a proposal");
      return;
    }
    
    const bidAmountNum = parseInt(bidAmount);
    const jobBudget = selectedJob.budget;
    
    if (bidAmountNum > jobBudget) {
      setBidError(`Your bid (₦${bidAmountNum.toLocaleString()}) cannot exceed the job budget (₦${jobBudget.toLocaleString()})`);
      return;
    }
    
    if (bidAmountNum <= 0) {
      setBidError("Please enter a valid bid amount");
      return;
    }

    setSubmitting(true);

    const bidData = {
      job_id: selectedJob.id,
      student_id: userId,
      amount: bidAmountNum,
      proposal: bidProposal,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('bids')
      .insert([bidData])
      .select();

    if (error) {
      console.error("Error placing bid:", error);
      setErrorMessage(error.message);
    } else {
      setSuccessBidData({
        jobTitle: selectedJob.title,
        amount: bidAmountNum,
        proposal: bidProposal,
      });
      setShowBidModal(false);
      setBidAmount("");
      setBidProposal("");
      setBidError("");
      setShowSuccessModal(true);
      
      if (userId) {
        fetchMyBids(userId);
      }
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
    setSubmitting(false);
  };

  const openBidModal = (job: any) => {
    setSelectedJob(job);
    setShowBidModal(true);
    setBidAmount("");
    setBidProposal("");
    setBidError("");
    setErrorMessage("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(budget);
  };

  const stats = [
    { icon: <FiBriefcase />, label: "Active Jobs", value: jobs.length.toString(), color: "stat-green" },
    { icon: <FiCheckCircle />, label: "My Bids", value: myBids.length.toString(), color: "stat-purple" },
    { icon: <FiDollarSign />, label: "Total Earned", value: "₦0", color: "stat-orange" },
    { icon: <FiStar />, label: "My Rating", value: "0", color: "stat-blue" },
  ];

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "Browse Jobs", key: "jobs" },
    { icon: <FiTrendingUp />, label: "My Bids", key: "bids" },
    { icon: <FiMessageSquare />, label: "Messages", key: "messages", badge: "0" },
    { icon: <FiDollarSign />, label: "Earnings", key: "earnings" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const bottomNavItems = [
    { icon: <FiHome />, label: "Home", key: "home" },
    { icon: <FiBriefcase />, label: "Jobs", key: "jobs" },
    { icon: <FiMessageSquare />, label: "Chat", key: "messages", badge: "0" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
    { icon: <FiDollarSign />, label: "Earn", key: "earnings" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "jobs":
        return (
          <>
            <div className="section-header">
              <h2 className="section-title">All Available Jobs</h2>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
                <p>No jobs available yet. Check back later!</p>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <span className="job-card-category">{job.category}</span>
                      <button className="bookmark-btn"><FiBookmark /></button>
                    </div>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-desc">{job.description?.substring(0, 100)}...</p>
                    <div className="job-card-meta">
                      <span><FiClock /> {job.duration || "Not specified"}</span>
                      <span><FiMapPin /> {job.location || "Remote"}</span>
                      <span><FiUsers /> 0 bids</span>
                    </div>
                    <div className="job-card-footer">
                      <span className="job-card-budget">{formatBudget(job.budget)}</span>
                      <button className="btn-primary btn-small" onClick={() => openBidModal(job)}>Bid Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case "bids":
        return (
          <>
            <div className="section-header">
              <h2 className="section-title">My Bids</h2>
            </div>
            {myBids.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
                <p>You haven't placed any bids yet.</p>
                <button className="btn-primary" onClick={() => setActivePage("jobs")} style={{ marginTop: "1rem" }}>
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="my-bids-grid">
                {myBids.map((bid) => (
                  <div className="bidder-card" key={bid.id}>
                    <div className="bidder-header">
                      <div className="bidder-avatar">💰</div>
                      <div className="bidder-details">
                        <p className="bidder-name">{bid.jobs?.title || "Job"}</p>
                        <span className="bidder-job">Bid Amount: {formatBudget(bid.amount)}</span>
                      </div>
                    </div>
                    <div className="bidder-stats">
                      <div className="bidder-rating">
                        <span className="rating-value">Status: </span>
                        <span className={`review-count ${bid.status === 'pending' ? 'pending' : bid.status === 'accepted' ? 'accepted' : 'rejected'}`}>
                          {bid.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="bidder-footer">
                      <div className="bid-price">
                        <span className="price-label">Proposal:</span>
                        <span className="price-amount" style={{ fontSize: "0.8rem", fontWeight: "normal" }}>{bid.proposal?.substring(0, 100)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case "messages":
        return (
          <ChatPage 
            userId={userId} 
            userRole="student"
          />
        );
      case "earnings":
        return <div style={{ padding: "2rem", textAlign: "center" }}>Earnings - Coming Soon!</div>;
      case "profile":
        return <div style={{ padding: "2rem", textAlign: "center" }}>Profile - Coming Soon!</div>;
      default:
        return (
          <>
            <div className="stats-grid">
              {stats.map((stat, i) => (
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
              <h2 className="section-title">Available Jobs</h2>
              <button className="card-link" onClick={() => setActivePage("jobs")}>
                Browse all jobs <FiArrowRight />
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
                <p>No jobs available yet. Check back later!</p>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.slice(0, 3).map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <span className="job-card-category">{job.category}</span>
                      <button className="bookmark-btn"><FiBookmark /></button>
                    </div>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-desc">{job.description?.substring(0, 100)}...</p>
                    <div className="job-card-meta">
                      <span><FiClock /> {job.duration || "Not specified"}</span>
                      <span><FiMapPin /> {job.location || "Remote"}</span>
                      <span><FiUsers /> 0 bids</span>
                    </div>
                    <div className="job-card-footer">
                      <span className="job-card-budget">{formatBudget(job.budget)}</span>
                      <button className="btn-primary btn-small" onClick={() => openBidModal(job)}>Bid Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <div className="quick-action-card" onClick={() => setActivePage("jobs")}>
                <div className="quick-action-icon qa-green"><FiSearch /></div>
                <p>Browse jobs</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("bids")}>
                <div className="quick-action-icon qa-blue"><FiTrendingUp /></div>
                <p>My bids</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("earnings")}>
                <div className="quick-action-icon qa-purple"><FiDollarSign /></div>
                <p>My earnings</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("messages")}>
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
            onClick={() => setActivePage(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div>
            <p className="sidebar-name">{userName}</p>
            <p className="sidebar-role">Student · Verified ✓</p>
          </div>
        </div>
        <div className="nav-item logout-item" onClick={handleLogout}>
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
          <button onClick={() => setDrawerOpen(false)} className="drawer-close-btn">
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
              <h1>
                {activePage === "home" && `Welcome back, ${userName} 👋`}
                {activePage === "jobs" && "Browse Jobs"}
                {activePage === "bids" && "My Bids"}
                {activePage === "messages" && "Messages"}
                {activePage === "earnings" && "My Earnings"}
                {activePage === "profile" && "My Profile"}
              </h1>
              <p>
                {activePage === "home" && `You have ${jobs.length} new job matches today`}
                {activePage === "jobs" && "Find the perfect job for your skills"}
                {activePage === "bids" && "Track all your proposals"}
                {activePage === "messages" && "Chat with your clients"}
                {activePage === "earnings" && "Track all your payments"}
                {activePage === "profile" && "Manage your student profile"}
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-notif">
              <FiBell />
              <span className="notif-dot"></span>
            </button>
            <div className="student-topbar-avatar">{userName.charAt(0).toUpperCase()}</div>
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
              onClick={() => setActivePage(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && <span className="bottom-nav-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedJob && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "500px",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>Place a Bid</h2>
              <button onClick={() => setShowBidModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                <FiX />
              </button>
            </div>
            
            <p><strong>Job:</strong> {selectedJob.title}</p>
            <p><strong>Job Budget:</strong> {formatBudget(selectedJob.budget)}</p>
            
            {bidError && (
              <div style={{ background: "#f8d7da", color: "#721c24", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                {bidError}
              </div>
            )}
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Your Bid Amount (₦)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter your bid amount"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
              <small style={{ color: "#666", display: "block", marginTop: "0.25rem" }}>
                Maximum allowed: {formatBudget(selectedJob.budget)}
              </small>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Proposal / Cover Letter</label>
              <textarea
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
                placeholder="Why are you the best fit for this job?"
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={handleBid}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: submitting ? "#ccc" : "#1a9c6e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {submitting ? "Submitting..." : "Submit Bid"} <FiSend />
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successBidData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}>
          <div style={{
            background: "white",
            borderRadius: "24px",
            width: "90%",
            maxWidth: "400px",
            padding: "2rem",
            textAlign: "center",
          }}>
            <div style={{
              width: "70px",
              height: "70px",
              background: "#1a9c6e",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}>
              <FiCheckCircle style={{ color: "white", fontSize: "2.5rem" }} />
            </div>
            
            <h2 style={{ color: "#0a0b1e", marginBottom: "0.5rem" }}>Bid Placed Successfully! 🎉</h2>
            <p style={{ color: "#6c757d", marginBottom: "1rem" }}>
              Your bid has been submitted to the client.
            </p>
            
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Job:</strong> {successBidData.jobTitle}
              </p>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Your Bid:</strong> {formatBudget(successBidData.amount)}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Proposal:</strong> {successBidData.proposal.substring(0, 100)}...
              </p>
            </div>
            
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setActivePage("bids");
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#1a9c6e",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "0.75rem",
              }}
            >
              View My Bids
            </button>
            
            <button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "transparent",
                color: "#1a9c6e",
                border: "1px solid #1a9c6e",
                borderRadius: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;