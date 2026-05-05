import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import ChatPage from "../../components/Chat/ChatPage";
import NotificationsPopup from "../../components/NotificationsPopup";
import { useRoutePersistence } from "../../hooks/useRoutePersistence";
import { useToast, ToastContainer } from "../../components/Toast";
import ErrorBoundary from "../../components/ErrorBoundary";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import {
  FiZap,
  FiHome,
  FiBriefcase,
  FiMessageSquare,
  FiDollarSign,
  FiLock,
  FiRefreshCw,
  FiUser,
  FiLogOut,
  FiBell,
  FiShield,
  FiArrowRight,
  FiSearch,
  FiClock,
  FiMenu,
  FiX,
  FiSend,
  FiBarChart2,
  FiTrendingUp,
  FiUpload,
  FiEye,
  FiFile,
  FiTrash2,
} from "react-icons/fi";
import "../../styles/dashboard.css";
import "../../styles/student.css";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem("student_activePage") || "home";
  });
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [jobs, setJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidMessage, setBidMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string>("");
  const [successBidData, setSuccessBidData] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  const [jobKeyword, setJobKeyword] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Earnings states
  const [totalEarned, setTotalEarned] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [setUserProfile] = useState<any>(null);

  useRoutePersistence();

  const [statsCards, setStatsCards] = useState([
    { icon: <FiBriefcase />, label: "TOTAL JOBS", value: 0, color: "#1a9c6e" },
    { icon: <FiTrendingUp />, label: "TOTAL BIDS", value: 0, color: "#3b82f6" },
    { icon: <FiBarChart2 />, label: "ACTIVE JOBS", value: 0, color: "#f97316" },
    {
      icon: <FiDollarSign />,
      label: "TOTAL EARNED",
      value: "₦0",
      color: "#8b5cf6",
    },
  ]);

  const categoryColors: Record<string, string> = {
    "Web & Software Dev": "#3b82f6",
    "Graphic Design & Branding": "#8b5cf6",
    "Digital Marketing": "#f97316",
    "Writing & Copywriting": "#10b981",
    "AI & Automation": "#06b6d4",
  };

  const handlePageChange = (page: string) => {
    sessionStorage.setItem("student_activePage", page);
    setActivePage(page);
    if (page === "messages") {
      setChatUnreadCount(0);
    }
  };
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/zip",
      ].includes(file.type);
      if (!isValidSize)
        addToast(`${file.name} is too large (max 5MB)`, "error");
      if (!isValidType) addToast(`${file.name} has invalid format`, "error");
      return isValidSize && isValidType;
    });
    setPortfolioFiles([...portfolioFiles, ...validFiles]);
  };

  const removePortfolioFile = (index: number) => {
    setPortfolioFiles(portfolioFiles.filter((_, i) => i !== index));
  };

  const uploadPortfolioFiles = async (
    bidId: string,
    uid: string,
  ): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of portfolioFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uid}/${bidId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolios")
        .upload(filePath, file);
      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolios").getPublicUrl(filePath);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
    if (!userId) return;
    fetchUnreadMessageCount();
    fetchUnreadNotificationCount();
    fetchEarningsData();
    fetchCategories();

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
        () => fetchUnreadMessageCount(),
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
        () => fetchUnreadNotificationCount(),
      )
      .subscribe();
    return () => {
      messageSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
    };
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("total_earned, total_jobs, full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  const fetchUnreadMessageCount = async () => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);
    setChatUnreadCount(count || 0);
  };

  const fetchUnreadNotificationCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  };

  const fetchEarningsData = async () => {
    if (!userId) return;

    setLoadingEarnings(true);
    try {
      // Get released payments (total earned)
      const { data: releasedData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("payee_id", userId)
        .eq("status", "released");

      const total =
        releasedData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      setTotalEarned(total);

      // Get held payments (in escrow)
      const { data: escrowData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("payee_id", userId)
        .eq("status", "held");

      const escrowTotal =
        escrowData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      setEscrowBalance(escrowTotal);

      // Get completed jobs count
      const { count: completedCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("payee_id", userId)
        .eq("status", "released");

      setCompletedJobsCount(completedCount || 0);

      // Get all transactions for history
      const { data: allTransactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("payee_id", userId)
        .order("created_at", { ascending: false });

      if (allTransactions && allTransactions.length > 0) {
        const jobIds = [
          ...new Set(allTransactions.map((tx) => tx.job_id).filter((id) => id)),
        ];

        if (jobIds.length > 0) {
          const { data: jobsData } = await supabase
            .from("jobs")
            .select("id, title")
            .in("id", jobIds);

          const jobTitleMap: Record<string, string> = {};
          jobsData?.forEach((job) => {
            jobTitleMap[job.id] = job.title;
          });

          const transactionsWithJobs = allTransactions.map((tx) => ({
            ...tx,
            jobs: { title: jobTitleMap[tx.job_id] || "Untitled Job" },
          }));
          setTransactions(transactionsWithJobs);
        } else {
          setTransactions(allTransactions);
        }
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoadingEarnings(false);
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
      await fetchUserProfile();
      await fetchJobs(user.id);
      await fetchMyBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchJobs = async (uid: string) => {
    setLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .eq("payment_status", "pending")
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        setJobs([]);
        return;
      }

      if (jobsData && jobsData.length > 0) {
        const clientIds = [
          ...new Set(jobsData.map((job) => job.created_by).filter(Boolean)),
        ];
        let profilesMap: Record<string, any> = {};
        if (clientIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", clientIds);
          if (profilesData) {
            profilesData.forEach((p) => {
              profilesMap[p.id] = p;
            });
          }
        }

        const jobsWithClients = jobsData.map((job) => ({
          ...job,
          client: profilesMap[job.created_by] || {
            full_name: "Client",
            avatar_url: null,
          },
        }));
        setJobs(jobsWithClients);

        const [totalBids, totalEarnedAmount] = await Promise.all([
          fetchTotalBidsCount(uid),
          fetchTotalEarned(uid),
        ]);

        setStatsCards([
          {
            icon: <FiBriefcase />,
            label: "TOTAL JOBS",
            value: jobsWithClients.length,
            color: "#1a9c6e",
          },
          {
            icon: <FiTrendingUp />,
            label: "TOTAL BIDS",
            value: totalBids,
            color: "#3b82f6",
          },
          {
            icon: <FiBarChart2 />,
            label: "ACTIVE JOBS",
            value: jobsWithClients.filter((j) => j.status === "open").length,
            color: "#f97316",
          },
          {
            icon: <FiDollarSign />,
            label: "TOTAL EARNED",
            value: `₦${totalEarnedAmount.toLocaleString()}`,
            color: "#8b5cf6",
          },
        ]);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Unexpected error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalBidsCount = async (uid: string) => {
    const { count } = await supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("student_id", uid);
    return count || 0;
  };

  const fetchTotalEarned = async (uid: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("amount")
      .eq("payee_id", uid)
      .eq("status", "released");

    return data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  };

  const fetchMyBids = async (studentId: string) => {
    if (!studentId) return;
    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        setMyBids([]);
        return;
      }

      if (!bidsData || bidsData.length === 0) {
        setMyBids([]);
        return;
      }

      const jobIds = [
        ...new Set(bidsData.map((bid) => bid.job_id).filter(Boolean)),
      ];
      let jobsMap: Record<string, any> = {};
      if (jobIds.length > 0) {
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .in("id", jobIds);
        if (jobsData) {
          jobsData.forEach((job) => {
            jobsMap[job.id] = job;
          });
        }
      }

      const clientIds = [
        ...new Set(
          Object.values(jobsMap)
            .map((job: any) => job?.created_by)
            .filter(Boolean),
        ),
      ];
      let profilesMap: Record<string, any> = {};
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", clientIds);
        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = p;
          });
        }
      }

      const enrichedBids = bidsData.map((bid) => {
        const job = jobsMap[bid.job_id];
        return {
          ...bid,
          job: job
            ? {
                ...job,
                client: profilesMap[job.created_by] || {
                  full_name: "Client",
                  avatar_url: null,
                },
              }
            : null,
        };
      });

      setMyBids(enrichedBids);
    } catch (err) {
      console.error("Error in fetchMyBids:", err);
      setMyBids([]);
    }
  };

  const fetchCategories = async () => {
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("category")
      .eq("status", "open");

    if (jobsData && jobsData.length > 0) {
      const categoryCounts: Record<string, number> = {};
      jobsData.forEach((job) => {
        if (job.category) {
          categoryCounts[job.category] =
            (categoryCounts[job.category] || 0) + 1;
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

  const checkExistingBid = async (jobId: string) => {
    const { data } = await supabase
      .from("bids")
      .select("id")
      .eq("job_id", jobId)
      .eq("student_id", userId)
      .maybeSingle();

    return !!data;
  };

  const handleBid = async () => {
    setBidError("");
    if (!bidAmount) {
      addToast("Please enter your bid amount", "error");
      return;
    }

    const existingBid = await checkExistingBid(selectedJob.id);
    if (existingBid) {
      addToast(
        "You have already placed a bid on this job. You cannot bid again.",
        "error",
      );
      setShowBidModal(false);
      setSubmitting(false);
      setUploadingFiles(false);
      return;
    }

    const { data: jobCheck } = await supabase
      .from("jobs")
      .select("status, payment_status")
      .eq("id", selectedJob.id)
      .single();

    if (jobCheck?.status !== "open" || jobCheck?.payment_status === "paid") {
      addToast(
        "This job is no longer available. It has been assigned to another student.",
        "error",
      );
      setShowBidModal(false);
      setSubmitting(false);
      setUploadingFiles(false);
      return;
    }

    const bidAmountNum = parseInt(bidAmount);
    if (bidAmountNum > selectedJob.budget) {
      addToast(
        `Your bid cannot exceed the job budget of ${formatBudget(selectedJob.budget)}`,
        "error",
      );
      return;
    }

    setSubmitting(true);
    setUploadingFiles(true);

    try {
      const { data: bidData, error: bidErr } = await supabase
        .from("bids")
        .insert([
          {
            job_id: selectedJob.id,
            student_id: userId,
            amount: bidAmountNum,
            proposal: bidMessage || "No additional message provided",
            status: "pending",
          },
        ])
        .select()
        .single();

      if (bidErr) {
        addToast(bidErr.message, "error");
        setSubmitting(false);
        setUploadingFiles(false);
        return;
      }

      const { error: rpcError } = await supabase.rpc("increment_bid_count", {
        job_id_param: selectedJob.id,
      });
      if (rpcError) console.error("Error incrementing bid count:", rpcError);

      if (portfolioFiles.length > 0) {
        const uploadedUrls = await uploadPortfolioFiles(bidData.id, userId);
        if (uploadedUrls.length > 0) {
          const portfolioInserts = uploadedUrls.map((url) => ({
            bid_id: bidData.id,
            file_url: url,
            student_id: userId,
            created_at: new Date(),
          }));
          await supabase.from("portfolio_files").insert(portfolioInserts);
        }
      }

      addToast(
        `Bid placed successfully for "${selectedJob.title}"!`,
        "success",
      );
      setSuccessBidData({
        jobTitle: selectedJob.title,
        amount: bidAmountNum,
        clientName: selectedJob?.client?.full_name || "the client",
      });
      setShowBidModal(false);
      setBidAmount("");
      setBidMessage("");
      setPortfolioFiles([]);
      setShowSuccessModal(true);
      await fetchMyBids(userId);
      await fetchJobs(userId);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      console.error("Error placing bid:", err);
      addToast("Failed to place bid. Please try again.", "error");
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
  };

  const openBidModal = (job: any) => {
    setSelectedJob(job);
    setShowBidModal(true);
    setBidAmount("");
    setBidMessage("");
    setPortfolioFiles([]);
    setBidError("");
  };

  const handleLogout = () => setShowConfirmModal(true);

  const confirmLogout = async () => {
    sessionStorage.clear();
    await supabase.auth.signOut();
    addToast("Logged out successfully.", "info");
    navigate("/login");
    setShowConfirmModal(false);
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(budget || 0);
  };

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
    { icon: <FiDollarSign />, label: "Earn", key: "earnings" },
  ];

  const JobCard = ({
    job,
    onClick,
    showApplyButton = true,
    isBid = false,
    bidStatus = null,
  }: any) => {
    if (!job) return null;
    return (
      <div className="job-day-card" onClick={onClick}>
        {isBid && bidStatus && (
          <div className={`bid-status-badge ${bidStatus}`}>
            {bidStatus === "accepted"
              ? "✓ Accepted"
              : bidStatus === "rejected"
                ? "✗ Rejected"
                : "⏳ Pending"}
          </div>
        )}
        <div className="job-day-header">
          <div className="company-badge">
            {job?.client?.avatar_url ? (
              <img
                src={job.client.avatar_url}
                alt={job?.client?.full_name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            ) : (
              job?.client?.full_name?.charAt(0).toUpperCase() || "C"
            )}
          </div>
          <div className="company-details">
            <h4>{job?.client?.full_name || "Company"}</h4>
            <p>
              <span>📍</span> {job?.location || "Remote"}
            </p>
          </div>
        </div>
        <h3 className="job-day-title">{job?.title || "Untitled Job"}</h3>
        <p className="job-posted">
          <FiClock /> Posted{" "}
          {job?.created_at
            ? new Date(job.created_at).toLocaleDateString()
            : "Recently"}
        </p>
        <p className="job-description">
          {job?.description?.substring(0, 100)}...
        </p>
        <div className="job-day-footer">
          <div className="price">
            <span className="amount">
              {job?.budget ? formatBudget(job.budget) : "—"}
            </span>
            <span className="unit">/project</span>
          </div>
          {showApplyButton && (
            <button
              className="apply-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activePage) {
      case "jobs": {
        const filteredJobs = jobKeyword
          ? jobs.filter((job) =>
              job?.title?.toLowerCase().includes(jobKeyword.toLowerCase()),
            )
          : jobs;
        return (
          <div className="jobs-page">
            <div className="page-header">
              <h2>Browse All Jobs</h2>
              <p>Find the perfect opportunity for your skills</p>
            </div>
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Search jobs..."
                value={jobKeyword}
                onChange={(e) => setJobKeyword(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="loading-state">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-state">No jobs available yet</div>
            ) : (
              <div className="jobs-day-grid">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => openBidModal(job)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }

      case "bids":
        return (
          <div className="bids-page">
            <div className="page-header">
              <h2>My Bids</h2>
              <p>Track all your job proposals</p>
            </div>
            {myBids.length === 0 ? (
              <div className="empty-state">
                <p>No bids yet. Browse jobs to get started!</p>
                <button
                  className="btn-primary"
                  onClick={() => handlePageChange("jobs")}
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="jobs-day-grid">
                {myBids
                  .filter((bid: any) => bid.job != null)
                  .map((bid: any) => (
                    <JobCard
                      key={bid.id}
                      job={bid.job}
                      isBid={true}
                      bidStatus={bid.status}
                      showApplyButton={false}
                      onClick={() => {}}
                    />
                  ))}
              </div>
            )}
          </div>
        );

      case "messages":
        return <ChatPage userId={userId} userRole="student" />;

      case "earnings":
        return (
          <ErrorBoundary>
            <div className="earnings-page">
              <div
                className="page-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2>Payments & Escrow</h2>
                  <p>Track all your payments</p>
                </div>
                <button
                  onClick={async () => {
                    await fetchEarningsData();
                    const newTotal = await fetchTotalEarned(userId);
                    setStatsCards((prev) =>
                      prev.map((card) =>
                        card.label === "TOTAL EARNED"
                          ? { ...card, value: `₦${newTotal.toLocaleString()}` }
                          : card,
                      ),
                    );
                    addToast("Earnings refreshed!", "success");
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#1a9c6e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <FiRefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* Hero Section */}
              <div className="earnings-hero">
                <div className="earnings-total">
                  <span className="earnings-label">TOTAL EARNED</span>
                  <div className="earnings-amount">
                    {formatBudget(totalEarned)}
                  </div>
                  <p className="earnings-note">
                    Lifetime earnings on CampusFreelance
                  </p>
                </div>
                <div className="earnings-stats">
                  <div className="stat-badge">
                    <span className="stat-value">
                      {formatBudget(escrowBalance)}
                    </span>
                    <span className="stat-label">IN ESCROW</span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-value">{completedJobsCount}</span>
                    <span className="stat-label">JOBS DONE</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="transactions-card">
                <div className="card-header">
                  <h3>Payment History</h3>
                </div>
                {loadingEarnings ? (
                  <div className="loading-state">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="empty-state small">
                    <FiDollarSign className="empty-icon" />
                    <p>
                      No payments yet. When clients pay for your work, they'll
                      appear here.
                    </p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div className="transaction-item" key={tx.id}>
                      <div className="transaction-icon">
                        <FiDollarSign />
                      </div>
                      <div className="transaction-info">
                        <p className="transaction-title">
                          {tx.jobs?.title || "Job Payment"}
                        </p>
                        <p className="transaction-sub">
                          {tx.status === "released"
                            ? "Released to you"
                            : "Held in escrow"}{" "}
                          · {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="transaction-right">
                        <span className="transaction-amount">
                          {formatBudget(tx.amount)}
                        </span>
                        <span
                          className={`transaction-status ${tx.status === "released" ? "success" : "pending"}`}
                        >
                          {tx.status === "released"
                            ? "✓ Released"
                            : "⏳ In Escrow"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Info Card */}
              <div className="info-card">
                <FiShield className="info-icon" />
                <div>
                  <h4>How payments work</h4>
                  <p>
                    When a client pays for your work, funds are held in escrow.
                    Once the job is completed and the client confirms, payment
                    is released to you automatically.
                  </p>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        );

      case "profile":
        return (
          <div className="profile-page">
            <div className="profile-card">
              <div className="profile-avatar">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={userName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  userName?.charAt(0).toUpperCase()
                )}
              </div>
              <h3>{userName}</h3>
              <p>Student</p>
            </div>
            <div className="profile-form">
              <h3>Personal Information</h3>
              <input type="text" value={userName} disabled />
              <textarea placeholder="Bio / Skills" rows={3} />
              <button className="btn-primary">Update Profile</button>
            </div>
          </div>
        );

      default:
        return (
          <div className="student-home">
            <div className="hero-section-kkw">
              <div className="hero-content-kkw">
                <h1>
                  Find your dream jobs in{" "}
                  <span className="highlight">Akungba</span>
                </h1>
                <div className="welcome-message">Welcome back, {userName}</div>
                <div className="hero-search-kkw">
                  <div className="search-field-kkw">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Job title or keywords"
                      value={jobKeyword}
                      onChange={(e) => setJobKeyword(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handlePageChange("jobs")
                      }
                    />
                  </div>
                  <button
                    className="search-btn-kkw"
                    onClick={() => handlePageChange("jobs")}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            <div className="stats-cards-section">
              <div className="stats-cards-grid">
                {statsCards.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div
                      className="stat-icon"
                      style={{
                        backgroundColor: `${stat.color}15`,
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="categories-section-jw">
              <div className="section-header-jw">
                <div>
                  <h2>Browse by category</h2>
                  <p>Find the job that's perfect for you</p>
                </div>
                <button
                  className="view-all-jw"
                  onClick={() => handlePageChange("jobs")}
                >
                  View all <FiArrowRight />
                </button>
              </div>
              <div className="categories-grid-jw" ref={categoriesScrollRef}>
                {categories.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    No categories yet
                  </p>
                ) : (
                  categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="category-card-jw"
                      onClick={() => handlePageChange("jobs")}
                    >
                      <div
                        className="category-icon-jw"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        <FiBriefcase />
                      </div>
                      <h3>{cat.name}</h3>
                      <p>{cat.count} jobs available</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="jobs-day-section">
              <div className="section-header-jw">
                <div>
                  <h2>Recent Jobs</h2>
                  <p>Latest opportunities from clients</p>
                </div>
                <button
                  className="view-all-jw"
                  onClick={() => handlePageChange("jobs")}
                >
                  View all jobs <FiArrowRight />
                </button>
              </div>
              {loading ? (
                <div className="loading-state">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <p>No jobs available yet. Check back later!</p>
                </div>
              ) : (
                <div className="jobs-day-grid">
                  {jobs.slice(0, 6).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={() => openBidModal(job)}
                    />
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
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={userName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
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

      <div
        className={`sidebar-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`sidebar-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header-right">
          <button
            onClick={() => setDrawerOpen(false)}
            className="drawer-close-btn-right"
          >
            <FiX />
          </button>
        </div>
        <nav className="drawer-nav">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? "nav-item-active" : ""}`}
              onClick={() => {
                handlePageChange(item.key);
                setDrawerOpen(false);
              }}
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
                <img
                  src={profile.avatar_url}
                  alt={userName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
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
            <div className="topbar-left">
              {isMobile && (
                <button
                  className="mobile-menu-btn"
                  onClick={() => setDrawerOpen(true)}
                >
                  <FiMenu />
                </button>
              )}
            </div>
            <div className="topbar-logo-center">
              <div
                className="logo-wrapper"
                onClick={() => handlePageChange("home")}
              >
                <FiZap className="logo-icon-topbar" />
                <span className="logo-text-topbar">CampusFreelance</span>
              </div>
            </div>
            <div className="topbar-actions">
              <div className="notification-wrapper">
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
                  <>
                    <div
                      className="notifications-backdrop"
                      onClick={() => setShowNotifications(false)}
                    />
                    <NotificationsPopup
                      userId={userId}
                      onClose={() => setShowNotifications(false)}
                    />
                  </>
                )}
              </div>
              <div
                className="profile-avatar-topbar"
                onClick={() => handlePageChange("profile")}
              >
                <div className="student-topbar-avatar">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={userName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
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
        <div className="bottom-nav">
          {bottomNavItems.map((item) => (
            <button
              key={item.key}
              className={`bottom-nav-item ${activePage === item.key ? "active" : ""}`}
              onClick={() => handlePageChange(item.key)}
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

      {showBidModal && selectedJob && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBidModal(false);
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <h2>Place a Bid</h2>
              <button
                onClick={() => setShowBidModal(false)}
                className="modal-close"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="job-info">
                <div className="job-info-title">{selectedJob?.title}</div>
                <div className="job-info-budget">
                  Budget: {formatBudget(selectedJob?.budget)}
                </div>
              </div>

              {bidError && <div className="error-message">{bidError}</div>}

              <div className="form-group">
                <label>
                  <FiDollarSign size={16} /> Your Bid Amount (₦)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                />
                <small>Maximum: {formatBudget(selectedJob?.budget)}</small>
              </div>

              <div className="form-group">
                <label>
                  <FiUpload size={16} /> Upload Portfolio
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                  multiple
                  style={{ display: "none" }}
                />
                <div className="portfolio-upload-area">
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={handleFileSelect}
                  >
                    <FiUpload /> Choose Files
                  </button>
                  <span className="upload-hint">
                    PDF, Images, or ZIP (max 5MB each)
                  </span>
                </div>

                {portfolioFiles.length > 0 && (
                  <div className="uploaded-files">
                    {portfolioFiles.map((file, index) => (
                      <div key={index} className="uploaded-file">
                        <FiFile size={14} />
                        <span>{file.name}</span>
                        <button onClick={() => removePortfolioFile(index)}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiMessageSquare size={16} /> Message to Client (Optional)
                </label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're the best fit for this job..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleBid}
                disabled={submitting || uploadingFiles}
                className="btn-submit"
              >
                {submitting || uploadingFiles ? (
                  <>
                    Processing... <FiLock />
                  </>
                ) : (
                  <>
                    Submit Bid <FiSend />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && successBidData && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <div className="success-modal-container">
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="check-line tip"></span>
                  <span className="check-line long"></span>
                  <div className="check-circle"></div>
                </div>
              </div>
            </div>

            <h2 className="success-title">Bid Placed Successfully!</h2>
            <p className="success-message">
              Your bid has been submitted to{" "}
              <strong>{successBidData.clientName}</strong>
            </p>

            <div className="bid-details-card">
              <div className="bid-detail-item">
                <span className="bid-detail-label">Job Title</span>
                <span className="bid-detail-value">
                  {successBidData.jobTitle}
                </span>
              </div>
              <div className="bid-detail-item">
                <span className="bid-detail-label">Your Bid Amount</span>
                <span className="bid-detail-value highlight">
                  {formatBudget(successBidData.amount)}
                </span>
              </div>
            </div>

            <div className="success-actions">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handlePageChange("bids");
                }}
                className="success-btn-primary"
              >
                <FiEye size={16} /> View My Bids
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="success-btn-secondary"
              >
                <FiArrowRight size={16} /> Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default StudentDashboard;
