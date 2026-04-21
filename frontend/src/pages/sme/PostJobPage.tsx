import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import {
  FiZap,
  FiArrowLeft,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiTag,
  FiMapPin,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import "../../styles/postjob.css";

const PostJobPage = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    budget: "",
    duration: "",
    location: "",
    skills: [] as string[],
  });

  const categories = ["Design", "Development", "Marketing", "Writing", "Video", "Music", "Business"];
  const subcategories: Record<string, string[]> = {
    Design: ["Logo Design", "UI/UX Design", "Graphics Design", "Web Design", "Product Design"],
    Development: ["Web Development", "Mobile Development", "Software Dev", "API Integration"],
    Marketing: ["Social Media", "SEO", "Email Marketing", "Content Marketing"],
    Writing: ["Article Writing", "Copywriting", "Technical Writing", "Blog Posts"],
    Video: ["Video Editing", "Animation", "Motion Graphics", "Filming"],
    Music: ["Music Production", "Mixing", "Mastering", "Voice Over"],
    Business: ["Data Entry", "Virtual Assistant", "Project Management", "Research"],
  };
  const budgets = ["₦5,000 - ₦15,000", "₦15,000 - ₦30,000", "₦30,000 - ₦50,000", "₦50,000 - ₦100,000", "₦100,000+"];
  const durations = ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category, subcategory: "" });
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setFormData({ ...formData, subcategory });
  };

  const handleBudgetSelect = (budget: string) => {
    setFormData({ ...formData, budget });
  };

  const handleDurationSelect = (duration: string) => {
    setFormData({ ...formData, duration });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    startLoading();

    // Simulate API call - replace with actual Supabase insert
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Job posted:", formData);
    
    setSubmitting(false);
    stopLoading();
    navigate("/dashboard/sme");
  };

  return (
    <div className="postjob-page">
      <div className="postjob-header">
        <div className="postjob-logo" onClick={() => navigate("/dashboard/sme")}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
        <button className="back-to-dash" onClick={() => navigate("/dashboard/sme")}>
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="postjob-container">
        {/* Progress Steps */}
        <div className="postjob-progress">
          <div className={`progress-step ${currentStep >= 1 ? "step-active" : ""} ${currentStep > 1 ? "step-done" : ""}`}>
            <div className="progress-circle">{currentStep > 1 ? "✓" : "1"}</div>
            <span>Job Details</span>
          </div>
          <div className={`progress-line ${currentStep > 1 ? "line-done" : ""}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? "step-active" : ""} ${currentStep > 2 ? "step-done" : ""}`}>
            <div className="progress-circle">{currentStep > 2 ? "✓" : "2"}</div>
            <span>Budget & Duration</span>
          </div>
          <div className={`progress-line ${currentStep > 2 ? "line-done" : ""}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? "step-active" : ""}`}>
            <div className="progress-circle">3</div>
            <span>Review & Post</span>
          </div>
        </div>

        <div className="postjob-content">
          <div className="postjob-form-wrap">
            {currentStep === 1 && (
              <div className="postjob-step">
                <h2>Tell us about your job</h2>
                <p>Provide details so students can understand your requirements</p>

                <div className="form-group">
                  <label>Job Title <span className="optional">(required)</span></label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Logo Design for my bakery"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category <span className="optional">(required)</span></label>
                  <div className="category-grid">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`category-pill ${formData.category === cat ? "category-active" : ""}`}
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.category && (
                  <div className="form-group">
                    <label>Subcategory <span className="optional">(required)</span></label>
                    <div className="subcategory-grid">
                      {subcategories[formData.category]?.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          className={`subcategory-pill ${formData.subcategory === sub ? "subcategory-active" : ""}`}
                          onClick={() => handleSubcategorySelect(sub)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Job Description <span className="optional">(required)</span></label>
                  <textarea
                    name="description"
                    rows={5}
                    className="textarea-input"
                    placeholder="Describe what you need done, requirements, and any other relevant details..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <div className="input-wrap">
                    <FiMapPin className="input-icon" />
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g., Akungba-Akoko or Remote"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button className="postjob-next" onClick={nextStep} disabled={!formData.title || !formData.category || !formData.subcategory || !formData.description}>
                  Continue <FiChevronRight />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="postjob-step">
                <h2>Set your budget & timeline</h2>
                <p>Help students understand your expectations</p>

                <div className="form-group">
                  <label>Budget Range</label>
                  <div className="budget-grid">
                    {budgets.map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        className={`budget-pill ${formData.budget === budget ? "budget-active" : ""}`}
                        onClick={() => handleBudgetSelect(budget)}
                      >
                        <FiDollarSign /> {budget}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Expected Duration</label>
                  <div className="duration-grid">
                    {durations.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        className={`duration-pill ${formData.duration === duration ? "duration-active" : ""}`}
                        onClick={() => handleDurationSelect(duration)}
                      >
                        <FiClock /> {duration}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="step-buttons">
                  <button className="postjob-back" onClick={prevStep}>
                    <FiArrowLeft /> Back
                  </button>
                  <button className="postjob-next" onClick={nextStep} disabled={!formData.budget || !formData.duration}>
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
                  <div className="review-header">
                    <FiBriefcase className="review-icon" />
                    <h3>{formData.title || "Untitled Job"}</h3>
                  </div>
                  <div className="review-details">
                    <div className="review-item">
                      <FiTag />
                      <span>{formData.category} / {formData.subcategory}</span>
                    </div>
                    <div className="review-item">
                      <FiDollarSign />
                      <span>{formData.budget || "Not set"}</span>
                    </div>
                    <div className="review-item">
                      <FiClock />
                      <span>{formData.duration || "Not set"}</span>
                    </div>
                    <div className="review-item">
                      <FiMapPin />
                      <span>{formData.location || "Remote"}</span>
                    </div>
                  </div>
                  <div className="review-description">
                    <p>{formData.description}</p>
                  </div>
                </div>

                <div className="step-buttons">
                  <button className="postjob-back" onClick={prevStep}>
                    <FiArrowLeft /> Back
                  </button>
                  <button className="postjob-next" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Posting..." : "Post Job"} <FiCheckCircle />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="postjob-preview">
            <h3>PREVIEW</h3>
            <div className="preview-card">
              <div className="preview-category">{formData.category || "Category"}</div>
              <h4 className="preview-title">{formData.title || "Job Title"}</h4>
              <p className="preview-desc">{formData.description || "Job description will appear here..."}</p>
              <div className="preview-sub">{formData.subcategory || "Subcategory"}</div>
              <div className="preview-footer">
                <span className="preview-budget">{formData.budget || "₦0"}</span>
                <span className="preview-duration"><FiClock /> {formData.duration || "Not set"}</span>
              </div>
            </div>
            <div className="preview-tips">
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