import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import './ReferralLanding.css';

interface ReferrerInfo {
  name: string;
}

export default function ReferralLanding() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('ref') || '';
  
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [error, setError] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    year: '',
    researchInterests: '',
    currentStage: '',
    motivation: '',
    linkedIn: '',
  });

  usePageMeta({
    title: 'Apply for Mentorship — Private Invitation',
    description: 'You have been invited to apply for the exclusive mentorship program.',
    canonical: 'https://www.krishnamahawar.in/join',
  });

  useEffect(() => {
    async function validateCode() {
      if (!code) {
        setLoading(false);
        setValid(false);
        setError('No invitation code provided.');
        return;
      }

      try {
        const res = await fetch(`/api/referral/validate?code=${code}`);
        const data = await res.json();
        
        if (data.success && data.data.valid) {
          setValid(true);
          setReferrer(data.data.referrer);
        } else {
          setValid(false);
          setError(data.error?.message || 'Invalid or expired invitation.');
        }
      } catch (err) {
        setValid(false);
        setError('Could not validate invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    validateCode();
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...formData })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        setFormError(data.error?.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="ref-landing ref-loading">Verifying invitation...</div>;
  }

  if (!valid && !submitted) {
    return (
      <div className="ref-landing">
        <nav className="ref-nav">
          <Link to="/">Krishna Mahawar<span className="dot">.</span></Link>
          <Link to="/" className="ref-nav-back">Back to home →</Link>
        </nav>
        <div className="ref-invalid">
          <h2>Invitation Invalid</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '24px' }}>Return to Homepage</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="ref-landing">
        <nav className="ref-nav">
          <Link to="/">Krishna Mahawar<span className="dot">.</span></Link>
          <Link to="/" className="ref-nav-back">Back to home →</Link>
        </nav>
        <div className="ref-success-card">
          <div className="ref-success-icon">✨</div>
          <h2>Application Received</h2>
          <p>
            Thank you for applying. We have received your application and will review it shortly. 
            You will be contacted via email regarding the next steps.
          </p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '32px' }}>Return to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ref-landing">
      <nav className="ref-nav">
        <Link to="/">Krishna Mahawar<span className="dot">.</span></Link>
        <Link to="/" className="ref-nav-back">Back to home →</Link>
      </nav>

      <section className="ref-hero fade vis">
        <div className="ref-hero-glow" />
        <div className="ref-hero-inner">
          <div className="ref-badge">
            <span className="ref-badge-dot"></span> Private Invitation
          </div>
          <h1>Apply for Mentorship</h1>
          <p className="ref-hero-sub">
            This mentorship is application-based and access is limited. 
            You have been granted access to apply through a private referral.
          </p>
          {referrer && (
            <div className="ref-invited-by">
              <span>Invited by <strong>{referrer.name}</strong></span>
            </div>
          )}
        </div>
      </section>

      <section className="ref-features">
        <div className="ref-features-inner">
          <h2>What to Expect</h2>
          <div className="ref-features-grid">
            <div className="ref-feature-card">
              <div className="ref-feature-icon">🎯</div>
              <h3>Curated Community</h3>
              <p>Connect with peers who are serious about research and their careers.</p>
            </div>
            <div className="ref-feature-card">
              <div className="ref-feature-icon">💡</div>
              <h3>Personal Guidance</h3>
              <p>Receive tailored advice on research, internships, and career roadmaps.</p>
            </div>
            <div className="ref-feature-card">
              <div className="ref-feature-icon">🔒</div>
              <h3>Limited Access</h3>
              <p>Applications are reviewed to ensure quality and commitment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ref-form-section">
        <div className="ref-form-wrap">
          <h2>Application Form</h2>
          <p className="ref-form-sub">Please fill out this form thoughtfully. Every application is reviewed manually.</p>
          
          {formError && <div className="ref-error" style={{ marginBottom: '24px' }}>{formError}</div>}
          
          <form className="ref-form" onSubmit={handleSubmit}>
            <div className="ref-form-row">
              <div className="ref-field">
                <label>Full Name <span className="req">*</span></label>
                <input required name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g. Aditi Sharma" />
              </div>
              <div className="ref-field">
                <label>Email Address <span className="req">*</span></label>
                <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="aditi@example.com" />
              </div>
            </div>

            <div className="ref-form-row">
              <div className="ref-field">
                <label>College / University <span className="req">*</span></label>
                <input required name="college" type="text" value={formData.college} onChange={handleChange} placeholder="e.g. NIT Raipur" />
              </div>
              <div className="ref-field">
                <label>Current Year <span className="req">*</span></label>
                <select required name="year" value={formData.year} onChange={handleChange}>
                  <option value="" disabled>Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated / Masters / PhD</option>
                </select>
              </div>
            </div>

            <div className="ref-field">
              <label>Current Stage in Research</label>
              <select name="currentStage" value={formData.currentStage} onChange={handleChange}>
                <option value="" disabled>Select current stage</option>
                <option value="Just starting out">Just starting out</option>
                <option value="Looking for topics">Looking for topics</option>
                <option value="Working on a paper">Working on a paper</option>
                <option value="Published / Seeking internships">Published / Seeking internships</option>
              </select>
            </div>

            <div className="ref-field">
              <label>Research Interests</label>
              <input name="researchInterests" type="text" value={formData.researchInterests} onChange={handleChange} placeholder="e.g. Machine Learning, Computer Vision" />
            </div>

            <div className="ref-field">
              <label>Why do you want mentorship? <span className="req">*</span></label>
              <textarea required name="motivation" value={formData.motivation} onChange={handleChange} placeholder="Please explain what you hope to achieve and why you are applying..." />
            </div>

            <div className="ref-field">
              <label>LinkedIn Profile (Optional)</label>
              <input name="linkedIn" type="url" value={formData.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>

            <button type="submit" className="ref-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </section>

      <footer className="ref-footer">
        © {new Date().getFullYear()} Krishna Mahawar. All rights reserved.
      </footer>
    </div>
  );
}
