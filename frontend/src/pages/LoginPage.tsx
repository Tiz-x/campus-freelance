import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import "../styles/auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/select-role");
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div
        className="auth-left"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80)",
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
            <h2>Welcome back to CampusFreelance</h2>
            <div className="auth-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Access your dashboard</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Track your jobs and earnings</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Chat with clients and students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h1>Log in to your account</h1>
          <p className="auth-sub">Good to have you back!</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your password"
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

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
