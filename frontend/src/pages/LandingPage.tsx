import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiSearch,
  FiShield,
  FiStar,
  FiArrowRight,
  FiCheck,
  FiZap,
  FiTrendingUp,
  FiPenTool,
  FiCode,
  FiCpu,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import "../styles/landing.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <FiZap className="logo-icon" />
          <span className="logo-text">CampusFreelance</span>
        </div>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#categories">Categories</a>
          <a href="#testimonials">Reviews</a>
        </div>
        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Log in
          </button>
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FiStar /> Built for AAUA students
          </div>
          <h1>Hire talented AAUA students or earn by offering your skills</h1>
          <p>
            The trusted campus marketplace connecting local businesses with
            verified AAUA students. Secure payments, real work, real results.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary btn-large"
              onClick={() => navigate("/signup?role=sme")}
            >
              Hire a Student <FiArrowRight />
            </button>
            <button
              className="btn-outline btn-large"
              onClick={() => navigate("/signup?role=student")}
            >
              Find Work <FiArrowRight />
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Students verified</span>
            </div>
            <div className="stat">
              <span className="stat-number">200+</span>
              <span className="stat-label">Jobs completed</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Secure payments</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-visual">
            <img
              src="/hero.jpeg"
              alt="Student working happily on laptop"
              className="hero-student-img"
            />
            <div className="floating-card fc-top">
              <FiBriefcase className="fc-icon" />
              <div>
                <p className="fc-title">New job posted</p>
                <p className="fc-sub">Logo Design · ₦15,000</p>
              </div>
            </div>
            <div className="floating-card fc-bottom">
              <FiCheck className="fc-icon fc-check" />
              <div>
                <p className="fc-title">Payment secured</p>
                <p className="fc-sub">Escrow · ₦45,000</p>
              </div>
            </div>
            <div className="floating-card fc-left">
              <FiUsers className="fc-icon" />
              <div>
                <p className="fc-title">120+ online</p>
                <p className="fc-sub">Verified students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-label">HOW IT WORKS</div>
        <h2>It's easy to get work done</h2>
        <p className="section-sub">
          Three simple steps to connect, work and get paid
        </p>
        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <FiBriefcase />
            </div>
            <h3>Post a Job</h3>
            <p>
              Create your job posting in minutes and start receiving proposals
              from qualified students
            </p>
            <a href="#" className="step-link">
              Browse categories <FiArrowRight />
            </a>
          </div>
          <div className="step">
            <div className="step-icon">
              <FiSearch />
            </div>
            <h3>Hire a Student</h3>
            <p>
              Review proposals, chat with students, and hire the best fit for
              your project
            </p>
            <a href="#" className="step-link">
              Browse categories <FiArrowRight />
            </a>
          </div>
          <div className="step">
            <div className="step-icon">
              <FiShield />
            </div>
            <h3>Pay Securely</h3>
            <p>
              Pay through our escrow system. Money is only released when you
              approve the work
            </p>
            <a href="#" className="step-link">
              Browse categories <FiArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="categories">
        <div className="section-label">CATEGORIES</div>
        <h2>Browse by categories</h2>
        <p className="section-sub">Find the right skill for your project</p>
        <div className="categories-grid">
  {[
    { icon: <FiCode />, name: 'Web & Software Dev', jobs: 12 },
    { icon: <FiPenTool />, name: 'Graphic Design & Branding', jobs: 8 },
    { icon: <FiTrendingUp />, name: 'Digital Marketing', jobs: 9 },
    { icon: <FiFileText />, name: 'Writing & Copywriting', jobs: 5 },
    { icon: <FiCpu />, name: 'AI & Automation', jobs: 3 },
  ].map((cat, i) => (
    <div className="category-card" key={i}>
      <span className="cat-icon">{cat.icon}</span>
      <p className="cat-name">{cat.name}</p>
      <p className="cat-jobs">{cat.jobs} jobs available</p>
    </div>
  ))}
</div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div className="section-label">TESTIMONY</div>
        <h2>Quotes from our users</h2>
        <div className="testimonials-grid">
          {[
            {
              name: "Bola Adeyemi",
              role: "SME · Bakery Owner",
              text: "I found an amazing student who designed my logo in 3 days. The escrow payment made me feel safe throughout.",
            },
            {
              name: "Chidi Okafor",
              role: "Student · 300 Level",
              text: "I have earned over ₦80,000 this semester doing freelance jobs on this platform. It is a game changer.",
            },
            {
              name: "Funmi Adeola",
              role: "SME · Fashion Brand",
              text: "Very easy to use. I posted a job, got 5 proposals in one hour and hired the best one. Highly recommended!",
            },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <FiStar className="star-icon" />
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name[0]}</div>
                <div>
                  <p className="author-name">{t.name}</p>
                  <p className="author-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to get started?</h2>
        <p>
          Join hundreds of students and businesses already on CampusFreelance
        </p>
        <div className="cta-actions">
          <button
            className="btn-white btn-large"
            onClick={() => navigate("/signup?role=sme")}
          >
            I want to hire <FiArrowRight />
          </button>
          <button
            className="btn-outline-white btn-large"
            onClick={() => navigate("/signup?role=student")}
          >
            I want to work <FiArrowRight />
          </button>
        </div>
        <div className="cta-features">
          <span>
            <FiCheck /> Free to sign up
          </span>
          <span>
            <FiCheck /> Verified students only
          </span>
          <span>
            <FiCheck /> Secure escrow payments
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <FiZap className="logo-icon" />
          <span className="logo-text">CampusFreelance</span>
        </div>
        <p className="footer-text">
          The campus marketplace for AAUA students and local businesses.
        </p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p className="footer-copy">
          © 2026 CampusFreelance. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
