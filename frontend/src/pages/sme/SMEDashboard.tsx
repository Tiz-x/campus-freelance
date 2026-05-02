import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useToast, ToastContainer } from '../../components/Toast';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useRoutePersistence } from "../../hooks/useRoutePersistence";
import ChatPage from "../../components/Chat/ChatPage";
import NotificationsPopup from "../../components/NotificationsPopup";
import PaystackPayment from "../../components/PaystackPayment";
import StudentProfileModal from "../../components/StudentProfileModal";
import {
  FiZap,
  FiHome,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiUser,
  FiMenu,
  FiLogOut,
  FiBell,
  FiPlus,
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
  FiX,
  FiCheck,
  FiXCircle,
  FiEye,
  FiClock,
  FiMessageCircle,
  FiSearch,
  FiShield,
} from "react-icons/fi";
import "../../styles/dashboard.css";
import "../../styles/sme.css";

const SMEDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem('sme_activePage') || 'home';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [jobs, setJobs] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [processingBid, setProcessingBid] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [companyAvatar, setCompanyAvatar] = useState<string | null>(null);

  useRoutePersistence();

  const handlePageChange = (page: string) => {
    sessionStorage.setItem('sme_activePage', page);
    setActivePage(page);
  };

  useEffect(() => {
    if (activePage === "students" && students.length === 0 && !studentsLoading) {
      fetchStudents();
    }
  }, [activePage]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    checkUser();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  useEffect(() => {
    if (showBidsModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showBidsModal]);

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
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      setUserId(user.id);
      setUserEmail(user.email || "");
      if (profile?.avatar_url) {
        setCompanyAvatar(profile.avatar_url);
      }
      await fetchJobs(user.id);
      await fetchBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchStudents = async () => {
  setStudentsLoading(true);
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        portfolio:portfolio_items(*)
      `)
      .eq("role", "student")
      .eq("is_verified", true)
      .limit(30);
      
    if (!error && data) {
      setStudents(data);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
  } finally {
    setStudentsLoading(false);
  }
};

  const fetchTransactions = async () => {
    if (!userId) return;
    setTransactionsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*, jobs(title)")
      .eq("payer_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setTransactions(data);
    }
    setTransactionsLoading(false);
  };

  const fetchJobs = async (smeId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("created_by", smeId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (smeId: string) => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("created_by", smeId);
        
      if (jobsError || !jobsData?.length) {
        setBids([]);
        return;
      }
      
      const jobIds = jobsData.map(job => job.id);
      
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*, student:student_id(id, full_name, email, avatar_url)")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })
        .limit(20);
        
      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        setBids([]);
      } else {
        const formattedBids = bidsData?.map((bid: any) => ({
          ...bid,
          profiles: bid.student || { full_name: "Student", email: "" }
        })) || [];
        setBids(formattedBids);
      }
    } catch (error) {
      console.error("Error in fetchBids:", error);
      setBids([]);
    }
  };

  const handleAcceptBid = async (bidId: string, jobId: string, studentId: string, jobTitle: string) => {
    setProcessingBid(true);
    try {
      await supabase.from("bids").update({ status: "accepted" }).eq("id", bidId);
      await supabase.from("bids").update({ status: "rejected" }).eq("job_id", jobId).neq("id", bidId);
      await supabase.from("jobs").update({ status: "in_progress", hired_student_id: studentId }).eq("id", jobId);
      await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: studentId,
        job_id: jobId,
        message: `Hi! I've accepted your bid for "${jobTitle}". Let's discuss the project details.`,
        is_read: false,
      });
      await supabase.from("notifications").insert({
        user_id: studentId,
        type: "bid_accepted",
        title: "Bid Accepted! 🎉",
        message: `Your bid for "${jobTitle}" has been accepted.`,
        related_id: jobId,
        is_read: false,
      });
      
      addToast(`Bid from student accepted successfully!`, 'success');
      await fetchBids(userId);
      await fetchJobs(userId);
      setShowBidsModal(false);
    } catch (error) {
      console.error("Error:", error);
      addToast(`Failed to accept bid. Please try again.`, 'error');
    } finally {
      setProcessingBid(false);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setProcessingBid(true);
    try {
      await supabase.from("bids").update({ status: "rejected" }).eq("id", bidId);
      addToast(`Bid has been rejected.`, 'info');
      await fetchBids(userId);
    } catch (error) {
      console.error("Error:", error);
      addToast(`Failed to reject bid. Please try again.`, 'error');
    } finally {
      setProcessingBid(false);
    }
  };

  const completeJob = (jobId: string, studentId: string, amount: number, jobTitle: string) => {
    setPendingAction({ type: 'complete_job', data: { jobId, studentId, amount, jobTitle } });
    setShowConfirmModal(true);
  };

  const confirmCompleteJob = async () => {
    if (!pendingAction?.data) return;
    const { jobId, studentId, amount, jobTitle } = pendingAction.data;
    
    try {
      await supabase.from("jobs").update({ status: "completed" }).eq("id", jobId);
      await supabase.from("transactions").update({ status: "released" }).eq("job_id", jobId);
      await supabase.from("notifications").insert({
        user_id: studentId,
        type: "payment_released",
        title: "Payment Released! 💰",
        message: `Payment of ${formatBudget(amount)} for "${jobTitle}" has been released.`,
        related_id: jobId,
        is_read: false,
      });
      
      addToast(`Job "${jobTitle}" completed! ${formatBudget(amount)} released to student.`, 'success');
      await fetchJobs(userId);
      await fetchTransactions();
    } catch (error) {
      console.error("Error:", error);
      addToast(`Failed to complete job. Please try again.`, 'error');
    } finally {
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  const viewJobBids = (job: any) => {
    setSelectedJob(job);
    setShowBidsModal(true);
  };

  const goToChat = (studentId: string, studentName: string) => {
    if (!studentId) {
      addToast("Student information not available", 'error');
      return;
    }
    sessionStorage.setItem("selectedChatUser", JSON.stringify({ id: studentId, full_name: studentName || "Student" }));
    handlePageChange("messages");
    fetchUnreadMessageCount();
  };

  const handleLogout = () => {
    setPendingAction({ type: 'logout', data: null });
    setShowConfirmModal(true);
  };

  const confirmLogout = async () => {
    sessionStorage.removeItem('sme_activePage');
    sessionStorage.removeItem('lastRoute');
    sessionStorage.clear();
    await supabase.auth.signOut();
    addToast(`Logged out successfully.`, 'info');
    navigate("/login");
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(budget);
  };

  const getBidCount = (jobId: string) => {
    return bids.filter((bid) => bid.job_id === jobId).length;
  };

  const getJobBids = (jobId: string) => {
    return bids.filter((bid) => bid.job_id === jobId);
  };

  const getAcceptedBidForJob = (jobId: string) => {
    return bids.find((bid) => bid.job_id === jobId && bid.status === "accepted");
  };

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "My Jobs", key: "jobs" },
    { icon: <FiUsers />, label: "Browse Students", key: "students" },
    { icon: <FiMessageSquare />, label: "Messages", key: "messages", badge: chatUnreadCount.toString() },
    { icon: <FiDollarSign />, label: "Payments", key: "payments" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "jobs":
        return (
          <div className="student-home">
            <div className="page-header" style={{ marginBottom: "1rem" }}>
              <h2>My Jobs</h2>
              <p>Manage all your posted jobs</p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <button className="btn-primary" onClick={() => navigate("/post-job")}>
                <FiPlus /> Post New Job
              </button>
            </div>
            {loading ? (
              <div className="loading-state">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <FiBriefcase className="empty-icon" />
                <h3>No jobs posted yet</h3>
                <p>Post your first job to start hiring students</p>
                <button className="btn-primary" onClick={() => navigate("/post-job")}>Post Your First Job</button>
              </div>
            ) : (
              <div className="jobs-day-grid">
                {jobs.map((job) => {
                  const acceptedBid = getAcceptedBidForJob(job.id);
                  return (
                    <div className="job-day-card" key={job.id}>
                      <div className="job-day-header">
                        <div className="company-badge">
                          {companyAvatar ? (
                            <img src={companyAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                          ) : (
                            userName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="company-details">
                          <h4>{job.title}</h4>
                          <p><span className="flag">📍</span> {job.location || "Remote"}</p>
                        </div>
                      </div>
                      <span className={`job-status ${job.status === "open" ? "status-open" : job.status === "in_progress" ? "status-progress" : "status-completed"}`}>
                        {job.status === "open" ? "Open" : job.status === "in_progress" ? "In Progress" : "Completed"}
                      </span>
                      <p className="job-description">{job.description?.substring(0, 100)}...</p>
                      <div className="job-meta-info">
                        <span><FiClock /> {job.duration || "Flexible"}</span>
                        <span><FiUsers /> {getBidCount(job.id)} bids</span>
                      </div>
                      <div className="job-day-footer">
                        <div className="price"><span className="amount">{formatBudget(job.budget)}</span><span className="unit">/project</span></div>
                        <div className="job-actions">
                          <button className="apply-btn" onClick={() => viewJobBids(job)}><FiEye /> View Bids ({getBidCount(job.id)})</button>
                          {acceptedBid && <button className="btn-outline-small" onClick={() => goToChat(acceptedBid.student_id, acceptedBid.profiles?.full_name)}><FiMessageCircle /> Message</button>}
                          {job.status === "in_progress" && acceptedBid && <button className="btn-complete" onClick={() => completeJob(job.id, acceptedBid.student_id, job.budget, job.title)}><FiCheckCircle /> Complete & Pay</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "students":
        return (
          <div className="student-home">
            <div className="page-header"><h2>Browse Students</h2><p>Find verified students to hire for your projects</p></div>
            {studentsLoading ? <div className="loading-state">Loading students...</div> : students.length === 0 ? (
              <div className="empty-state"><FiUsers className="empty-icon" /><h3>No students found</h3><p>Check back later for verified students</p></div>
            ) : (
              <div className="jobs-day-grid">
                {students.map((student) => (
                  <div className="job-day-card" key={student.id} onClick={() => { setSelectedStudent(student); setShowStudentModal(true); }}>
                    <div className="job-day-header">
                      <div className="company-badge">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                        ) : (
                          student.full_name?.charAt(0).toUpperCase() || "S"
                        )}
                      </div>
                      <div className="company-details"><h4>{student.full_name || "Student"}</h4><p><span className="flag">⭐</span> {student.rating || "4.5"} · {student.total_jobs || 0} jobs</p></div>
                    </div>
                    <p className="job-description">{student.bio?.substring(0, 80) || "Available for work"}</p>
                    <div className="job-day-footer">
                      <div className="student-status"><span className="verified-badge">{student.is_verified ? "✓ Verified" : "Student"}</span></div>
                      <div className="student-actions">
                        <button className="apply-btn" onClick={(e) => { e.stopPropagation(); const openJob = jobs.find(j => j.status === "open"); if (openJob) addToast(`Invite ${student.full_name} to: ${openJob.title}`, 'info'); else addToast("Post a job first to invite this student", 'warning'); }}>Hire</button>
                        <button className="btn-outline-small" onClick={(e) => { e.stopPropagation(); goToChat(student.id, student.full_name); }}><FiMessageCircle /> Message</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "messages":
        return <ChatPage userId={userId} userRole="sme" />;

      case "payments":
        const totalSpent = transactions.filter(t => t.status === 'released').reduce((sum, t) => sum + t.amount, 0);
        const inEscrow = transactions.filter(t => t.status === 'held').reduce((sum, t) => sum + t.amount, 0);
        const completedCount = transactions.filter(t => t.status === 'released').length;
        return (
          <div className="earnings-page">
            <div className="page-header"><h2>Payments & Escrow</h2><p>Track all your payments</p></div>
            <div className="earnings-hero">
              <div className="earnings-total"><span className="earnings-label">Total Spent</span><div className="earnings-amount">{formatBudget(totalSpent)}</div><p className="earnings-note">Lifetime payments on CampusFreelance</p></div>
              <div className="earnings-stats"><div className="stat-badge"><span className="stat-value">{formatBudget(inEscrow)}</span><span className="stat-label">In Escrow</span></div><div className="stat-badge"><span className="stat-value">{completedCount}</span><span className="stat-label">Jobs Done</span></div></div>
            </div>
            <div className="transactions-card"><div className="card-header"><h3>Payment History</h3></div>
              {transactionsLoading ? <div className="loading-state">Loading...</div> : transactions.length === 0 ? (
                <div className="empty-state small"><FiDollarSign className="empty-icon" /><p>No payments yet. When you hire students, your payments will appear here.</p></div>
              ) : (
                transactions.filter(t => t.status === 'released').map((tx) => (
                  <div className="transaction-item" key={tx.id}>
                    <div className="transaction-icon"><FiDollarSign /></div>
                    <div className="transaction-info"><p className="transaction-title">{tx.jobs?.title || "Job Payment"}</p><p className="transaction-sub">{tx.jobs?.title ? 'Released to student' : 'Payment'} · {new Date(tx.created_at).toLocaleDateString()}</p></div>
                    <div className="transaction-right"><span className="transaction-amount">{formatBudget(tx.amount)}</span><span className="transaction-status success">Released ✓</span></div>
                  </div>
                ))
              )}
            </div>
            <div className="info-card"><FiShield className="info-icon" /><div><h4>How payments work</h4><p>When you hire a student and pay, funds are held in escrow. Once the job is completed and you confirm, payment is released to the student automatically.</p></div></div>
          </div>
        );

      case "profile":
        return (
          <div className="profile-page">
            <div className="profile-card">
              <div className="profile-avatar">
                {companyAvatar ? (
                  <img src={companyAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  userName?.charAt(0).toUpperCase()
                )}
              </div>
              <h3>{userName}</h3>
              <p>SME Account</p>
              <div className="profile-stats">
                <div><span>{jobs.length}</span><label>Jobs Posted</label></div>
                <div><span>{jobs.filter(j => j.status === 'open').length}</span><label>Active</label></div>
                <div><span>{jobs.filter(j => j.status === 'completed').length}</span><label>Completed</label></div>
              </div>
            </div>
            <div className="profile-form">
              <h3>Business Information</h3>
              <div className="form-group"><label>Company Name</label><input type="text" value={userName} disabled /></div>
              <div className="form-group"><label>Email</label><input type="email" value={userEmail} disabled /></div>
              <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="Enter phone number" /></div>
              <div className="form-group"><label>Business Address</label><input type="text" placeholder="Enter business address" /></div>
              <div className="form-group"><label>About Business</label><textarea rows={3} placeholder="Tell students about your business..." /></div>
              <button className="btn-primary">Update Profile</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="student-home">
            <div className="hero-section-kkw">
              <div className="hero-content-kkw">
                <h1>Find talented student for your job in <span className="highlight">Akungba</span></h1>
                <div className="welcome-message">Good morning, {userName}</div>
                <div className="hero-search-kkw">
                  <div className="search-field-kkw"><FiSearch /><input type="text" placeholder="Search for students..." /></div>
                  <button className="search-btn-kkw" onClick={() => handlePageChange("students")}>Search</button>
                </div>
              </div>
            </div>
            <div className="stats-cards-section">
              <div className="stats-cards-grid">
                <div className="stat-card"><div className="stat-icon" style={{ backgroundColor: '#1a9c6e15', color: '#1a9c6e' }}><FiBriefcase /></div><div className="stat-content"><div className="stat-value">{jobs.length}</div><div className="stat-label">TOTAL JOBS</div></div></div>
                <div className="stat-card"><div className="stat-icon" style={{ backgroundColor: '#3b82f615', color: '#3b82f6' }}><FiUsers /></div><div className="stat-content"><div className="stat-value">{bids.length}</div><div className="stat-label">TOTAL BIDS</div></div></div>
                <div className="stat-card"><div className="stat-icon" style={{ backgroundColor: '#f9731615', color: '#f97316' }}><FiCheckCircle /></div><div className="stat-content"><div className="stat-value">{jobs.filter(j => j.status === 'open').length}</div><div className="stat-label">ACTIVE JOBS</div></div></div>
                <div className="stat-card"><div className="stat-icon" style={{ backgroundColor: '#8b5cf615', color: '#8b5cf6' }}><FiDollarSign /></div><div className="stat-content"><div className="stat-value">₦0</div><div className="stat-label">TOTAL SPENT</div></div></div>
              </div>
            </div>
            <div className="categories-section-jw">
              <div className="section-header-jw"><div><h2>Recent Bids</h2><p>Students who have bid on your jobs</p></div><button className="view-all-jw" onClick={() => handlePageChange("jobs")}>View all <FiArrowRight /></button></div>
              {bids.length === 0 ? (<div className="empty-state small"><p>No bids yet. When students bid on your jobs, they'll appear here.</p></div>) : (
                <div className="jobs-day-grid">
                  {bids.slice(0, 3).map((bid) => (
                    <div className="job-day-card" key={bid.id}>
                      <div className="job-day-header"><div className="company-badge">
                        {bid.profiles?.avatar_url ? (
                          <img src={bid.profiles.avatar_url} alt={bid.profiles?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                        ) : (
                          bid.profiles?.full_name?.charAt(0).toUpperCase() || "S"
                        )}
                      </div><div className="company-details"><h4>{bid.profiles?.full_name || "Student"}</h4><p><span className="flag">💰</span> Bid: {formatBudget(bid.amount)}</p></div></div>
                      <span className={`job-status ${bid.status === "pending" ? "status-open" : bid.status === "accepted" ? "status-progress" : "status-completed"}`}>{bid.status === "pending" ? "Pending" : bid.status === "accepted" ? "Accepted" : "Rejected"}</span>
                      <p className="job-description">{bid.proposal?.substring(0, 100)}...</p>
                      <div className="job-day-footer">
                        <div className="price"><span className="amount">{formatBudget(bid.amount)}</span><span className="unit">/bid</span></div>
                        <div className="bid-actions"><button className="apply-btn" onClick={() => { setSelectedJob(bid.jobs); setShowBidsModal(true); }}>View Details</button>{bid.status === "accepted" && <button className="btn-outline-small" onClick={() => goToChat(bid.student_id, bid.profiles?.full_name)}><FiMessageCircle /> Chat</button>}</div>
                      </div>
                    </div>
                  ))}
                </div>
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
              onClick={() => handlePageChange(item.key)}
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
              {companyAvatar ? (
                <img src={companyAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="sidebar-name">{userName}</p>
              <p className="sidebar-role">SME Account</p>
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
              onClick={() => { handlePageChange(item.key); setDrawerOpen(false); }}
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
              {companyAvatar ? (
                <img src={companyAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="drawer-name">{userName}</p>
              <p className="drawer-role">SME Account</p>
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
            <div className="topbar-logo-center"><div className="logo-wrapper" onClick={() => handlePageChange("home")}><FiZap className="logo-icon-topbar" /><span className="logo-text-topbar">CampusFreelance</span></div></div>
            <div className="topbar-actions">
              <div className="notification-wrapper"><button className="topbar-notif" onClick={() => setShowNotifications(!showNotifications)}><FiBell />{unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{showNotifications && <NotificationsPopup userId={userId} onClose={() => setShowNotifications(false)} />}</div>
              <div className="profile-avatar-topbar" onClick={() => handlePageChange("profile")}><div className="student-topbar-avatar">
                {companyAvatar ? (
                  <img src={companyAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div></div>
            </div>
          </div>
        </div>
        <div className="scrollable-content">{renderContent()}</div>
      </div>

      {isMobile && (<div className="bottom-nav">{navItems.slice(0, 4).map((item) => (<button key={item.key} className={`bottom-nav-item ${activePage === item.key ? "active" : ""}`} onClick={() => handlePageChange(item.key)}>{item.icon}<span>{item.label}</span>{item.badge && parseInt(item.badge) > 0 && <span className="bottom-nav-badge">{item.badge}</span>}</button>))}</div>)}

      {/* Bids Modal */}
      {showBidsModal && selectedJob && (
        <div className="modal-overlay"><div className="modal-container"><div className="modal-header"><h2>Bids for: {selectedJob.title}</h2><button onClick={() => setShowBidsModal(false)} className="modal-close"><FiX /></button></div>
          <div className="modal-body">
            <p><strong>Job Budget:</strong> {formatBudget(selectedJob.budget)}</p>
            <p><strong>Status:</strong> <span className={`job-status ${selectedJob.status === "open" ? "status-open" : "status-progress"}`}>{selectedJob.status === "open" ? "Open" : "In Progress"}</span></p>
            <h3>All Bids ({getJobBids(selectedJob.id).length})</h3>
            {getJobBids(selectedJob.id).length === 0 ? (<div className="empty-state"><p>No bids yet for this job.</p></div>) : (
              getJobBids(selectedJob.id).map((bid) => (
                <div key={bid.id} style={{ background: bid.status === "accepted" ? "#d4edda" : bid.status === "rejected" ? "#f8d7da" : "white", border: "1px solid #ddd", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div><p><strong>{bid.profiles?.full_name || "Student"}</strong></p><p style={{ fontSize: "0.85rem", color: "#666" }}>{bid.profiles?.email || "No email"}</p><p><strong>Bid Amount:</strong> {formatBudget(bid.amount)}</p><p><strong>Proposal:</strong> {bid.proposal}</p><p style={{ fontSize: "0.75rem", color: "#666" }}>Submitted: {new Date(bid.created_at).toLocaleString()}</p></div>
                    <div><span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600", background: bid.status === "pending" ? "#fff3cd" : bid.status === "accepted" ? "#d4edda" : "#f8d7da", color: bid.status === "pending" ? "#856404" : bid.status === "accepted" ? "#155724" : "#721c24" }}>{bid.status.toUpperCase()}</span></div>
                  </div>
                  {bid.status === "pending" && selectedJob.status === "open" && (<div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #ddd" }}><button onClick={() => handleAcceptBid(bid.id, selectedJob.id, bid.student_id, selectedJob.title)} disabled={processingBid} className="accept-btn"><FiCheck /> Accept Bid</button><button onClick={() => handleRejectBid(bid.id)} disabled={processingBid} className="reject-btn"><FiXCircle /> Reject</button></div>)}
                  {bid.status === "accepted" && (<div style={{ marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #ddd" }}><button onClick={() => goToChat(bid.student_id, bid.profiles?.full_name)} className="btn-primary btn-small" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}><FiMessageCircle /> Message Student</button>
                  <PaystackPayment amount={bid.amount} email={userEmail} jobId={selectedJob.id} jobTitle={selectedJob.title} studentId={bid.student_id} onSuccess={() => { addToast("Payment successful! Funds are held in escrow until job completion.", 'success'); fetchBids(userId); fetchJobs(userId); fetchTransactions(); }} onClose={() => {}} /></div>)}
                </div>
              ))
            )}
          </div>
        </div></div>
      )}

      {showStudentModal && selectedStudent && <StudentProfileModal student={selectedStudent} onClose={() => setShowStudentModal(false)} onMessage={(id, name) => goToChat(id, name)} onHire={(student) => { const openJob = jobs.find((j) => j.status === "open"); if (openJob) addToast(`Invite ${student.full_name} to: ${openJob.title}`, 'info'); else addToast("Post a job first to invite this student", 'warning'); }} />}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title={pendingAction?.type === 'logout' ? 'Logout?' : 'Complete Job?'}
        message={
          pendingAction?.type === 'logout' 
            ? 'Are you sure you want to logout?' 
            : `Are you sure you want to complete "${pendingAction?.data?.jobTitle}"? This will release ${formatBudget(pendingAction?.data?.amount)} to the student.`
        }
        confirmText={pendingAction?.type === 'logout' ? 'Logout' : 'Complete & Release'}
        cancelText="Cancel"
        type={pendingAction?.type === 'logout' ? 'warning' : 'danger'}
        onConfirm={pendingAction?.type === 'logout' ? confirmLogout : confirmCompleteJob}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default SMEDashboard;