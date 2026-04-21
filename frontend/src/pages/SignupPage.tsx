import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import "../styles/auth.css";

const SignupPage = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    startLoading(); // Start top progress bar

    // Store pending data
    const pendingData = {
      email: form.email,
      password: form.password,
      fullName: form.full_name,
    };
    localStorage.setItem("pendingSignup", JSON.stringify(pendingData));

    // Simulate network delay (remove this when using real API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    stopLoading(); // Stop top progress bar
    navigate("/select-role");
  };

  return (
    <div className="auth-page">
      <div
        className="auth-left"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="auth-left-overlay">
          <div className="auth-left-content">
            <div className="auth-logo" onClick={() => navigate("/")}>
              <FiZap className="logo-icon" />
              <span>CampusFreelance</span>
            </div>
            <h2>
              The campus marketplace for AAUA students and local businesses
            </h2>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Verified AAUA students only</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Secure escrow payments</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Real jobs, real earnings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h1>Create your account</h1>
          <p className="auth-sub">Join CampusFreelance today — it's free</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;