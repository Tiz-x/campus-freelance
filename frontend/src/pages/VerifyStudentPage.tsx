import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiZap, FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import "../styles/auth.css";

const VerifyStudentPage = () => {
  const navigate = useNavigate();
  const [matricNumber, setMatricNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validMatricNumbers = ["2021/1234", "2022/5678", "2023/9012", "2024/3456"];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (validMatricNumbers.includes(matricNumber)) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            matric_number: matricNumber,
            is_verified: true 
          })
          .eq('id', user.id);
        
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/student");
        }, 2000);
      }
    } else {
      setError("Invalid matriculation number. Please check and try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div>

      <div className="role-content" style={{ maxWidth: "500px", margin: "0 auto" }}>
        {!success ? (
          <>
            <h1>Verify Your Student Status</h1>
            <p>Enter your AAUA matriculation number to verify your student identity</p>

            {error && <div className="auth-error"><FiAlertCircle /> {error}</div>}

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="e.g., 2021/1234"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  required
                />
                <small>Format: Year/Number (e.g., 2021/1234)</small>
              </div>

              <button type="submit" disabled={loading || !matricNumber} className="auth-btn">
                {loading ? "Verifying..." : "Verify My Account"} <FiArrowRight />
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <h2>Verification Successful!</h2>
            <p>Your student status has been verified.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyStudentPage;