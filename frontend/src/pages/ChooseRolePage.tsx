import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiBook, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const ChooseRolePage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selected, setSelected] = useState<"sme" | "student" | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    navigate(selected === "sme" ? "/dashboard/sme" : "/dashboard/student");
  };

  return (
    <div className="role-page">
    

      <div className="role-content">
        <h1>Welcome back, {profile?.full_name}!</h1>
        <p>How would you like to use CampusFreelance today?</p>

        <div className="role-cards">
          <div
            className={`role-card ${selected === "sme" ? "role-card-active" : ""}`}
            onClick={() => setSelected("sme")}
          >
            <div className="role-card-icon sme-icon">
              <FiBriefcase />
            </div>
            <h2>I want to hire</h2>
            <p>Post jobs and hire talented students</p>
          </div>

          <div
            className={`role-card ${selected === "student" ? "role-card-active" : ""}`}
            onClick={() => setSelected("student")}
          >
            <div className="role-card-icon student-icon">
              <FiBook />
            </div>
            <h2>I want to work</h2>
            <p>Find gigs and earn money</p>
          </div>
        </div>

        <button
          className="auth-btn role-btn"
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ChooseRolePage;