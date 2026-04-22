import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiZap, FiUpload, FiUser, FiMail, FiHash, FiCamera, FiCheckCircle, FiArrowRight, FiShield } from "react-icons/fi";
import "../styles/auth.css";

const VerifyStudentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    matric_number: "",
  });
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadSelfie = async (userId: string): Promise<string | null> => {
    if (!selfieFile) return null;
    
    const fileExt = selfieFile.name.split('.').pop();
    const fileName = `${userId}/selfie.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, selfieFile, { upsert: true });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.matric_number || formData.matric_number.length < 9) {
      setError("Please enter a valid matriculation number");
      setLoading(false);
      return;
    }

    if (!selfieFile) {
      setError("Please upload a clear selfie photo");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const selfieUrl = await uploadSelfie(user.id);
      
      if (!selfieUrl) {
        setError("Failed to upload selfie. Please try again.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          matric_number: formData.matric_number,
          selfie_url: selfieUrl,
          is_verified: true
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/student");
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
          <div className="verify-box">
            <div className="verify-icon">
              <FiCheckCircle />
            </div>
            <h1>Verification Submitted!</h1>
            <p>Your student status is being verified.</p>
            <p style={{ color: "#1a9c6e", marginTop: "1rem" }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div>

      <div className="role-content">
        <div className="verify-box">
          <div className="verify-icon">
            <FiShield />
          </div>
          <h1>Verify Your Student Status</h1>
          <p>Enter your AAUA matriculation number and upload a clear selfie</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleVerify}>
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
              <label><FiHash /> Matriculation Number *</label>
              <div className="input-wrap">
                <input
                  type="text"
                  name="matric_number"
                  placeholder="e.g., 230502170"
                  value={formData.matric_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <small>Format: 9-digit number (e.g., 230502170)</small>
            </div>

            <div className="form-group">
              <label><FiCamera /> Clear Selfie Photo *</label>
              <div className="photo-upload-wrap">
                <div 
                  className="photo-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleSelfieUpload}
                    style={{ display: "none" }}
                    required
                  />
                  {selfiePreview ? (
                    <>
                      <img src={selfiePreview} alt="Selfie preview" className="photo-preview" />
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

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyStudentPage;