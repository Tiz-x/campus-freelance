import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiBook, FiArrowRight, FiZap } from "react-icons/fi";
import "../styles/auth.css";

const SelectRolePage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"sme" | "student" | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "student") {
      navigate("/verify-student");
    } else {
      navigate("/sme-profile-setup");
    }
  };

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
      </div>

      <div className="role-content">
        <h1>How do you want to use CampusFreelance?</h1>
        <p>Choose your role — you can always change this later</p>

        <div className="role-cards">
          <div
            className={`role-card ${selected === "sme" ? "role-card-active" : ""}`}
            onClick={() => setSelected("sme")}
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
              className={`role-check ${selected === "sme" ? "role-check-active" : ""}`}
            >
              {selected === "sme" ? "✓" : ""}
            </div>
          </div>

          <div
            className={`role-card ${selected === "student" ? "role-card-active" : ""}`}
            onClick={() => setSelected("student")}
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
              className={`role-check ${selected === "student" ? "role-check-active" : ""}`}
            >
              {selected === "student" ? "✓" : ""}
            </div>
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

export default SelectRolePage;
