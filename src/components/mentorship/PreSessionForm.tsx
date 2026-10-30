import { useState } from 'react';
import { captureUtm, track } from '../../utils/analytics';

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

const SOURCES = ['LinkedIn', 'Google search', 'YouTube', 'A friend or senior', 'WhatsApp / Telegram group', 'Research club', 'A guide on this site', 'Other'];

// Extra intake answers that have no column of their own; they are appended to
// student_situation so they reach the booking row without a schema change.
function withIntakeNotes(situation: string, deadline: string, source: string, phone: string): string {
  const utm = captureUtm();
  const notes = [
    phone && `Contact no. (WhatsApp): ${phone}`,
    deadline && `Nearest deadline: ${deadline}`,
    source && `Found via: ${source}`,
    Object.keys(utm).length > 0 && `UTM: ${Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(', ')}`,
  ].filter(Boolean);
  return notes.length ? `${situation.trim()}\n\n---\n${notes.join('\n')}` : situation;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  border: '1px solid var(--div)',
  borderRadius: '8px',
  background: 'var(--bg2)',
  color: 'var(--text)',
  fontSize: '1rem',
  fontFamily: 'inherit',
};

const hintStyle: React.CSSProperties = { fontWeight: 400, textTransform: 'none', letterSpacing: 0 };

export default function PreSessionForm({ onSubmit, loading }: Props) {
  const [started, setStarted] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [source, setSource] = useState('');
  const [phone, setPhone] = useState('');
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

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Under-18 is its own checkbox so guardian consent applies at any stage
  const handleMinorToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isMinor = e.target.checked;
    setFormData(prev => ({
      ...prev,
      is_minor: isMinor,
      // Reset guardian fields if they are no longer a minor
      ...(isMinor ? {} : { guardian_email: '', guardian_consent: false })
    }));
  };

  const handleFocus = () => {
    if (!started) {
      setStarted(true);
      track('form_start');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track('form_complete', { stage: formData.academic_stage });
    onSubmit({ ...formData, student_situation: withIntakeNotes(formData.student_situation, deadline, source, phone.trim()) });
  };

  return (
    <div className="mentorship-form-card">
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', color: 'var(--text)' }}>About you</h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--tl)', margin: '0 0 24px 0' }}>I read every form before the session. The more specific you are, the more useful the call will be.</p>

      <form onSubmit={handleSubmit} onFocus={handleFocus} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="mentorship-form-grid">
          <div className="f-field">
            <label htmlFor="student_name">Full Name</label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              required
              autoComplete="name"
              value={formData.student_name}
              onChange={handleChange}
            />
          </div>
          <div className="f-field">
            <label htmlFor="student_email">Email <span style={hintStyle}>(for the Meet link)</span></label>
            <input
              type="email"
              id="student_email"
              name="student_email"
              required
              autoComplete="email"
              value={formData.student_email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="f-field">
          <label htmlFor="phone">Contact no. <span style={hintStyle}>(WhatsApp preferred, optional)</span></label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            pattern="\+?[0-9 \-]{7,20}"
            title="Digits only, with an optional + country code"
            placeholder="E.g., +91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="mentorship-form-grid">
          <div className="f-field">
            <label htmlFor="academic_stage">Current Stage</label>
            <select
              id="academic_stage"
              name="academic_stage"
              required
              value={formData.academic_stage}
              onChange={handleChange}
              style={fieldStyle}
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
          <div className="f-field">
            <label htmlFor="deadline">Nearest deadline <span style={hintStyle}>(if any)</span></label>
            <input
              type="text"
              id="deadline"
              name="deadline"
              placeholder="E.g., SRFP closes 15 Nov"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="f-field">
          <label htmlFor="student_situation">Your current situation <span style={hintStyle}>(college, year, what you are applying for)</span></label>
          <textarea
            id="student_situation"
            name="student_situation"
            required
            rows={3}
            placeholder="E.g., 3rd year Mechanical at an NIT. I've emailed 12 professors for summer internships and got 1 reply."
            value={formData.student_situation}
            onChange={handleChange}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div className="f-field">
          <label htmlFor="student_goal">The one thing you want to walk away with</label>
          <textarea
            id="student_goal"
            name="student_goal"
            required
            rows={2}
            placeholder="E.g., Which 5 professors to email first, and how to fix my email."
            value={formData.student_goal}
            onChange={handleChange}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div className="f-field">
          <label htmlFor="source">Where did you find me? <span style={hintStyle}>(optional)</span></label>
          <select id="source" name="source" value={source} onChange={e => setSource(e.target.value)} style={fieldStyle}>
            <option value="">Select one</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="is_minor"
            checked={formData.is_minor}
            onChange={handleMinorToggle}
            style={{ marginTop: '4px' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--tm)' }}>
            I am under 18 <span style={{ color: 'var(--tl)' }}>(we'll ask for a parent/guardian email)</span>
          </span>
        </label>

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
              <strong>Under 18:</strong> data protection regulations require parent/guardian consent to process your booking.
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: '16px', fontSize: '1rem', marginTop: '8px', width: '100%', justifyContent: 'center', borderRadius: '8px' }}
        >
          {loading ? 'Saving...' : 'Continue to pick a time'}
        </button>
      </form>
    </div>
  );
}
