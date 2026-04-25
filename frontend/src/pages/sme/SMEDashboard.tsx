import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ChatPage from "../../components/Chat/ChatPage";
import NotificationsPopup from "../../components/NotificationsPopup";
import PaystackPayment from "../../components/PaystackPayment";
import {
  FiZap,
  FiHome,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiUser,
  FiMenu,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBell,
  FiPlus,
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
  FiStar,
  FiX,
  FiCheck,
  FiXCircle,
  FiEye,
  FiClock,
  FiMessageCircle,
  FiMapPin,
} from "react-icons/fi";
import "../../styles/dashboard.css";

const SMEDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [activePage, setActivePage] = useState("home");
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch students when Browse Students tab is opened
  useEffect(() => {
    if (
      activePage === "students" &&
      students.length === 0 &&
      !studentsLoading
    ) {
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

  // Fetch transactions when user is loaded
  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

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
      setUserEmail(user.email || "");
      setUserName(
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      );
      setUserId(user.id);
      fetchJobs(user.id);
      fetchBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .eq("is_verified", true);

    if (!error && data) {
      setStudents(data);
    }
    setStudentsLoading(false);
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (smeId: string) => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, budget, status")
        .eq("created_by", smeId);

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
      }

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map((job) => job.id);

        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select("*")
          .in("job_id", jobIds)
          .order("created_at", { ascending: false });

        if (bidsError) {
          console.error("Error fetching bids:", bidsError);
        } else if (bidsData && bidsData.length > 0) {
          const studentIds = [
            ...new Set(bidsData.map((bid) => bid.student_id)),
          ];

          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", studentIds);

          const profileMap: Record<string, any> = {};
          profilesData?.forEach((profile) => {
            profileMap[profile.id] = profile;
          });

          const bidsWithProfiles = bidsData.map((bid) => {
            const job = jobsData.find((j) => j.id === bid.job_id);
            return {
              ...bid,
              profiles: profileMap[bid.student_id] || {
                full_name: "Student",
                email: "",
              },
              jobs: job,
            };
          });

          setBids(bidsWithProfiles);
        } else {
          setBids([]);
        }
      }
    } catch (error) {
      console.error("Error in fetchBids:", error);
    }
  };

  const handleAcceptBid = async (
    bidId: string,
    jobId: string,
    studentId: string,
    jobTitle: string,
  ) => {
    setProcessingBid(true);

    try {
      // Update bid status to accepted
      const { error: bidError } = await supabase
        .from("bids")
        .update({ status: "accepted" })
        .eq("id", bidId);

      if (bidError) {
        console.error("Error accepting bid:", bidError);
        alert(`Failed to accept bid: ${bidError.message}`);
        setProcessingBid(false);
        return;
      }

      // Reject other bids
      await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("job_id", jobId)
        .neq("id", bidId);

      // Update job status and hired_student_id
      await supabase
        .from("jobs")
        .update({ status: "in_progress", hired_student_id: studentId })
        .eq("id", jobId);

      // Send welcome message
      await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: studentId,
        job_id: jobId,
        message: `Hi! I've accepted your bid for "${jobTitle}". Let's discuss the project details. I'm looking forward to working with you!`,
        is_read: false,
      });

      // Send notification to student
      await supabase.from("notifications").insert({
        user_id: studentId,
        type: "bid_accepted",
        title: "Bid Accepted! 🎉",
        message: `Your bid for "${jobTitle}" has been accepted. Complete the job to receive payment.`,
        related_id: jobId,
        is_read: false,
      });

      alert("Bid accepted successfully!");

      // Refresh data
      await fetchBids(userId);
      await fetchJobs(userId);
      setShowBidsModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingBid(false);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setProcessingBid(true);

    try {
      const { error } = await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("id", bidId);

      if (error) {
        console.error("Error rejecting bid:", error);
        alert(`Failed to reject bid: ${error.message}`);
      } else {
        alert("Bid rejected successfully.");
        fetchBids(userId);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingBid(false);
    }
  };

  const completeJob = async (
    jobId: string,
    studentId: string,
    amount: number,
    jobTitle: string,
  ) => {
    if (
      !confirm(
        `Confirm job completion for "${jobTitle}"? This will release ₦${amount.toLocaleString()} to the student.`,
      )
    ) {
      return;
    }

    try {
      // Update job status to completed
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", jobId);

      if (jobError) {
        console.error("Error completing job:", jobError);
        alert("Failed to complete job. Please try again.");
        return;
      }

      // Update transaction status to released
      const { error: txError } = await supabase
        .from("transactions")
        .update({ status: "released" })
        .eq("job_id", jobId);

      if (txError) {
        console.error("Error updating transaction:", txError);
      }

      // Send notification to student
      await supabase.from("notifications").insert({
        user_id: studentId,
        type: "payment_released",
        title: "Payment Released! 💰",
        message: `Payment of ₦${amount.toLocaleString()} for "${jobTitle}" has been released. Check your earnings!`,
        related_id: jobId,
        is_read: false,
      });

      alert(
        `Job completed! ₦${amount.toLocaleString()} has been released to the student.`,
      );

      // Refresh data
      await fetchJobs(userId);
      await fetchTransactions();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const viewJobBids = (job: any) => {
    setSelectedJob(job);
    setShowBidsModal(true);
  };

  const goToChat = (studentId: string, studentName: string) => {
    if (!studentId) {
      alert("Student information not available");
      return;
    }
    sessionStorage.setItem(
      "selectedChatUser",
      JSON.stringify({
        id: studentId,
        full_name: studentName || "Student",
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

  const getBidCount = (jobId: string) => {
    return bids.filter((bid) => bid.job_id === jobId).length;
  };

  const getJobBids = (jobId: string) => {
    return bids.filter((bid) => bid.job_id === jobId);
  };

  const getAcceptedBidForJob = (jobId: string) => {
    return bids.find(
      (bid) => bid.job_id === jobId && bid.status === "accepted",
    );
  };

  const stats = [
    {
      icon: <FiBriefcase />,
      label: "Total Jobs",
      value: jobs.length.toString(),
      color: "stat-green",
    },
    {
      icon: <FiUsers />,
      label: "Total Bids",
      value: bids.length.toString(),
      color: "stat-blue",
    },
    {
      icon: <FiCheckCircle />,
      label: "Active Jobs",
      value: jobs.filter((j) => j.status === "open").length.toString(),
      color: "stat-purple",
    },
    {
      icon: <FiDollarSign />,
      label: "Total Spent",
      value: "₦0",
      color: "stat-orange",
    },
  ];

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "My Jobs", key: "jobs" },
    { icon: <FiUsers />, label: "Browse Students", key: "students" },
    {
      icon: <FiMessageSquare />,
      label: "Messages",
      key: "messages",
      badge: chatUnreadCount.toString(),
    },
    { icon: <FiDollarSign />, label: "Payments", key: "payments" },
    { icon: <FiUser />, label: "Profile", key: "profile" },
  ];

  const renderContent = () => {
    switch (activePage) {
      case "jobs":
        return (
          <>
            <div className="section-header">
              <h2 className="section-title">My Jobs</h2>
              <button
                className="btn-primary"
                onClick={() => navigate("/post-job")}
              >
                <FiPlus /> Post New Job
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
                <p>You haven't posted any jobs yet.</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/post-job")}
                  style={{ marginTop: "1rem" }}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.map((job) => {
                  const acceptedBid = getAcceptedBidForJob(job.id);
                  return (
                    <div className="job-card" key={job.id}>
                      <div className="job-card-image" />
                      <div className="job-card-body">
                        <div className="job-card-top">
                          <span className="job-card-category">
                            {job.category}
                          </span>
                          <span
                            className={`job-status ${job.status === "open" ? "status-open" : job.status === "in_progress" ? "status-progress" : "status-completed"}`}
                          >
                            {job.status === "open"
                              ? "Open"
                              : job.status === "in_progress"
                                ? "In Progress"
                                : "Completed"}
                          </span>
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
                            <FiUsers /> {getBidCount(job.id)} bids
                          </span>
                        </div>
                        <div className="job-card-footer">
                          <div>
                            <span className="job-card-budget">
                              {formatBudget(job.budget)}
                            </span>
                            {job.status === "in_progress" && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.68rem",
                                  color: "#b45309",
                                  marginTop: "0.2rem",
                                }}
                              >
                                <FiClock size={10} /> Student Hired
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              className="btn-primary btn-small"
                              onClick={() => viewJobBids(job)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                              }}
                            >
                              <FiEye /> View Bids ({getBidCount(job.id)})
                            </button>
                            {acceptedBid && (
                              <button
                                className="btn-outline btn-small"
                                onClick={() =>
                                  goToChat(
                                    acceptedBid.student_id,
                                    acceptedBid.profiles?.full_name,
                                  )
                                }
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                <FiMessageCircle size={12} /> Message
                              </button>
                            )}
                            {job.status === "in_progress" && acceptedBid && (
                              <button
                                className="btn-primary btn-small"
                                onClick={() =>
                                  completeJob(
                                    job.id,
                                    acceptedBid.student_id,
                                    job.budget,
                                    job.title,
                                  )
                                }
                                style={{
                                  background: "#f59e0b",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                }}
                              >
                                <FiCheckCircle /> Complete & Pay
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case "students":
        return (
          <div>
            <div className="section-header">
              <h2 className="section-title">Browse Students</h2>
              <p className="topbar-sub">
                Find verified students to hire for your projects
              </p>
            </div>

            {studentsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <FiUsers className="empty-icon" />
                <h3>No students found</h3>
                <p>Check back later for verified students</p>
              </div>
            ) : (
              <div className="bidders-grid">
                {students.map((student) => (
                  <div className="bidder-card" key={student.id}>
                    <div className="bidder-card-banner">
                      {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.full_name} />
                      ) : null}
                      <div className="bidder-card-banner-overlay" />
                    </div>
                    <div className="bidder-card-body">
                      <div className="bidder-header">
                        <div className="bidder-avatar">
                          {student.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                            />
                          ) : (
                            student.full_name?.charAt(0).toUpperCase() || "S"
                          )}
                        </div>
                        <div className="bidder-details">
                          <p className="bidder-name">
                            {student.full_name || "Student"}
                          </p>
                          <span className="bidder-job">
                            {student.skills?.[0] || "Student"}
                          </span>
                        </div>
                      </div>
                      <div className="bidder-stats">
                        <div className="bidder-rating">
                          <FiStar className="star" />
                          <span className="rating-score">
                            {student.rating || "4.5"}
                          </span>
                          <span className="review-count">
                            ({student.total_jobs || 0} jobs)
                          </span>
                        </div>
                        <div className="bidder-completed">
                          <FiCheckCircle size={12} />
                          <span>
                            {student.matric_number ? "✓ Verified" : "Student"}
                          </span>
                        </div>
                      </div>
                      <div className="bidder-footer">
                        <div className="bid-price">
                          <span className="price-label">
                            {student.bio?.substring(0, 40) ||
                              "Available for work"}
                          </span>
                        </div>
                        <div className="bidder-actions">
                          <button
                            className="btn-primary btn-small"
                            onClick={() => {
                              const openJob = jobs.find(
                                (j) => j.status === "open",
                              );
                              if (openJob)
                                alert(
                                  `Invite ${student.full_name} to: ${openJob.title}`,
                                );
                              else
                                alert(
                                  `Post a job first to invite ${student.full_name}`,
                                );
                            }}
                          >
                            Hire
                          </button>
                          <button
                            className="btn-outline btn-small"
                            onClick={() =>
                              goToChat(student.id, student.full_name)
                            }
                          >
                            <FiMessageCircle /> Message
                          </button>
                        </div>
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
        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const inEscrow = transactions
          .filter((t) => t.status === "held")
          .reduce((sum, t) => sum + t.amount, 0);
        const completed = transactions.filter(
          (t) => t.status === "released",
        ).length;

        return (
          <div className="payments-page">
            <div className="section-header">
              <h2 className="section-title">Payments & Escrow</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card stat-green">
                <div className="stat-card-icon">
                  <FiDollarSign />
                </div>
                <div className="stat-info">
                  <p className="stat-value">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(totalSpent)}
                  </p>
                  <p className="stat-label">Total Spent</p>
                </div>
              </div>
              <div className="stat-card stat-blue">
                <div className="stat-card-icon">
                  <FiLock />
                </div>
                <div className="stat-info">
                  <p className="stat-value">
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format(inEscrow)}
                  </p>
                  <p className="stat-label">In Escrow</p>
                </div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-card-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-info">
                  <p className="stat-value">{completed}</p>
                  <p className="stat-label">Completed</p>
                </div>
              </div>
            </div>

            <div className="section-header">
              <h2 className="section-title">Transaction History</h2>
            </div>

            {transactionsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <FiDollarSign className="empty-icon" />
                <h3>No transactions yet</h3>
                <p>When you make payments, they'll appear here</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((tx) => (
                  <div className="transaction-item" key={tx.id}>
                    <div
                      className={`tx-icon ${tx.status === "released" ? "tx-out" : "tx-hold"}`}
                    >
                      {tx.status === "released" ? (
                        <FiCheckCircle />
                      ) : (
                        <FiLock />
                      )}
                    </div>
                    <div className="tx-info">
                      <p className="tx-title">
                        {tx.jobs?.title || "Job Payment"}
                      </p>
                      <p className="tx-sub">
                        {tx.status === "held"
                          ? "In Escrow"
                          : tx.status === "released"
                            ? "Released"
                            : "Pending"}{" "}
                        •{new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="tx-right">
                      <span className="tx-amount">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                        }).format(tx.amount)}
                      </span>
                      <span
                        className="tx-status"
                        style={{
                          color:
                            tx.status === "released" ? "#1a9c6e" : "#f59e0b",
                        }}
                      >
                        {tx.status === "held"
                          ? "Held in Escrow"
                          : tx.status === "released"
                            ? "Released"
                            : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="escrow-info-card">
              <div className="escrow-info-icon">
                <FiLock />
              </div>
              <div>
                <h3>How Escrow Works</h3>
                <p>
                  Payments are held securely until you confirm job completion,
                  then released to the student.
                </p>
              </div>
            </div>
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
              <h3 className="profile-name">{userName}</h3>
              <p className="profile-type">SME Account</p>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-value">0</span>
                  <span className="profile-stat-label">Jobs Posted</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">0</span>
                  <span className="profile-stat-label">Active</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">0</span>
                  <span className="profile-stat-label">Completed</span>
                </div>
              </div>
            </div>

            <div className="profile-form-card">
              <h3>Business Information</h3>
              <div className="profile-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" value={userName} disabled />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={userEmail} disabled />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="Enter phone number" />
                </div>
                <div className="form-group">
                  <label>Business Address</label>
                  <input type="text" placeholder="Enter business address" />
                </div>
                <div className="form-group">
                  <label>About Business</label>
                  <textarea
                    rows={3}
                    placeholder="Tell students about your business..."
                  />
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
              <h2 className="section-title">Recent Bids</h2>
              <button
                className="card-link"
                onClick={() => setActivePage("jobs")}
              >
                View all jobs <FiArrowRight />
              </button>
            </div>

            {bids.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "white",
                  borderRadius: "16px",
                }}
              >
                <p>
                  No bids yet. When students bid on your jobs, they'll appear
                  here.
                </p>
              </div>
            ) : (
              <div className="bidders-grid">
                {bids.slice(0, 3).map((bid) => (
                  <div className="bidder-card" key={bid.id}>
                    <div className="bidder-card-banner">
                      {bid.profiles?.avatar_url ? (
                        <img
                          src={bid.profiles.avatar_url}
                          alt={bid.profiles?.full_name}
                        />
                      ) : null}
                      <div className="bidder-card-banner-overlay" />
                    </div>
                    <div className="bidder-card-body">
                      <div className="bidder-header">
                        <div className="bidder-avatar">
                          {bid.profiles?.avatar_url ? (
                            <img
                              src={bid.profiles.avatar_url}
                              alt={bid.profiles?.full_name}
                            />
                          ) : (
                            bid.profiles?.full_name?.charAt(0).toUpperCase() ||
                            "S"
                          )}
                        </div>
                        <div className="bidder-details">
                          <p className="bidder-name">
                            {bid.profiles?.full_name || "Student"}
                          </p>
                          <span className="bidder-job">
                            {bid.jobs?.title || "Unknown Job"}
                          </span>
                        </div>
                      </div>
                      <div className="bidder-stats">
                        <div className="bidder-rating">
                          <FiStar className="star" />
                          <span className="rating-score">
                            {bid.amount
                              ? `₦${bid.amount.toLocaleString()}`
                              : "New"}
                          </span>
                        </div>
                        <span
                          className={`job-status ${bid.jobs?.status === "open" ? "status-open" : bid.jobs?.status === "in_progress" ? "status-progress" : "status-completed"}`}
                        >
                          {bid.jobs?.status === "open"
                            ? "Open"
                            : bid.jobs?.status === "in_progress"
                              ? "In Progress"
                              : "Completed"}
                        </span>
                      </div>
                      <div className="bidder-footer">
                        <div className="bid-price">
                          <span className="price-amount">
                            {bid.status === "accepted"
                              ? "✓ Accepted"
                              : bid.status === "rejected"
                                ? "✗ Rejected"
                                : formatBudget(bid.amount)}
                          </span>
                          <span className="price-label">
                            {bid.status === "accepted"
                              ? "Hired"
                              : bid.status === "rejected"
                                ? "Not Selected"
                                : "Bid Amount"}
                          </span>
                        </div>
                        <div className="bidder-actions">
                          <button
                            className="btn-outline btn-small"
                            onClick={() => {
                              setSelectedJob(bid.jobs);
                              setShowBidsModal(true);
                            }}
                          >
                            <FiEye /> View
                          </button>
                          {bid.status === "accepted" && (
                            <button
                              className="btn-primary btn-small"
                              onClick={() =>
                                goToChat(
                                  bid.student_id,
                                  bid.profiles?.full_name,
                                )
                              }
                            >
                              <FiMessageCircle /> Chat
                            </button>
                          )}
                        </div>
                      </div>
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
                onClick={() => navigate("/post-job")}
              >
                <div className="quick-action-icon qa-green">
                  <FiPlus />
                </div>
                <p>Post a Job</p>
              </div>
              <div
                className="quick-action-card"
                onClick={() => setActivePage("jobs")}
              >
                <div className="quick-action-icon qa-blue">
                  <FiBriefcase />
                </div>
                <p>My Jobs</p>
              </div>
              <div
                className="quick-action-card"
                onClick={() => setActivePage("messages")}
              >
                <div className="quick-action-icon qa-purple">
                  <FiMessageSquare />
                </div>
                <p>Messages</p>
              </div>
              <div
                className="quick-action-card"
                onClick={() => setActivePage("payments")}
              >
                <div className="quick-action-icon qa-orange">
                  <FiDollarSign />
                </div>
                <p>Payments</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-left" onClick={() => navigate("/")}>
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
              className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
              onClick={() => setActivePage(item.key)}
              title={sidebarCollapsed ? item.label : ""}
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
              {userName.charAt(0).toUpperCase()}
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

      <main
        className={`dashboard-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <div className="topbar">
          <div className="topbar-left">
            {isMobile && (
              <button
                className="mobile-menu-btn"
                onClick={() => setDrawerOpen(true)}
              >
                <FiMenu />
              </button>
            )}
            <div>
              <h1 className="topbar-title">
                {activePage === "home" && `Good morning, ${userName} 👋`}
                {activePage === "jobs" && "My Jobs"}
                {activePage === "students" && "Browse Students"}
                {activePage === "messages" && "Messages"}
                {activePage === "payments" && "Payments"}
                {activePage === "profile" && "My Profile"}
              </h1>
              <p className="topbar-sub">
                {activePage === "home" &&
                  `You have ${bids.filter((b) => b.status === "pending").length} pending bids to review`}
                {activePage === "jobs" && "Manage all your posted jobs"}
                {activePage === "students" &&
                  "Find the right student for your job"}
                {activePage === "messages" && "Chat with hired students"}
                {activePage === "payments" && "Track your payments and escrow"}
                {activePage === "profile" && "Manage your business profile"}
              </p>
            </div>
          </div>
          <div className="topbar-actions">
            <div style={{ position: "relative" }}>
              <button
                className="topbar-notif"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsPopup
                  userId={userId}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
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

      <div
        className={`sidebar-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`sidebar-drawer ${drawerOpen ? "open" : ""}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "1rem",
          }}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            className="drawer-close-btn"
          >
            <FiX />
          </button>
        </div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-left" onClick={() => navigate("/")}>
            <FiZap className="logo-icon" />
            <span>CampusFreelance</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
              onClick={() => {
                setActivePage(item.key);
                setDrawerOpen(false);
              }}
            >
              {item.icon} <span>{item.label}</span>
              {item.badge && parseInt(item.badge) > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {userName.charAt(0).toUpperCase()}
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
      </div>

      {/* Bids Modal */}
      {showBidsModal && selectedJob && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Bids for: {selectedJob.title}</h2>
              <button
                onClick={() => setShowBidsModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                <FiX />
              </button>
            </div>
            <p>
              <strong>Job Budget:</strong> {formatBudget(selectedJob.budget)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`job-status ${selectedJob.status === "open" ? "status-open" : selectedJob.status === "in_progress" ? "status-progress" : "status-completed"}`}
              >
                {selectedJob.status === "open"
                  ? "Open"
                  : selectedJob.status === "in_progress"
                    ? "In Progress"
                    : "Completed"}
              </span>
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <h3>All Bids ({getJobBids(selectedJob.id).length})</h3>
              {getJobBids(selectedJob.id).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                  }}
                >
                  <p>No bids yet for this job.</p>
                </div>
              ) : (
                getJobBids(selectedJob.id).map((bid) => (
                  <div
                    key={bid.id}
                    style={{
                      background:
                        bid.status === "accepted"
                          ? "#d4edda"
                          : bid.status === "rejected"
                            ? "#f8d7da"
                            : "white",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontWeight: "bold",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {bid.profiles?.full_name || "Student"}
                        </p>
                        <p
                          style={{
                            color: "#666",
                            fontSize: "0.85rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {bid.profiles?.email || "No email"}
                        </p>
                        <p
                          style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}
                        >
                          <strong>Bid Amount:</strong>{" "}
                          {formatBudget(bid.amount)}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <strong>Proposal:</strong> {bid.proposal}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#666" }}>
                          <strong>Submitted:</strong>{" "}
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            background:
                              bid.status === "pending"
                                ? "#fff3cd"
                                : bid.status === "accepted"
                                  ? "#d4edda"
                                  : "#f8d7da",
                            color:
                              bid.status === "pending"
                                ? "#856404"
                                : bid.status === "accepted"
                                  ? "#155724"
                                  : "#721c24",
                          }}
                        >
                          {bid.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {bid.status === "pending" &&
                      selectedJob.status === "open" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "1rem",
                            paddingTop: "0.5rem",
                            borderTop: "1px solid #ddd",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleAcceptBid(
                                bid.id,
                                selectedJob.id,
                                bid.student_id,
                                selectedJob.title,
                              )
                            }
                            disabled={processingBid}
                            className="accept-btn"
                          >
                            <FiCheck /> Accept Bid
                          </button>
                          <button
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={processingBid}
                            className="reject-btn"
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      )}
                    {bid.status === "accepted" && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "1rem",
                            paddingTop: "0.5rem",
                            borderTop: "1px solid #ddd",
                          }}
                        >
                          <button
                            onClick={() =>
                              goToChat(bid.student_id, bid.profiles?.full_name)
                            }
                            className="btn-primary btn-small"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <FiMessageCircle /> Message{" "}
                            {bid.profiles?.full_name?.split(" ")[0] ||
                              "Student"}
                          </button>
                        </div>
                        <PaystackPayment
                          amount={bid.amount}
                          email={userEmail}
                          jobId={selectedJob.id}
                          jobTitle={selectedJob.title}
                          studentId={bid.student_id}
                          onSuccess={() => {
                            alert(
                              "Payment successful! Funds are held in escrow until job completion.",
                            );
                            fetchBids(userId);
                            fetchJobs(userId);
                            fetchTransactions();
                          }}
                          onClose={() => {}}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMEDashboard;
