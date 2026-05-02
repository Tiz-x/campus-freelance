import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useToast, ToastContainer } from '../../components/Toast';
import { 
  FiZap, FiUser, FiBriefcase, FiPhone, FiMail, 
  FiCamera, FiUpload, FiArrowRight, FiCheckCircle, FiUsers
} from "react-icons/fi";
import "../../styles/auth.css";

const SMEProfileSetup = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
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
  const [fieldErrors, setFieldErrors] = useState({
    company_name: "",
    phone: "",
    avatar: "",
  });

  // Nigerian phone number validation function
  const validateNigerianPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    const patterns = [
      /^(080|081|070|090|091|0701|0702|0703|0802|0803|0805|0806|0807|0808|0809|0810|0811|0812|0813|0814|0815|0816|0817|0818|0901|0902|0903|0904|0905|0906|0907|0908|0909|0912|0913|0915|0916)[0-9]{7,8}$/,
      /^[0-9]{11}$/,
      /^\+234[0-9]{10}$/,
      /^234[0-9]{10}$/,
    ];
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    
    if (name === 'phone' && value) {
      if (!validateNigerianPhone(value)) {
        setFieldErrors({ ...fieldErrors, phone: "Please enter a valid Nigerian phone number" });
      } else {
        setFieldErrors({ ...fieldErrors, phone: "" });
      }
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("Image must be less than 5MB", 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast("Please upload an image file", 'error');
        return;
      }
      setAvatarFile(file);
      setFieldErrors({ ...fieldErrors, avatar: "" });
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
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
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

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { company_name: "", phone: "", avatar: "" };
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
      isValid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validateNigerianPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Nigerian phone number";
      isValid = false;
    }
    
    if (!avatarFile && !avatarPreview) {
      newErrors.avatar = "Profile photo is required";
      isValid = false;
    }
    
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      addToast("Please fill in all required fields correctly", 'error');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      let avatarUrl = null;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id);
        if (!avatarUrl) {
          addToast("Failed to upload photo. Please try again.", 'error');
          setLoading(false);
          return;
        }
      }

      const updateData: any = {
        full_name: formData.company_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        is_verified: true,
        role: 'sme'
      };
      
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        addToast(updateError.message, 'error');
      } else {
        await refreshProfile();
        setSuccess(true);
        addToast("Profile completed successfully!", 'success');
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
      <div className="role-content">
        <div className="setup-box">
          <div className="verify-icon">
            <FiUsers />
          </div>
          <h1>Complete Your Business Profile</h1>
          <p>Tell students about your business</p>

          <form onSubmit={handleSubmit}>
            {/* Profile Photo */}
            <div className="form-group">
              <label><FiCamera /> Profile Photo <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="photo-upload-wrap">
                <div 
                  className={`photo-upload ${fieldErrors.avatar ? 'error-border' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
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
                      <p>Upload Photo</p>
                    </div>
                  )}
                </div>
                {fieldErrors.avatar && <div className="field-error">{fieldErrors.avatar}</div>}
                <p className="photo-hint">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>

            {/* Read-only fields - NO ICONS inside input-wrap */}
            <div className="form-group">
              <label><FiUser /> Full Name</label>
              <div className="input-wrap">
                <input type="text" value={userName} disabled />
              </div>
            </div>

            <div className="form-group">
              <label><FiMail /> Email Address</label>
              <div className="input-wrap">
                <input type="email" value={userEmail} disabled />
              </div>
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Company / Business Name <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrap">
                <input
                  type="text"
                  name="company_name"
                  placeholder="Enter your business name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={fieldErrors.company_name ? 'error-input' : ''}
                />
              </div>
              {fieldErrors.company_name && <div className="field-error">{fieldErrors.company_name}</div>}
            </div>

            <div className="form-group">
              <label><FiPhone /> Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrap">
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g., 08012345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className={fieldErrors.phone ? 'error-input' : ''}
                />
              </div>
              {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
              <p className="photo-hint">Enter a valid Nigerian phone number (e.g., 08012345678)</p>
            </div>

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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default SMEProfileSetup;