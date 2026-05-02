import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useToast, ToastContainer } from '../components/Toast';
import { 
  FiZap, FiUser, FiMail, FiCamera, FiUpload, 
  FiArrowRight, FiCheckCircle, FiMapPin, FiLock,
  FiPhone, FiBriefcase, FiFolder, FiFile, FiX,
  FiChevronDown
} from "react-icons/fi";
import "../styles/auth.css";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_name: string;
}

const VerifyStudentPage = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  // Custom dropdown states
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    matric_number: "",
    department: "",
    faculty: "",
    level: "",
    phone: "",
    bio: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    matric_number: "",
    phone: "",
    avatar: "",
    department: "",
    level: "",
  });

  const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Post Graduate"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target as Node)) {
        setIsLevelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleLevelSelect = (level: string) => {
    setFormData({ ...formData, level });
    setIsLevelDropdownOpen(false);
    if (fieldErrors.level) {
      setFieldErrors({ ...fieldErrors, level: "" });
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

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        addToast(`${file.name} exceeds 10MB limit`, 'error');
        continue;
      }

      setUploadingPortfolio(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);

        const newPortfolioItem: PortfolioItem = {
          id: `${Date.now()}-${i}`,
          title: file.name.split('.').slice(0, -1).join('.') || "Untitled",
          description: "",
          file_url: publicUrl,
          file_type: file.type,
          file_name: file.name,
        };

        setPortfolioItems(prev => [...prev, newPortfolioItem]);
        addToast(`${file.name} uploaded successfully`, 'success');
      } catch (error) {
        console.error("Portfolio upload error:", error);
        addToast(`Failed to upload ${file.name}`, 'error');
      } finally {
        setUploadingPortfolio(false);
      }
    }
    if (portfolioInputRef.current) portfolioInputRef.current.value = "";
  };

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  const updatePortfolioTitle = (id: string, title: string) => {
    setPortfolioItems(prev => prev.map(item => 
      item.id === id ? { ...item, title } : item
    ));
  };

  const updatePortfolioDescription = (id: string, description: string) => {
    setPortfolioItems(prev => prev.map(item => 
      item.id === id ? { ...item, description } : item
    ));
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

  const savePortfolioToDatabase = async (userId: string) => {
    if (portfolioItems.length === 0) return;

    const portfolioData = portfolioItems.map(item => ({
      user_id: userId,
      title: item.title,
      description: item.description,
      file_url: item.file_url,
      file_type: item.file_type,
      file_name: item.file_name,
    }));

    const { error } = await supabase
      .from('portfolio_items')
      .insert(portfolioData);

    if (error) {
      console.error("Error saving portfolio:", error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { matric_number: "", phone: "", avatar: "", department: "", level: "" };
    
    if (!formData.matric_number.trim()) {
      newErrors.matric_number = "Matriculation number is required";
      isValid = false;
    }
    
    if (!formData.department) {
      newErrors.department = "Department is required";
      isValid = false;
    }
    
    if (!formData.level) {
      newErrors.level = "Level is required";
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

      const skills = formData.department ? [formData.department] : [];
      
      const updateData = {
        full_name: userName,
        matric_number: formData.matric_number,
        department: formData.department,
        faculty: formData.faculty,
        level: formData.level,
        phone: formData.phone,
        bio: formData.bio,
        skills: skills,
        is_verified: true,
        role: 'student'
      };
      
      if (avatarUrl) {
        Object.assign(updateData, { avatar_url: avatarUrl });
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        addToast(updateError.message, 'error');
        setLoading(false);
        return;
      }

      try {
        await savePortfolioToDatabase(user.id);
      } catch (error) {
        console.error("Portfolio save error:", error);
        addToast("Profile saved but some portfolio items could not be saved", 'warning');
      }
      
      setSuccess(true);
      addToast("Student verification completed successfully!", 'success');
      setTimeout(() => {
        navigate("/dashboard/student");
      }, 2000);
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
            <h1>Verification Complete!</h1>
            <p>Your student profile has been verified.</p>
            <p style={{ color: "#1a9c6e", marginTop: "1rem" }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-page">
      <div className="role-content">
        <div className="verify-box">
          <div className="verify-icon">
            <FiLock />
          </div>
          <h1>Student Verification</h1>
          <p>Complete your profile to start finding jobs</p>

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

            {/* Read-only fields */}
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
              <label><FiMapPin /> Matriculation Number <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrap">
                <input
                  type="text"
                  name="matric_number"
                  placeholder="e.g., 240101005"
                  value={formData.matric_number}
                  onChange={handleChange}
                  className={fieldErrors.matric_number ? 'error-input' : ''}
                />
              </div>
              {fieldErrors.matric_number && <div className="field-error">{fieldErrors.matric_number}</div>}
            </div>

            <div className="form-group">
              <label><FiBriefcase /> Department <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-wrap">
                <input
                  type="text"
                  name="department"
                  placeholder="e.g., Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                  className={fieldErrors.department ? 'error-input' : ''}
                />
              </div>
              {fieldErrors.department && <div className="field-error">{fieldErrors.department}</div>}
            </div>

            <div className="form-group">
              <label><FiMapPin /> Faculty</label>
              <div className="input-wrap">
                <input
                  type="text"
                  name="faculty"
                  placeholder="e.g., Science"
                  value={formData.faculty}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Custom Level Dropdown */}
            <div className="form-group">
              <label>Level <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="custom-dropdown" ref={levelDropdownRef}>
                <div 
                  className={`custom-dropdown-trigger ${fieldErrors.level ? 'error-border' : ''}`}
                  onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                >
                  <span className={formData.level ? "" : "placeholder"}>
                    {formData.level || "Select your level"}
                  </span>
                  <FiChevronDown className={`dropdown-icon ${isLevelDropdownOpen ? 'open' : ''}`} />
                </div>
                {isLevelDropdownOpen && (
                  <div className="custom-dropdown-menu">
  {levels.map((level) => (
    <div
      key={level}
      className={`custom-dropdown-item ${formData.level === level ? 'selected' : ''}`}
      onClick={() => handleLevelSelect(level)}
    >
      {level}
    </div>
  ))}
</div>
                )}
              </div>
              {fieldErrors.level && <div className="field-error">{fieldErrors.level}</div>}
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
              <p className="photo-hint">Enter a valid Nigerian phone number</p>
            </div>

            <div className="form-group">
              <label><FiUser /> Bio / About You</label>
              <textarea
                name="bio"
                rows={3}
                className="textarea-input"
                placeholder="Tell clients about your skills and experience..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Portfolio Section */}
            <div className="form-group portfolio-section">
              <label><FiFolder /> Portfolio / Work Samples</label>
              <p className="photo-hint">Upload projects, assignments, or any work samples (PDF, images, documents up to 10MB each)</p>
              
              <div 
                className="portfolio-upload-area"
                onClick={() => portfolioInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={portfolioInputRef}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
                  onChange={handlePortfolioUpload}
                  multiple
                  style={{ display: "none" }}
                />
                <FiUpload className="portfolio-upload-icon" />
                <p>Click to upload files</p>
                <span>or drag and drop</span>
              </div>

              {uploadingPortfolio && (
                <div className="portfolio-uploading">
                  <div className="spinner-small"></div>
                  <p>Uploading files...</p>
                </div>
              )}

              {portfolioItems.length > 0 && (
                <div className="portfolio-list">
                  <h4>Uploaded Items ({portfolioItems.length})</h4>
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="portfolio-item">
                      <div className="portfolio-item-preview">
                        {item.file_type.startsWith('image/') ? (
                          <img src={item.file_url} alt={item.title} />
                        ) : (
                          <div className="portfolio-file-icon">
                            <FiFile />
                          </div>
                        )}
                      </div>
                      <div className="portfolio-item-details">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updatePortfolioTitle(item.id, e.target.value)}
                          placeholder="Title"
                          className="portfolio-title-input"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => updatePortfolioDescription(item.id, e.target.value)}
                          placeholder="Brief description of this work..."
                          rows={2}
                          className="portfolio-desc-input"
                        />
                      </div>
                      <button
                        type="button"
                        className="portfolio-remove-btn"
                        onClick={() => removePortfolioItem(item.id)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Verifying..." : "Complete Verification"} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default VerifyStudentPage;