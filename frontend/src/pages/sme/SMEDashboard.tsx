import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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
  FiMapPin,
  FiCheckCircle,
  FiUsers,
  FiArrowRight,
  FiStar,
  FiX,
  FiCheck,
  FiXCircle,
  FiEye,
  FiClock,
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
      fetchJobs(user.id);
      fetchBids(user.id);
    } else {
      navigate("/login");
    }
  };

  const fetchJobs = async (smeId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', smeId)
        .order('created_at', { ascending: false });

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
        .from('jobs')
        .select('id, title, budget, status')
        .eq('created_by', smeId);

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
      }

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(job => job.id);
        
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('*')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (bidsError) {
          console.error("Error fetching bids:", bidsError);
        } else {
          const bidsWithProfiles = await Promise.all(
            (bidsData || []).map(async (bid) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', bid.student_id)
                .single();
              
              const job = jobsData.find(j => j.id === bid.job_id);
              
              return {
                ...bid,
                profiles: profileData || { full_name: 'Student', email: '' },
                jobs: job
              };
            })
          );
          
          setBids(bidsWithProfiles);
        }
      }
    } catch (error) {
      console.error("Error in fetchBids:", error);
    }
  };

  const handleAcceptBid = async (bidId: string, jobId: string) => {
    setProcessingBid(true);
    
    try {
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (bidError) {
        console.error("Error accepting bid:", bidError);
        alert(`Failed to accept bid: ${bidError.message}`);
        setProcessingBid(false);
        return;
      }

      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('id', bidId);

      if (rejectError) {
        console.error("Error rejecting other bids:", rejectError);
      }

      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', jobId);

      if (jobError) {
        console.error("Error updating job:", jobError);
        alert(`Failed to update job: ${jobError.message}`);
      } else {
        alert("Bid accepted successfully! Other bids have been rejected.");
        fetchBids(userId);
        fetchJobs(userId);
        setShowBidsModal(false);
      }
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
        .from('bids')
        .update({ status: 'rejected' })
        .eq('id', bidId);

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

  const viewJobBids = (job: any) => {
    setSelectedJob(job);
    setShowBidsModal(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(budget);
  };

  const getBidCount = (jobId: string) => {
    return bids.filter(bid => bid.job_id === jobId).length;
  };

  const getJobBids = (jobId: string) => {
    return bids.filter(bid => bid.job_id === jobId);
  };

  const stats = [
    { icon: <FiBriefcase />, label: "Total Jobs", value: jobs.length.toString(), color: "stat-green" },
    { icon: <FiUsers />, label: "Total Bids", value: bids.length.toString(), color: "stat-blue" },
    { icon: <FiCheckCircle />, label: "Active Jobs", value: jobs.filter(j => j.status === 'open').length.toString(), color: "stat-purple" },
    { icon: <FiDollarSign />, label: "Total Spent", value: "₦0", color: "stat-orange" },
  ];

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", key: "home" },
    { icon: <FiBriefcase />, label: "My Jobs", key: "jobs" },
    { icon: <FiUsers />, label: "Browse Students", key: "students" },
    { icon: <FiMessageSquare />, label: "Messages", key: "messages", badge: bids.filter(b => b.status === 'pending').length.toString() },
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
              <button className="btn-primary" onClick={() => navigate("/post-job")}>
                <FiPlus /> Post New Job
              </button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
                <p>You haven't posted any jobs yet.</p>
                <button className="btn-primary" onClick={() => navigate("/post-job")} style={{ marginTop: "1rem" }}>
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="jobs-card-grid">
                {jobs.map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <span className="job-card-category">{job.category}</span>
                      <span className={`job-status ${job.status === 'open' ? 'status-open' : job.status === 'in_progress' ? 'status-progress' : 'status-completed'}`}>
                        {job.status === 'open' ? 'Open' : job.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>
                    <h3 className="job-card-title">{job.title}</h3>
                    <p className="job-card-desc">{job.description?.substring(0, 100)}...</p>
                    <div className="job-card-meta">
                      <span><FiClock /> {job.duration || "Not specified"}</span>
                      <span><FiMapPin /> {job.location || "Remote"}</span>
                      <span><FiUsers /> {getBidCount(job.id)} bids</span>
                    </div>
                    <div className="job-card-footer">
                      <div>
                        <span className="job-card-budget">{formatBudget(job.budget)}</span>
                        {job.status === 'in_progress' && (
                          <span style={{ 
                            display: "block", 
                            fontSize: "0.7rem", 
                            color: "#856404",
                            marginTop: "0.25rem"
                          }}>
                            <FiClock size={10} /> In Progress - Student Hired
                          </span>
                        )}
                      </div>
                      <button 
                        className="btn-primary btn-small" 
                        onClick={() => viewJobBids(job)}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        <FiEye /> View Bids ({getBidCount(job.id)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case "students":
        return <div style={{ padding: "2rem", textAlign: "center" }}>Browse Students - Coming Soon!</div>;
      case "messages":
        return <div style={{ padding: "2rem", textAlign: "center" }}>Messages - Coming Soon!</div>;
      case "payments":
        return <div style={{ padding: "2rem", textAlign: "center" }}>Payments - Coming Soon!</div>;
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
              <h2 className="section-title">Recent Bids</h2>
              <button className="card-link" onClick={() => setActivePage("jobs")}>
                View all jobs <FiArrowRight />
              </button>
            </div>

            {bids.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px" }}>
                <p>No bids yet. When students bid on your jobs, they'll appear here.</p>
              </div>
            ) : (
              <div className="bidders-grid">
                {bids.slice(0, 3).map((bid) => (
                  <div className="bidder-card" key={bid.id}>
                    <div className="bidder-header">
                      <div className="bidder-avatar">{bid.profiles?.full_name?.charAt(0).toUpperCase() || "S"}</div>
                      <div className="bidder-details">
                        <p className="bidder-name">{bid.profiles?.full_name || "Student"}</p>
                        <span className="bidder-job">{bid.jobs?.title || "Unknown Job"}</span>
                      </div>
                    </div>
                    <div className="bidder-stats">
                      <div className="bidder-rating">
                        <FiStar className="star" />
                        <span className="rating-score">
                          {bid.amount ? `₦${bid.amount.toLocaleString()}` : "New"}
                        </span>
                      </div>
                      <div className="bidder-completed">
                        <span className={`job-status ${bid.jobs?.status === 'open' ? 'status-open' : bid.jobs?.status === 'in_progress' ? 'status-progress' : 'status-completed'}`}>
                          {bid.jobs?.status === 'open' ? 'Open' : bid.jobs?.status === 'in_progress' ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="bidder-footer">
                      <div className="bid-price">
                        <span className="price-amount">
                          {bid.status === 'accepted' ? '✓ Accepted' : 
                           bid.status === 'rejected' ? '✗ Rejected' : 
                           formatBudget(bid.amount)}
                        </span>
                        <span className="price-label">
                          {bid.status === 'accepted' ? 'Hired' : 
                           bid.status === 'rejected' ? 'Not Selected' : 
                           'Bid Amount'}
                        </span>
                      </div>
                      <div className="bidder-actions">
                        <button className="btn-outline btn-small" onClick={() => {
                          setSelectedJob(bid.jobs);
                          setShowBidsModal(true);
                        }}>
                          <FiEye /> View
                        </button>
                        {bid.status === 'pending' && bid.jobs?.status === 'open' && (
                          <button className="btn-primary btn-small" onClick={() => handleAcceptBid(bid.id, bid.job_id)}>
                            Accept
                          </button>
                        )}
                        {bid.status === 'accepted' && (
                          <button className="btn-outline btn-small" disabled style={{ opacity: 0.6 }}>
                            <FiCheck /> Hired
                          </button>
                        )}
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
              <div className="quick-action-card" onClick={() => navigate("/post-job")}>
                <div className="quick-action-icon qa-green"><FiPlus /></div>
                <p>Post a Job</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("jobs")}>
                <div className="quick-action-icon qa-blue"><FiBriefcase /></div>
                <p>My Jobs</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("messages")}>
                <div className="quick-action-icon qa-purple"><FiMessageSquare /></div>
                <p>Messages</p>
              </div>
              <div className="quick-action-card" onClick={() => setActivePage("payments")}>
                <div className="quick-action-icon qa-orange"><FiDollarSign /></div>
                <p>Payments</p>
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
          {navItems.map((item) => (
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
            <div className="sidebar-avatar">{userName.charAt(0).toUpperCase()}</div>
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

      <main className="dashboard-main">
        <div className="topbar">
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
              {activePage === "home" && `You have ${bids.filter(b => b.status === 'pending').length} pending bids to review`}
              {activePage === "jobs" && "Manage all your posted jobs"}
              {activePage === "students" && "Find the right student for your job"}
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
              <button className="btn-primary post-job-btn" onClick={() => navigate("/post-job")}>
                <FiPlus /> Post a Job
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </main>

      {/* Bids Modal */}
      {showBidsModal && selectedJob && (
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
            borderRadius: "20px",
            width: "90%",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflow: "auto",
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0 }}>Bids for: {selectedJob.title}</h2>
              <button onClick={() => setShowBidsModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
                <FiX />
              </button>
            </div>

            <p><strong>Job Budget:</strong> {formatBudget(selectedJob.budget)}</p>
            <p><strong>Status:</strong> <span className={`job-status ${selectedJob.status === 'open' ? 'status-open' : selectedJob.status === 'in_progress' ? 'status-progress' : 'status-completed'}`}>
              {selectedJob.status === 'open' ? 'Open' : selectedJob.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </span></p>

            <div style={{ marginTop: "1.5rem" }}>
              <h3>All Bids ({getJobBids(selectedJob.id).length})</h3>
              
              {getJobBids(selectedJob.id).length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", background: "#f8f9fa", borderRadius: "12px" }}>
                  <p>No bids yet for this job.</p>
                </div>
              ) : (
                getJobBids(selectedJob.id).map((bid) => (
                  <div key={bid.id} style={{
                    background: bid.status === 'accepted' ? "#d4edda" : bid.status === 'rejected' ? "#f8d7da" : "white",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                          {bid.profiles?.full_name || "Student"}
                        </p>
                        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                          {bid.profiles?.email || "No email"}
                        </p>
                        <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                          <strong>Bid Amount:</strong> {formatBudget(bid.amount)}
                        </p>
                        <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                          <strong>Proposal:</strong> {bid.proposal}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#666" }}>
                          <strong>Submitted:</strong> {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: bid.status === 'pending' ? "#fff3cd" : bid.status === 'accepted' ? "#d4edda" : "#f8d7da",
                          color: bid.status === 'pending' ? "#856404" : bid.status === 'accepted' ? "#155724" : "#721c24",
                        }}>
                          {bid.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {bid.status === 'pending' && selectedJob.status === 'open' && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #ddd" }}>
                        <button
                          onClick={() => handleAcceptBid(bid.id, selectedJob.id)}
                          disabled={processingBid}
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
                          }}
                        >
                          <FiCheck /> Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          disabled={processingBid}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <FiXCircle /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .job-status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .status-open {
          background: #d4edda;
          color: #155724;
        }
        .status-progress {
          background: #fff3cd;
          color: #856404;
        }
        .status-completed {
          background: #cce5ff;
          color: #004085;
        }
      `}</style>
    </div>
  );
};

export default SMEDashboard;