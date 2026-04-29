import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiBriefcase, FiBook, FiArrowRight } from "react-icons/fi";
import "../styles/auth.css";

const SelectRolePage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"sme" | "student" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;

    const pendingData = localStorage.getItem("pendingSignup");
    if (!pendingData) {
      navigate("/signup");
      return;
    }

    const { email, password, fullName } = JSON.parse(pendingData);
    
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedRole,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: selectedRole,
        is_verified: selectedRole === 'student' ? false : true,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError("Account created but profile setup failed. Please try logging in.");
      } else {
        localStorage.removeItem("pendingSignup");
        
        if (selectedRole === "student") {
          navigate("/verify-student");
        } else {
          navigate("/sme-profile-setup");
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className="role-page">
      {/* <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div> */}

      <div className="role-content">
        <h1>How do you want to use CampusFreelance?</h1>
        <p>Choose your role — you can always change this later</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="role-cards">
          <div
            className={`role-card ${selectedRole === "sme" ? "role-card-active" : ""}`}
            onClick={() => setSelectedRole("sme")}
          >
            <div className="role-card-icon sme-icon">
              <FiBriefcase />
            </div>
            <h2>I want to hire</h2>
            <p>
              I'm a business owner or individual looking to hire talented AAUA
              students for my projects
            </p>
            <ul className="role-perks">
              <li>✓ Post unlimited jobs</li>
              <li>✓ Review student proposals</li>
              <li>✓ Pay securely with escrow</li>
            </ul>
            <div
              className={`role-check ${selectedRole === "sme" ? "role-check-active" : ""}`}
            >
              {selectedRole === "sme" ? "✓" : ""}
            </div>
          </div>

          <div
            className={`role-card ${selectedRole === "student" ? "role-card-active" : ""}`}
            onClick={() => setSelectedRole("student")}
          >
            <div className="role-card-icon student-icon">
              <FiBook />
            </div>
            <h2>I want to work</h2>
            <p>
              I'm a verified AAUA student looking to earn money by offering my
              skills to local businesses
            </p>
            <ul className="role-perks">
              <li>✓ Browse available jobs</li>
              <li>✓ Submit proposals</li>
              <li>✓ Get paid securely</li>
            </ul>
            <div
              className={`role-check ${selectedRole === "student" ? "role-check-active" : ""}`}
            >
              {selectedRole === "student" ? "✓" : ""}
            </div>
          </div>
        </div>

        <button
          className="auth-btn role-btn"
          disabled={!selectedRole || loading}
          onClick={handleContinue}
        >
          {loading ? "Creating account..." : "Continue"} <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default SelectRolePage;