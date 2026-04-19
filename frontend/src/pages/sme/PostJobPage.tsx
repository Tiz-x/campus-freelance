import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiZap, FiArrowRight, FiArrowLeft, FiBriefcase,
  FiDollarSign, FiTag, FiClock
} from 'react-icons/fi'
import '../../styles/postjob.css'

const categories = [
  {
    name: 'Web & Software Development',
    subcategories: [
      'Business Website Creation',
      'E-commerce Store Setup',
      'Landing Page Design',
      'Website Maintenance & Bug Fixing',
    ],
  },
  {
    name: 'Graphic Design & Branding',
    subcategories: [
      'Logo Creation & Brand Identity',
      'Flyer, Poster & Banner Design',
      'Product Packaging Design',
      'Business Card Design',
    ],
  },
  {
    name: 'Digital Marketing & Social Media',
    subcategories: [
      'Social Media Account Management',
      'Social Media Content Creation',
      'Paid Ad Campaign Setup',
      'Google My Business & Local SEO',
    ],
  },
  {
    name: 'Writing & Copywriting',
    subcategories: [
      'Product Descriptions',
      'Business Proposals & Letter Writing',
      'Social Media Captions & Copy',
      'Blog Article Writing',
    ],
  },
  {
    name: 'AI Integration & Automation',
    subcategories: [
      'WhatsApp & Instagram Chatbot Setup',
      'AI-Generated Marketing Graphics',
      'AI Sales Data Analysis',
    ],
  },
]

const budgetRanges = [
  '₦5,000 - ₦15,000',
  '₦15,000 - ₦30,000',
  '₦30,000 - ₦50,000',
  '₦50,000 - ₦100,000',
  '₦100,000+',
  'Custom amount',
]

const durations = [
  'Less than 1 week',
  '1 - 2 weeks',
  '2 - 4 weeks',
  '1 - 3 months',
  'More than 3 months',
]

const PostJobPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    requirements: '',
    budgetRange: '',
    customBudget: '',
    duration: '',
  })

  const selectedCategory = categories.find(c => c.name === form.category)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard/sme')
  }

  return (
    <div className="postjob-page">

      {/* HEADER */}
      <div className="postjob-header">
        <div className="postjob-logo" onClick={() => navigate('/')}>
          <FiZap className="logo-icon" />
          <span>CampusFreelance</span>
        </div>
        <button className="back-to-dash" onClick={() => navigate('/dashboard/sme')}>
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="postjob-container">

        {/* PROGRESS */}
        <div className="postjob-progress">
          {['Job Details', 'Description', 'Budget & Timeline'].map((label, i) => (
            <div key={i} className={`progress-step ${step > i ? 'step-done' : ''} ${step === i + 1 ? 'step-active' : ''}`}>
              <div className="progress-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{label}</span>
              {i < 2 && <div className={`progress-line ${step > i + 1 ? 'line-done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="postjob-content">

          {/* LEFT - FORM */}
          <div className="postjob-form-wrap">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="postjob-step">
                <h2>Tell us about your job</h2>
                <p>Start with a clear title and category so students can find your job easily</p>

                <div className="form-group">
                  <label>Job title</label>
                  <div className="input-wrap">
                    <FiBriefcase className="input-icon" />
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Logo Design for my bakery"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>
                  <span className="input-hint">Be specific and clear — good titles attract the right students</span>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <div className="input-wrap">
                    <FiTag className="input-icon" />
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                      className="select-input"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="form-group">
                    <label>Subcategory</label>
                    <div className="subcategory-grid">
                      {selectedCategory.subcategories.map(sub => (
                        <div
                          key={sub}
                          className={`subcategory-pill ${form.subcategory === sub ? 'subcategory-active' : ''}`}
                          onClick={() => setForm({ ...form, subcategory: sub })}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn-primary postjob-next"
                  onClick={handleNext}
                  disabled={!form.title || !form.category || !form.subcategory}
                >
                  Continue <FiArrowRight />
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="postjob-step">
                <h2>Describe your job</h2>
                <p>Give students everything they need to understand what you want</p>

                <div className="form-group">
                  <label>Job description</label>
                  <textarea
                    name="description"
                    placeholder="Describe what you need done, your business, and the style you are looking for..."
                    value={form.description}
                    onChange={handleChange}
                    className="textarea-input"
                    rows={6}
                  />
                  <span className="input-hint">{form.description.length}/500 characters — minimum 100</span>
                </div>

                <div className="form-group">
                  <label>Requirements <span className="optional">(optional)</span></label>
                  <textarea
                    name="requirements"
                    placeholder="List specific skills or tools you want the student to have..."
                    value={form.requirements}
                    onChange={handleChange}
                    className="textarea-input"
                    rows={4}
                  />
                </div>

                <div className="step-buttons">
                  <button className="btn-outline postjob-back" onClick={handleBack}>
                    <FiArrowLeft /> Back
                  </button>
                  <button
                    className="btn-primary postjob-next"
                    onClick={handleNext}
                    disabled={form.description.length < 100}
                  >
                    Continue <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="postjob-step">
                <h2>Budget & timeline</h2>
                <p>Set a fair budget and timeline to attract the right students</p>

                <div className="form-group">
                  <label>Budget range</label>
                  <div className="budget-grid">
                    {budgetRanges.map(range => (
                      <div
                        key={range}
                        className={`budget-pill ${form.budgetRange === range ? 'budget-active' : ''}`}
                        onClick={() => setForm({ ...form, budgetRange: range })}
                      >
                        <FiDollarSign />
                        {range}
                      </div>
                    ))}
                  </div>
                </div>

                {form.budgetRange === 'Custom amount' && (
                  <div className="form-group">
                    <label>Enter your budget</label>
                    <div className="input-wrap">
                      <span className="input-icon" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>₦</span>
                      <input
                        type="number"
                        name="customBudget"
                        placeholder="e.g. 25000"
                        value={form.customBudget}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Project duration</label>
                  <div className="duration-grid">
                    {durations.map(dur => (
                      <div
                        key={dur}
                        className={`duration-pill ${form.duration === dur ? 'duration-active' : ''}`}
                        onClick={() => setForm({ ...form, duration: dur })}
                      >
                        <FiClock />
                        {dur}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="step-buttons">
                  <button className="btn-outline postjob-back" onClick={handleBack}>
                    <FiArrowLeft /> Back
                  </button>
                  <button
                    className="btn-primary postjob-next"
                    onClick={handleSubmit}
                    disabled={!form.budgetRange || !form.duration}
                  >
                    Post Job <FiArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - PREVIEW */}
          <div className="postjob-preview">
            <h3>Job Preview</h3>
            <div className="preview-card">
              <div className="preview-category">
                {form.category || 'Category'}
              </div>
              <h4 className="preview-title">
                {form.title || 'Your job title will appear here'}
              </h4>
              <p className="preview-desc">
                {form.description || 'Your job description will appear here once you fill it in...'}
              </p>
              {form.subcategory && (
                <span className="preview-sub">{form.subcategory}</span>
              )}
              <div className="preview-footer">
                <span className="preview-budget">
                  {form.budgetRange === 'Custom amount'
                    ? `₦${form.customBudget || '0'}`
                    : form.budgetRange || '₦0'}
                </span>
                {form.duration && (
                  <span className="preview-duration">
                    <FiClock /> {form.duration}
                  </span>
                )}
              </div>
            </div>

            <div className="preview-tips">
              <h4>💡 Tips for a great job post</h4>
              <ul>
                <li>Use a clear and specific title</li>
                <li>Describe exactly what you want</li>
                <li>Set a fair and realistic budget</li>
                <li>Be clear about your deadline</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PostJobPage