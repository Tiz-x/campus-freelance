import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase"; 
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, 
  FiBookOpen, FiFolder, FiFile, FiDownload,
  FiEdit2, FiSave, FiX, FiArrowLeft
} from "react-icons/fi";
import { ToastContainer, useToast } from "../../../components/Toast";  // Fixed path
import "../../../styles/student-profile.css";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    matric_number: "",
    department: "",
    faculty: "",
    level: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchPortfolio();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) throw error;

        setProfile({
          full_name: data.full_name || "",
          email: currentUser.email || "",
          matric_number: data.matric_number || "",
          department: data.department || "",
          faculty: data.faculty || "",
          level: data.level || "",
          phone: data.phone || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      addToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPortfolioItems(data || []);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            matric_number: profile.matric_number,
            department: profile.department,
            faculty: profile.faculty,
            level: profile.level,
            phone: profile.phone,
            bio: profile.bio,
          })
          .eq('id', currentUser.id);

        if (error) throw error;
        addToast("Profile updated successfully!", "success");
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const openPortfolioModal = (item: PortfolioItem) => {
    setSelectedPortfolio(item);
  };

  const closePortfolioModal = () => {
    setSelectedPortfolio(null);
  };

  if (loading) {
    return (
      <div className="student-profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <div className="student-profile-header">
        <button onClick={() => navigate("/dashboard/student")} className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1>My Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="edit-btn">
            <FiEdit2 /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button onClick={() => setEditing(false)} className="cancel-btn">
              <FiX /> Cancel
            </button>
            <button onClick={handleUpdate} className="save-btn">
              <FiSave /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="student-profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} />
            ) : (
              <div className="avatar-placeholder">
                <FiUser size={48} />
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {!editing ? (
              <>
                <h2>{profile.full_name}</h2>
                <p className="profile-email"><FiMail /> {profile.email}</p>
                {profile.matric_number && (
                  <p className="profile-matric"><FiMapPin /> Matric: {profile.matric_number}</p>
                )}
                {profile.department && (
                  <p className="profile-dept"><FiBriefcase /> {profile.department}</p>
                )}
                {profile.faculty && (
                  <p className="profile-faculty"><FiBookOpen /> {profile.faculty}</p>
                )}
                {profile.level && (
                  <p className="profile-level"><FiBookOpen /> {profile.level}</p>
                )}
                {profile.phone && (
                  <p className="profile-phone"><FiPhone /> {profile.phone}</p>
                )}
                {profile.bio && (
                  <div className="profile-bio">
                    <h3>About Me</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Matriculation Number</label>
                  <input
                    type="text"
                    value={profile.matric_number}
                    onChange={(e) => setProfile({...profile, matric_number: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Faculty</label>
                  <input
                    type="text"
                    value={profile.faculty}
                    onChange={(e) => setProfile({...profile, faculty: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <input
                    type="text"
                    value={profile.level}
                    onChange={(e) => setProfile({...profile, level: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="portfolio-section">
          <div className="portfolio-header">
            <h2><FiFolder /> My Portfolio</h2>
            <p className="portfolio-count">{portfolioItems.length} items</p>
          </div>
          
          {portfolioItems.length === 0 ? (
            <div className="empty-portfolio">
              <FiFolder size={48} />
              <p>No portfolio items yet</p>
              <p className="empty-hint">Upload your work samples during verification</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolioItems.map((item) => (
                <div key={item.id} className="portfolio-card" onClick={() => openPortfolioModal(item)}>
                  <div className="portfolio-preview">
                    {item.file_type.startsWith('image/') ? (
                      <img src={item.file_url} alt={item.title} />
                    ) : (
                      <div className="file-preview">
                        <FiFile size={32} />
                      </div>
                    )}
                  </div>
                  <div className="portfolio-info">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description.substring(0, 60)}...</p>}
                    <a href={item.file_url} download={item.file_name} className="download-link" onClick={(e) => e.stopPropagation()}>
                      <FiDownload /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Modal */}
      {selectedPortfolio && (
        <div className="portfolio-modal-overlay" onClick={closePortfolioModal}>
          <div className="portfolio-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePortfolioModal}>
              <FiX />
            </button>
            <div className="modal-body">
              <h2>{selectedPortfolio.title}</h2>
              {selectedPortfolio.description && <p>{selectedPortfolio.description}</p>}
              {selectedPortfolio.file_type.startsWith('image/') ? (
                <img src={selectedPortfolio.file_url} alt={selectedPortfolio.title} />
              ) : selectedPortfolio.file_type === 'application/pdf' ? (
                <iframe src={selectedPortfolio.file_url} title={selectedPortfolio.title} />
              ) : (
                <div className="file-download-section">
                  <FiFile size={64} />
                  <p>{selectedPortfolio.file_name}</p>
                  <a href={selectedPortfolio.file_url} download className="download-btn">
                    <FiDownload /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default StudentProfilePage;