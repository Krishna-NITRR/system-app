import { useState } from 'react';

export interface PreSessionFormData {
  student_name: string;
  student_email: string;
  student_situation: string;
  student_goal: string;
  academic_stage: string;
  is_minor: boolean;
  guardian_email: string;
  guardian_consent: boolean;
}

interface Props {
  onSubmit: (data: PreSessionFormData) => void;
  loading: boolean;
}

export default function PreSessionForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<PreSessionFormData>({
    student_name: '',
    student_email: '',
    student_situation: '',
    student_goal: '',
    academic_stage: '',
    is_minor: false,
    guardian_email: '',
    guardian_consent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox handling
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // Special handling for academic_stage which drives is_minor
    if (name === 'academic_stage') {
      const isMinor = value === 'High School';
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        is_minor: isMinor,
        // Reset guardian fields if they are no longer a minor
        ...(isMinor ? {} : { guardian_email: '', guardian_consent: false })
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)', padding: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 24px 0', color: 'var(--text)' }}>Tell me about yourself</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="f-field">
            <label htmlFor="student_name">Full Name</label>
            <input 
              type="text" 
              id="student_name" 
              name="student_name" 
              required 
              value={formData.student_name}
              onChange={handleChange}
            />
          </div>
          <div className="f-field">
            <label htmlFor="student_email">Email (Where I'll send the link)</label>
            <input 
              type="email" 
              id="student_email" 
              name="student_email" 
              required 
              value={formData.student_email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="f-field">
          <label htmlFor="academic_stage">Current Stage</label>
          <select 
            id="academic_stage" 
            name="academic_stage" 
            required 
            value={formData.academic_stage}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--div)',
              borderRadius: '8px',
              background: 'var(--bg2)',
              color: 'var(--text)',
              fontSize: '1rem'
            }}
          >
            <option value="" disabled>Select your stage</option>
            <option value="High School">High School (11th/12th)</option>
            <option value="1st Year">1st Year Undergrad</option>
            <option value="2nd Year">2nd Year Undergrad</option>
            <option value="3rd Year">3rd Year Undergrad</option>
            <option value="4th Year">4th Year Undergrad</option>
            <option value="Masters">Masters / Postgrad</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.is_minor && (
          <div style={{ 
            background: 'rgba(231, 76, 60, 0.05)', 
            border: '1px solid rgba(231, 76, 60, 0.2)', 
            padding: '16px', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
              <strong>Under 18 Notice:</strong> Since you are in high school, data protection regulations require parent/guardian consent to process your booking.
            </p>
            
            <div className="f-field">
              <label htmlFor="guardian_email">Parent/Guardian Email</label>
              <input 
                type="email" 
                id="guardian_email" 
                name="guardian_email" 
                required={formData.is_minor}
                value={formData.guardian_email}
                onChange={handleChange}
              />
            </div>
            
            <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="guardian_consent"
                required={formData.is_minor}
                checked={formData.guardian_consent}
                onChange={handleChange}
                style={{ marginTop: '4px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--tm)' }}>
                I confirm that my parent/guardian is aware of this booking and consents to my participation and data processing.
              </span>
            </label>
          </div>
        )}

        <div className="f-field">
          <label htmlFor="student_situation">What is your current situation?</label>
          <textarea 
            id="student_situation" 
            name="student_situation" 
            required 
            rows={4}
            placeholder="E.g., I'm a 2nd year CS student at an NIT. I want to apply for research internships next summer but I don't have any papers published yet."
            value={formData.student_situation}
            onChange={handleChange}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--div)', borderRadius: '8px', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div className="f-field">
          <label htmlFor="student_goal">What is the ONE main thing you want out of this 30-min call?</label>
          <textarea 
            id="student_goal" 
            name="student_goal" 
            required 
            rows={3}
            placeholder="E.g., Help me review my cold email template and pick 5 professors to email."
            value={formData.student_goal}
            onChange={handleChange}
            style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--div)', borderRadius: '8px', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ padding: '16px', fontSize: '1rem', marginTop: '8px', width: '100%' }}
        >
          {loading ? 'Saving...' : 'Continue to Payment →'}
        </button>
      </form>
    </div>
  );
}
