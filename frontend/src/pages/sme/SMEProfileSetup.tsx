import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FiZap, FiUser, FiBriefcase, FiMapPin, FiPhone, FiMail, FiArrowRight } from "react-icons/fi";
import "../../styles/auth.css";

const SMEProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
        setFormData(prev => ({ ...prev, company_name: user.user_metadata?.full_name || "" }));
      }
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.auth.updateUser({
        data: {
          company_name: formData.company_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          profile_complete: true,
        }
      });

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: userEmail,
          full_name: formData.company_name,
          role: 'sme',
          is_verified: true,
          bio: formData.bio,
        });
        
      navigate("/dashboard/sme");
    }
    
    setLoading(false);
  };

  const handleSkip = () => {
    navigate("/dashboard/sme");
  };

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div>

      <div className="role-content" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1>Complete Your Business Profile</h1>
        <p>Tell students about your business to get better proposals</p>

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label><FiBriefcase /> Company / Business Name</label>
            <input
              type="text"
              name="company_name"
              placeholder="Enter your business name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input
              type="email"
              value={userEmail}
              disabled
              style={{ background: "#f8f9fa" }}
            />
          </div>

          <div className="form-group">
            <label><FiPhone /> Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label><FiMapPin /> Business Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter your business address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label><FiUser /> About Your Business</label>
            <textarea
              name="bio"
              rows={4}
              placeholder="Tell students what your business does..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="button" onClick={handleSkip} className="btn-secondary">
              Skip for now
            </button>
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? "Saving..." : "Complete Profile"} <FiArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SMEProfileSetup;