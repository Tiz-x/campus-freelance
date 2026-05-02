import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import "../styles/auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, profile, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  

  useEffect(() => {
    if (!authLoading && profile) {
      if (profile.role === "sme") {
        navigate("/dashboard/sme", { replace: true });
      } else {
        navigate("/dashboard/student", { replace: true });
      }
    }
  }, [authLoading, profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError("Request timed out. Please check your internet connection and try again.")
    }, 10000)

    try {
      const { error: signInError } = await signIn(form.email, form.password)
      clearTimeout(timeoutId)

      if (signInError) {
        setLoading(false)

        // Friendly error messages
        if (signInError.message?.includes('Invalid login credentials')) {
          setError("Incorrect email or password. Please try again.")
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError("Please verify your email before logging in. Check your inbox.")
        } else if (signInError.message?.includes('network') || signInError.message?.includes('fetch')) {
          setError("Network error. Please check your internet connection.")
        } else {
          setError(signInError.message || "Login failed. Please try again.")
        }
      }
      // On success — useEffect handles redirect
    } catch (err: any) {
      clearTimeout(timeoutId)
      setLoading(false)
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setError("Network error. Please check your internet connection.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

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

          {error && (
            <div className="auth-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

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
                  disabled={loading}
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
                  disabled={loading}
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

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                    flexShrink: 0,
                  }} />
                  Logging in...
                </span>
              ) : "Log in"}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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