import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  FiZap,
  FiArrowLeft,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "../../styles/postjob.css";

const PostJobPage = () => {
  const navigate = useNavigate();
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
  
  // Budget options with numeric values (in Naira)
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
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to post a job");
      setSubmitting(false);
      return;
    }

    const jobData = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      budget: parseInt(formData.budget),
      duration: formData.duration,
      location: formData.location || "Remote",
      created_by: user.id,
      status: "open",
    };

    console.log("Submitting job data:", jobData);

    const { data, error: insertError } = await supabase
      .from('jobs')
      .insert([jobData])
      .select();

    if (insertError) {
      console.error("Error posting job:", insertError);
      setError(insertError.message);
      setSubmitting(false);
    } else {
      console.log("Job posted successfully:", data);
      
      // Send notifications to all students about the new job
      if (data && data.length > 0) {
        const newJob = data[0];
        
        // Get all students
        const { data: students } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student');
        
        if (students && students.length > 0) {
          // Create notifications for each student
          const notifications = students.map(student => ({
            user_id: student.id,
            type: 'new_job',
            title: 'New Job Available! 🚀',
            message: `A new job "${formData.title}" has been posted. Check it out and place your bid!`,
            related_id: newJob.id,
            is_read: false
          }));
          
          // Insert in batches to avoid rate limits
          const batchSize = 10;
          for (let i = 0; i < notifications.length; i += batchSize) {
            const batch = notifications.slice(i, i + batchSize);
            await supabase.from('notifications').insert(batch);
          }
          
          console.log(`Sent notifications to ${students.length} students`);
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/sme");
      }, 2000);
    }
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

        <div className="postjob-content">
          <div className="postjob-form-wrap">
            {success ? (
              <div className="success-message" style={{ textAlign: "center", padding: "3rem" }}>
                <FiCheckCircle style={{ fontSize: "4rem", color: "#1a9c6e", marginBottom: "1rem" }} />
                <h2>Job Posted Successfully! 🎉</h2>
                <p>Your job has been posted to the marketplace.</p>
                <p style={{ color: "#6c757d" }}>Redirecting to dashboard...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="error-message" style={{ background: "#fee2e2", color: "#dc2626", padding: "1rem", borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                        style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "8px" }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Category *</label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "20px",
                              border: "1px solid #ddd",
                              background: formData.category === cat ? "#1a9c6e" : "white",
                              color: formData.category === cat ? "white" : "#333",
                              cursor: "pointer"
                            }}
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
                        placeholder="Describe what you need done, requirements, and expectations..."
                        value={formData.description}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "8px" }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Location</label>
                      <div style={{ position: "relative" }}>
                        <FiMapPin style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                        <input
                          type="text"
                          name="location"
                          placeholder="e.g., Akungba-Akoko or Remote"
                          value={formData.location}
                          onChange={handleChange}
                          style={{ width: "100%", padding: "0.75rem 0.75rem 0.75rem 2rem", border: "1px solid #ddd", borderRadius: "8px" }}
                        />
                      </div>
                    </div>

                    <button onClick={nextStep} disabled={!formData.title || !formData.category || !formData.description} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", background: "#1a9c6e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                        {budgets.map((budget) => (
                          <button
                            key={budget.value}
                            type="button"
                            onClick={() => handleBudgetSelect(budget.value)}
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                              background: formData.budget === budget.value.toString() ? "#1a9c6e" : "white",
                              color: formData.budget === budget.value.toString() ? "white" : "#333",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}
                          >
                            <FiDollarSign /> {budget.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Expected Duration *</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {durations.map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => handleDurationSelect(duration)}
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                              background: formData.duration === duration ? "#1a9c6e" : "white",
                              color: formData.duration === duration ? "white" : "#333",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}
                          >
                            <FiClock /> {duration}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button onClick={prevStep} style={{ padding: "0.75rem 1.5rem", background: "#ccc", border: "none", borderRadius: "8px", cursor: "pointer" }}>Back</button>
                      <button onClick={nextStep} disabled={!formData.budget || !formData.duration} style={{ padding: "0.75rem 1.5rem", background: "#1a9c6e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                        Continue <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="postjob-step">
                    <h2>Review your job posting</h2>
                    <p>Check everything looks good before posting</p>

                    <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "12px", marginBottom: "1rem" }}>
                      <h3 style={{ marginBottom: "0.5rem" }}>{formData.title || "Untitled Job"}</h3>
                      <p><strong>Category:</strong> {formData.category}</p>
                      <p><strong>Budget:</strong> {getBudgetLabel(formData.budget)}</p>
                      <p><strong>Duration:</strong> {formData.duration}</p>
                      <p><strong>Location:</strong> {formData.location || "Remote"}</p>
                      <p><strong>Description:</strong> {formData.description}</p>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button onClick={prevStep} style={{ padding: "0.75rem 1.5rem", background: "#ccc", border: "none", borderRadius: "8px", cursor: "pointer" }}>Back</button>
                      <button onClick={handleSubmit} disabled={submitting} style={{ padding: "0.75rem 1.5rem", background: "#1a9c6e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                        {submitting ? "Posting..." : "Post Job"} <FiCheckCircle />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div className="postjob-preview">
            <h3>PREVIEW</h3>
            <div style={{ background: "white", padding: "1rem", borderRadius: "12px", border: "1px solid #ddd" }}>
              <div style={{ display: "inline-block", background: "#1a9c6e10", color: "#1a9c6e", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                {formData.category || "Category"}
              </div>
              <h4 style={{ marginBottom: "0.5rem" }}>{formData.title || "Job Title"}</h4>
              <p style={{ color: "#666", fontSize: "0.85rem" }}>{formData.description || "Job description will appear here..."}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #ddd" }}>
                <span style={{ fontWeight: "bold", color: "#1a9c6e" }}>{getBudgetLabel(formData.budget)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><FiClock /> {formData.duration || "Not set"}</span>
              </div>
            </div>
            <div style={{ marginTop: "1rem", background: "#f8f9fa", padding: "1rem", borderRadius: "12px" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>Tips for a great job post:</h4>
              <ul style={{ margin: 0, paddingLeft: "1rem", color: "#666" }}>
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