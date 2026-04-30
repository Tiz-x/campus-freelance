import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import {
  FiZap,
  FiArrowLeft,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import "../../styles/postjob.css";

const PostJobPage = () => {
  const navigate = useNavigate();
  const { profile, user: authUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    duration: "",
    location: "",
  });
  
  const categories = ["Design", "Development", "Marketing", "Writing", "Video", "Music", "Business"];
  
  const budgets = [
    { label: "₦5,000 - ₦15,000", value: 10000 },
    { label: "₦15,000 - ₦30,000", value: 22500 },
    { label: "₦30,000 - ₦50,000", value: 40000 },
    { label: "₦50,000 - ₦100,000", value: 75000 },
    { label: "₦100,000+", value: 150000 },
  ];
  
  const durations = ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
  };

  const handleBudgetSelect = (budgetValue: number) => {
    setFormData({ ...formData, budget: budgetValue.toString() });
  };

  const handleDurationSelect = (duration: string) => {
    setFormData({ ...formData, duration });
  };

  const getBudgetLabel = (value: string) => {
    const budget = budgets.find(b => b.value.toString() === value);
    return budget ? budget.label : "Not selected";
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const goToDashboard = () => {
    navigate("/dashboard/sme");
  };

  const handleSubmit = async () => {
    if (submitting) {
      console.log("Already submitting");
      return;
    }
    
    console.log("=== HANDLE SUBMIT STARTED ===");
    
    if (!authUser?.id) {
      setError("You must be logged in");
      return;
    }

    if (!formData.title || !formData.category || !formData.description || !formData.budget || !formData.duration) {
      setError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    setError("");

    const jobData = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      budget: parseInt(formData.budget),
      duration: formData.duration,
      location: formData.location || "Remote",
      created_by: authUser.id,
      status: "open",
    };

    console.log("Inserting:", jobData);

    // Use a simple insert without .select()
    const { error } = await supabase
      .from("jobs")
      .insert(jobData);

    console.log("Insert error:", error);

    if (error) {
      console.error("Error:", error);
      setError(error.message);
      setSubmitting(false);
    } else {
      console.log("Success!");
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/sme");
      }, 2000);
    }
  };

  return (
    <div className="postjob-page">
      <div className="postjob-header">
        <div className="postjob-logo" onClick={goToDashboard}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
        <button className="back-to-dash" onClick={goToDashboard}>
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="postjob-container">
        <div className="postjob-progress">
          <div className={`progress-step ${currentStep >= 1 ? "step-active" : ""}`}>
            <div className="progress-circle">1</div>
            <span>Job Details</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? "step-active" : ""}`}>
            <div className="progress-circle">2</div>
            <span>Budget & Duration</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 3 ? "step-active" : ""}`}>
            <div className="progress-circle">3</div>
            <span>Review & Post</span>
          </div>
        </div>

        <div className="postjob-two-column">
          <div className="postjob-form-wrap">
            {success ? (
              <div className="success-message">
                <FiCheckCircle className="success-icon" />
                <h2>Job Posted Successfully! 🎉</h2>
                <p>Your job has been posted to the marketplace.</p>
                <p className="redirect-text">Redirecting to dashboard...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="error-message">
                    <FiAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="postjob-step">
                    <h2>Tell us about your job</h2>
                    <p>Provide details so students can understand your requirements</p>

                    <div className="form-group">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g., Logo Design for my bakery"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <div className="category-buttons">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            className={`category-btn ${formData.category === cat ? "active" : ""}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description *</label>
                      <textarea
                        name="description"
                        rows={5}
                        placeholder="Describe what you need done..."
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Location</label>
                      <div className="input-with-icon">
                        <FiMapPin className="input-icon" />
                        <input
                          type="text"
                          name="location"
                          placeholder="e.g., Where are you in Akungba"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button onClick={nextStep} disabled={!formData.title || !formData.category || !formData.description} className="continue-btn">
                      Continue <FiChevronRight />
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="postjob-step">
                    <h2>Set your budget & timeline</h2>
                    <p>Help students understand your expectations</p>

                    <div className="form-group">
                      <label>Budget (₦ Naira) *</label>
                      <div className="budget-grid">
                        {budgets.map((budget) => (
                          <button
                            key={budget.value}
                            type="button"
                            onClick={() => handleBudgetSelect(budget.value)}
                            className={`budget-btn ${formData.budget === budget.value.toString() ? "active" : ""}`}
                          >
                            <FiDollarSign /> {budget.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Expected Duration *</label>
                      <div className="duration-list">
                        {durations.map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => handleDurationSelect(duration)}
                            className={`duration-btn ${formData.duration === duration ? "active" : ""}`}
                          >
                            <FiClock /> {duration}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="step-buttons">
                      <button onClick={prevStep} className="back-btn">Back</button>
                      <button onClick={nextStep} disabled={!formData.budget || !formData.duration} className="continue-btn">
                        Continue <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="postjob-step">
                    <h2>Review your job posting</h2>
                    <p>Check everything looks good before posting</p>

                    <div className="review-card">
                      <h3>{formData.title || "Untitled Job"}</h3>
                      <div className="review-details">
                        <p><strong>Category:</strong> {formData.category}</p>
                        <p><strong>Budget:</strong> {getBudgetLabel(formData.budget)}</p>
                        <p><strong>Duration:</strong> {formData.duration}</p>
                        <p><strong>Location:</strong> {formData.location || "Remote"}</p>
                        <p><strong>Description:</strong> {formData.description}</p>
                      </div>
                    </div>

                    <div className="step-buttons">
                      <button onClick={prevStep} className="back-btn">Back</button>
                      <button onClick={handleSubmit} disabled={submitting} className="submit-btn">
                        {submitting ? "Posting..." : "Post Job"} <FiCheckCircle />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="postjob-preview">
            <h3>Live Preview</h3>
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Company" />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div className="preview-company">
                  <div className="preview-company-name">{profile?.full_name || "Your Company"}</div>
                  <div className="preview-location">
                    <FiMapPin size={12} /> {formData.location || "Remote"}
                  </div>
                </div>
              </div>
              
              <div className="preview-category">{formData.category || "Category"}</div>
              <h4>{formData.title || "Job Title"}</h4>
              <p>{formData.description || "Job description will appear here..."}</p>
              
              <div className="preview-footer">
                <span className="preview-budget">{getBudgetLabel(formData.budget)}</span>
                <span className="preview-duration"><FiClock /> {formData.duration || "Not set"}</span>
              </div>
            </div>
            
            <div className="tips-card">
              <h4>Tips for a great job post:</h4>
              <ul>
                <li>Be specific about your requirements</li>
                <li>Set a realistic budget range</li>
                <li>Provide examples if possible</li>
                <li>Respond to bids promptly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;