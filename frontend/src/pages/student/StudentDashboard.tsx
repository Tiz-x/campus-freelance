import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ChatPage from "../../components/Chat/ChatPage";
import NotificationsPopup from "../../components/NotificationsPopup";
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
    FiChevronLeft, 
  FiChevronRight,
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
  FiMessageCircle,
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
  const [bidError, setBidError] = useState("");
  const [successBidData, setSuccessBidData] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)


  useEffect(() => {
  if (userId) {
    fetchProfile();
  }
}, [userId]);

const fetchProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (!error && data) {
    setProfileData(data);
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

  // Fetch unread message count for badge
  useEffect(() => {
    if (userId) {
      fetchUnreadMessageCount();
      fetchUnreadNotificationCount();

      const messageSubscription = supabase
        .channel("messages-count")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${userId}`,
          },
          () => {
            fetchUnreadMessageCount();
          },
        )
        .subscribe();

      const notificationSubscription = supabase
        .channel("notifications-count")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchUnreadNotificationCount();
          },
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
        notificationSubscription.unsubscribe();
      };
    }
  }, [userId]);

  const fetchUnreadMessageCount = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (!error) {
      setChatUnreadCount(data?.length || 0);
    }
  };

  const fetchUnreadNotificationCount = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) {
      setUnreadCount(data?.length || 0);
    }
  };

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserName(
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      );
      setUserId(user.id);
      setUserEmail(user.email || "");
      fetchJobs();
      fetchMyBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      setJobs([]);
      setLoading(false);
      return;
    }

    if (!jobsData || jobsData.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const clientIds = [...new Set(jobsData.map((job) => job.created_by))];

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", clientIds);

    const profileMapTemp: Record<string, any> = {};
    profilesData?.forEach((profile) => {
      profileMapTemp[profile.id] = profile;
    });

    const jobsWithClients = jobsData.map((job) => ({
      ...job,
      client: profileMapTemp[job.created_by] || { full_name: "Client" },
    }));

    setJobs(jobsWithClients);
    setLoading(false);
  };

  const fetchMyBids = async (studentId: string) => {
    if (!studentId) return;

    // Get accepted bids
    const { data: bidsData, error: bidsError } = await supabase
      .from("bids")
      .select("*, jobs(id, title, budget, created_by)")
      .eq("student_id", studentId)
      .eq("status", "accepted");

    if (bidsError) {
      console.error("Error fetching bids:", bidsError);
      setMyBids([]);
      return;
    }

    console.log("Accepted bids for student:", bidsData);

    if (!bidsData || bidsData.length === 0) {
      setMyBids([]);
      return;
    }

    // Get client profiles
    const clientIds = [...new Set(bidsData.map((bid) => bid.jobs?.created_by))];

    const { data: clientProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", clientIds);

    const clientMap: Record<string, any> = {};
    clientProfiles?.forEach((profile) => {
      clientMap[profile.id] = profile;
    });

    const bidsWithDetails = bidsData.map((bid) => ({
      ...bid,
      job: bid.jobs
        ? {
            ...bid.jobs,
            client: clientMap[bid.jobs.created_by] || { full_name: "Client" },
          }
        : null,
    }));

    console.log("Bids with client details:", bidsWithDetails);
    setMyBids(bidsWithDetails);
  };

  const handleBid = async () => {
    setBidError("");

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
      setBidError(
        `Your bid (₦${bidAmountNum.toLocaleString()}) cannot exceed the job budget (₦${jobBudget.toLocaleString()})`,
      );
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
      status: "pending",
    };

    const { error } = await supabase.from("bids").insert([bidData]);

    if (error) {
      console.error("Error placing bid:", error);
      setBidError(error.message);
    } else {
      setSuccessBidData({
        jobTitle: selectedJob.title,
        amount: bidAmountNum,
        proposal: bidProposal,
        clientName: selectedJob.client?.full_name || "the client",
      });
      setShowBidModal(false);
      setBidAmount("");
      setBidProposal("");
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
  };

  const goToChat = (clientId: string, clientName: string) => {
    if (!clientId) {
      alert("Cannot start chat: Client information missing");
      return;
    }
    sessionStorage.setItem(
      "selectedChatUser",
      JSON.stringify({
        id: clientId,
        full_name: clientName || "Client",
      }),
    );
    setActivePage("messages");
    fetchUnreadMessageCount();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(budget);
  };

  const stats = [
    {
      icon: <FiBriefcase />,
      label: "Active Jobs",
      value: jobs.length.toString(),
      color: "stat-green",
    },
    {
      icon: <FiCheckCircle />,
      label: "My Bids",
      value: myBids.length.toString(),
      color: "stat-purple",
    },
    {
      icon: <FiDollarSign />,
      label: "Total Earned",
      value: "₦0",
      color: "stat-orange",
    },
    { icon: <FiStar />, label: "My Rating", value: "0", color: "stat-blue" },
  ];

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "Browse Jobs", key: "jobs" },
    { icon: <FiTrendingUp />, label: "My Bids", key: "bids" },
    {
      icon: <FiMessageSquare />,
      label: "Messages",
      key: "messages",
      badge: chatUnreadCount.toString(),
    },
    { icon: <FiDollarSign />, label: "Earnings", key: "earnings" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const bottomNavItems = [
    { icon: <FiHome />, label: "Home", key: "home" },
    { icon: <FiBriefcase />, label: "Jobs", key: "jobs" },
    {
      icon: <FiMessageSquare />,
      label: "Chat",
      key: "messages",
      badge: chatUnreadCount.toString(),
    },
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
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "white",
                  borderRadius: "16px",
                }}
              >
                <p>No jobs available yet. Check back later!</p>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.map((job) => (
                  <div className="job-card" key={job.id}>
  <div className="job-card-image" />
  <div className="job-card-body">
    <div className="job-card-top">
      <span className="job-card-category">{job.category}</span>
      <button className="bookmark-btn"><FiBookmark /></button>
    </div>
    <h3 className="job-card-title">{job.title}</h3>
    <p className="job-card-desc">{job.description?.substring(0, 100)}...</p>
    <div className="job-card-meta">
      <span><FiClock /> {job.duration || 'Not specified'}</span>
      <span><FiMapPin /> {job.location || 'Remote'}</span>
      <span><FiUsers /> 0 bids</span>
    </div>
    <div className="job-card-client">
      <div className="client-avatar">{job.client?.full_name?.charAt(0).toUpperCase() || 'C'}</div>
      <span className="client-name">Posted by: {job.client?.full_name || 'Client'}</span>
    </div>
    <div className="job-card-footer">
      <span className="job-card-budget">{formatBudget(job.budget)}</span>
      <button className="btn-primary btn-small" onClick={() => openBidModal(job)}>Bid Now</button>
    </div>
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
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "white",
                  borderRadius: "16px",
                }}
              >
                <p>You haven't placed any bids yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => setActivePage("jobs")}
                  style={{ marginTop: "1rem" }}
                >
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
                        <p className="bidder-name">{bid.job?.title || "Job"}</p>
                        <span className="bidder-job">
                          Bid Amount: {formatBudget(bid.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="bidder-stats">
                      <div className="bidder-rating">
                        <span className="rating-value">Status: </span>
                        <span
                          className={`review-count ${bid.status === "pending" ? "pending" : bid.status === "accepted" ? "accepted" : "rejected"}`}
                        >
                          {bid.status === "pending"
                            ? "Pending"
                            : bid.status === "accepted"
                              ? "✓ Accepted!"
                              : "✗ Rejected"}
                        </span>
                      </div>
                    </div>
                    <div className="bidder-footer">
                      <div className="bid-price">
                        <span className="price-label">Proposal:</span>
                        <span
                          className="price-amount"
                          style={{ fontSize: "0.8rem", fontWeight: "normal" }}
                        >
                          {bid.proposal?.substring(0, 100)}
                        </span>
                      </div>
                      {bid.status === "accepted" && (
                        <div className="bidder-actions">
                          <button
                            className="btn-primary btn-small"
                            onClick={() =>
                              goToChat(
                                bid.job?.created_by,
                                bid.job?.client?.full_name,
                              )
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <FiMessageCircle /> Message Client
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case "messages":
        return <ChatPage userId={userId} userRole="student" />;
      case "earnings":
  return (
    <div className="earnings-page">
      <div className="section-header">
        <h2 className="section-title">My Earnings</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card stat-green">
          <div className="stat-card-icon"><FiDollarSign /></div>
          <div className="stat-info">
            <p className="stat-value">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
                myBids.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.amount, 0)
              )}
            </p>
            <p className="stat-label">Total Earned</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-card-icon"><FiCheckCircle /></div>
          <div className="stat-info">
            <p className="stat-value">{myBids.filter(b => b.status === 'accepted').length}</p>
            <p className="stat-label">Completed Jobs</p>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-card-icon"><FiTrendingUp /></div>
          <div className="stat-info">
            <p className="stat-value">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
                myBids.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0)
              )}
            </p>
            <p className="stat-label">Pending</p>
          </div>
        </div>
      </div>
      
      <div className="section-header">
        <h2 className="section-title">Payment History</h2>
      </div>
      
      {myBids.filter(b => b.status === 'accepted').length === 0 ? (
        <div className="empty-state">
          <FiDollarSign className="empty-icon" />
          <h3>No transactions yet</h3>
          <p>Complete jobs to see your earnings here</p>
        </div>
      ) : (
        <div className="transactions-list">
          {myBids.filter(b => b.status === 'accepted').map((bid) => (
            <div className="transaction-item" key={bid.id}>
              <div className="tx-icon tx-out"><FiDollarSign /></div>
              <div className="tx-info">
                <p className="tx-title">{bid.job?.title || "Job"}</p>
                <p className="tx-sub">Completed • {new Date(bid.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="tx-right">
                <span className="tx-amount">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(bid.amount)}</span>
                <span className="tx-status" style={{ color: "#1a9c6e" }}>Paid</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
      case "profile":
  return (
    <div className="profile-layout">
      <div className="profile-card">
        <div className="profile-photo-wrap">
          <div className="profile-photo">
            <div className="profile-photo-placeholder">
              {userName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <h3 className="profile-name">{profileData?.full_name || userName}</h3>
        <p className="profile-type">Student · {profileData?.is_verified ? "✓ Verified" : "Pending Verification"}</p>
        <div className="profile-rating-row">
          <FiStar className="star" /> <span>{profileData?.rating || "4.8"}</span>
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{profileData?.total_jobs || 0}</span>
            <span className="profile-stat-label">Jobs Done</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{myBids.filter(b => b.status === 'pending').length}</span>
            <span className="profile-stat-label">In Progress</span>
          </div>
        </div>
      </div>
      
      <div className="profile-form-card">
        <h3>Personal Information</h3>
        <div className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={profileData?.full_name || userName} disabled />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={userEmail} disabled />
          </div>
          <div className="form-group">
            <label>Matric Number</label>
            <input type="text" value={profileData?.matric_number || "Not set"} disabled />
          </div>
          <div className="form-group">
            <label>Bio / Skills</label>
            <textarea rows={3} placeholder="Tell clients about your skills..." defaultValue={profileData?.bio || ""} />
          </div>
          <button className="auth-btn">Update Profile</button>
        </div>
      </div>
    </div>
  );
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
              <button
                className="card-link"
                onClick={() => setActivePage("jobs")}
              >
                Browse all jobs <FiArrowRight />
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "white",
                  borderRadius: "16px",
                }}
              >
                <p>No jobs available yet. Check back later!</p>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.slice(0, 3).map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <span className="job-card-category">{job.category}</span>
                      <button className="bookmark-btn">
                        <FiBookmark />
                      </button>
                    </div>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-desc">
                      {job.description?.substring(0, 100)}...
                    </p>
                    <div className="job-card-meta">
                      <span>
                        <FiClock /> {job.duration || "Not specified"}
                      </span>
                      <span>
                        <FiMapPin /> {job.location || "Remote"}
                      </span>
                      <span>
                        <FiUsers /> 0 bids
                      </span>
                    </div>
                    <div
                      className="job-card-footer"
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="job-card-budget">
                        {formatBudget(job.budget)}
                      </span>
                      <button
                        className="btn-primary btn-small"
                        onClick={() => openBidModal(job)}
                      >
                        Bid Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <div
                className="quick-action-card"
                onClick={() => setActivePage("jobs")}
              >
                <div className="quick-action-icon qa-green">
                  <FiSearch />
                </div>
                <p>Browse jobs</p>
              </div>
              <div
                className="quick-action-card"
                onClick={() => setActivePage("bids")}
              >
                <div className="quick-action-icon qa-blue">
                  <FiTrendingUp />
                </div>
                <p>My bids</p>
              </div>
              <div
                className="quick-action-card"
                onClick={() => setActivePage("earnings")}
              >
                <div className="quick-action-icon qa-purple">
                  <FiDollarSign />
                </div>
                <p>My earnings</p>
              </div>
              <div
                className="quick-action-card"
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
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-left" onClick={() => navigate('/')}>
            <FiZap className="logo-icon" />
            <span>CampusFreelance</span>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'nav-item-active' : ''}`}
              onClick={() => setActivePage(item.key)}
              title={sidebarCollapsed ? item.label : ''}
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
      </aside>

      <div className={`sidebar-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`sidebar-drawer ${drawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
          <button onClick={() => setDrawerOpen(false)} className="drawer-close-btn"><FiX /></button>
        </div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-left" onClick={() => navigate('/')}>
            <FiZap className="logo-icon" />
            <span>CampusFreelance</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'nav-item-active' : ''}`}
              onClick={() => { setActivePage(item.key); setDrawerOpen(false); }}
            >
              {item.icon} <span>{item.label}</span>
              {item.badge && parseInt(item.badge) > 0 && <span className="nav-badge">{item.badge}</span>}
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
      </div>

      <main className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar">
          <div className="topbar-left">
            {isMobile && (
              <button className="mobile-menu-btn" onClick={() => setDrawerOpen(true)}>
                <FiMenu />
              </button>
            )}
            <div className="greeting">
              <h1>
                {activePage === 'home' && `Welcome back, ${userName} 👋`}
                {activePage === 'jobs' && 'Browse Jobs'}
                {activePage === 'bids' && 'My Bids'}
                {activePage === 'messages' && 'Messages'}
                {activePage === 'earnings' && 'My Earnings'}
                {activePage === 'profile' && 'My Profile'}
              </h1>
              <p>
                {activePage === 'home' && `You have ${jobs.length} new job matches today`}
                {activePage === 'jobs' && 'Find the perfect job for your skills'}
                {activePage === 'bids' && 'Track all your proposals'}
                {activePage === 'messages' && 'Chat with clients who hired you'}
                {activePage === 'earnings' && 'Track all your payments'}
                {activePage === 'profile' && 'Manage your student profile'}
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <div style={{ position: 'relative' }}>
              <button className="topbar-notif" onClick={() => setShowNotifications(!showNotifications)}>
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <NotificationsPopup userId={userId} onClose={() => setShowNotifications(false)} />
              )}
            </div>
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
              className={`bottom-nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => setActivePage(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && parseInt(item.badge) > 0 && (
                <span className="bottom-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Place a Bid</h2>
              <button onClick={() => setShowBidModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <p style={{ marginBottom: '0.5rem' }}><strong>Job:</strong> {selectedJob.title}</p>
            <p style={{ marginBottom: '1rem' }}><strong>Budget:</strong> {formatBudget(selectedJob.budget)}</p>
            {bidError && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {bidError}
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Your Bid Amount (₦)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter your bid amount"
                style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
              />
              <small style={{ color: '#64748b', display: 'block', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Maximum: {formatBudget(selectedJob.budget)}
              </small>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Proposal / Cover Letter</label>
              <textarea
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
                placeholder="Why are you the best fit for this job?"
                rows={4}
                style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', resize: 'vertical', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button
              onClick={handleBid}
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            >
              {submitting ? 'Submitting...' : 'Submit Bid'} <FiSend />
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successBidData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', background: '#1a9c6e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FiCheckCircle style={{ color: 'white', fontSize: '2.5rem' }} />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Bid Placed! 🎉</h2>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>Your bid has been submitted to {successBidData.clientName}.</p>
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><strong>Job:</strong> {successBidData.jobTitle}</p>
              <p style={{ marginBottom: '0', fontSize: '0.875rem' }}><strong>Your Bid:</strong> {formatBudget(successBidData.amount)}</p>
            </div>
            <button onClick={() => { setShowSuccessModal(false); setActivePage('bids'); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '0.75rem' }}>
              View My Bids
            </button>
            <button onClick={() => setShowSuccessModal(false)} className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  )
};

export default StudentDashboard;
