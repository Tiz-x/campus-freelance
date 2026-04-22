import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { 
  FiZap, FiUser, FiBriefcase, FiPhone, FiMail, 
  FiCamera, FiUpload, FiArrowRight, FiCheckCircle, FiUsers 
} from "react-icons/fi";
import "../../styles/auth.css";

const SMEProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserName(user.user_metadata?.full_name || "");
      }
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.company_name) {
      setError("Company name is required");
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }

    if (!avatarFile) {
      setError("Please upload a profile photo");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const avatarUrl = await uploadAvatar(user.id);
      
      if (!avatarUrl) {
        setError("Failed to upload photo. Please try again.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.company_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          avatar_url: avatarUrl,
          is_verified: true
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/sme");
        }, 2000);
      }
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="role-page">
        <div className="role-header">
          <div className="auth-logo" onClick={() => navigate("/")}>
            <FiZap className="logo-icon" />
            <span>CampusFreelance</span>
          </div>
        </div>
        <div className="role-content">
          <div className="setup-box">
            <div className="verify-icon">
              <FiCheckCircle />
            </div>
            <h1>Profile Complete!</h1>
            <p>Your business profile has been created.</p>
            <p style={{ color: "#1a9c6e", marginTop: "1rem" }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-page">
      {/* <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div> */}

      <div className="role-content">
        <div className="setup-box">
          <div className="verify-icon">
            <FiUsers />
          </div>
          <h1>Complete Your Business Profile</h1>
          <p>Tell students about your business</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Profile Photo */}
            <div className="form-group">
              <label><FiCamera /> Profile Photo *</label>
              <div className="photo-upload-wrap">
                <div 
                  className="photo-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                    required
                  />
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Profile preview" className="photo-preview" />
                      <div className="photo-camera-btn">
                        <FiCamera />
                      </div>
                    </>
                  ) : (
                    <div className="photo-placeholder">
                      <FiUpload className="photo-placeholder-icon" />
                      <p>Upload</p>
                    </div>
                  )}
                </div>
                <p className="photo-hint">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="form-group">
              <label><FiUser /> Full Name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input type="text" value={userName} disabled />
              </div>
            </div>

            <div className="form-group">
              <label><FiMail /> Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input type="email" value={userEmail} disabled />
              </div>
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Company / Business Name *</label>
              <div className="input-wrap">
                <FiBriefcase className="input-icon" />
                <input
                  type="text"
                  name="company_name"
                  placeholder="Enter your business name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label><FiPhone /> Phone Number *</label>
              <div className="input-wrap">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* <div className="form-group">
              <label><FiMapPin /> Business Address</label>
              <div className="input-wrap">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="Enter your business address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div> */}

            <div className="form-group">
              <label><FiUser /> About Your Business</label>
              <textarea
                name="bio"
                rows={4}
                className="textarea-input"
                placeholder="Tell students what your business does..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SMEProfileSetup;