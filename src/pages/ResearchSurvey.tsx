import { useState, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import usePageMeta from '../hooks/usePageMeta';
import useFadeObserver from '../hooks/useFadeObserver';
import { supabase } from '../supabaseClient';
import { motion, useReducedMotion } from 'framer-motion';
import './ResearchSurvey.css';

/* ── Types ── */
interface SurveyData {
  role: string;
  field_of_study: string;
  interests: string[];
  top_outcome: string;
  tried_research: string;
  biggest_challenge: string;
  google_search: string;
  book_wish: string;
  follow_up: string;
  email: string;
}

type StepId =
  | 'role'
  | 'field'
  | 'interests'
  | 'outcome'
  | 'tried_research'
  | 'challenge'
  | 'google_search'
  | 'book_wish'
  | 'follow_up';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

/* ── Constants ── */
const ROLE_OPTIONS = [
  'High school student',
  'Undergraduate',
  'Master\u2019s student',
  'PhD student',
  'Teacher',
  'Professor',
  'Industry professional',
  'Other',
] as const;

const INTEREST_OPTIONS = [
  'Research internship',
  'Higher studies',
  'Publishing papers',
  'Innovation',
  'Startup',
  'R&D',
  'College projects',
  'Competitions',
  'Curiosity',
  'Coursework',
  'Other',
] as const;

const OUTCOME_OPTIONS = [
  'Publish my first paper',
  'Understand research',
  'Get a research internship',
  'Higher studies',
  'Solve real-world problems',
  'Build innovative products',
  'Become a researcher',
  'Improve critical thinking',
] as const;

const STEPS: StepId[] = [
  'role',
  'field',
  'interests',
  'outcome',
  'tried_research',
  'challenge',
  'google_search',
  'book_wish',
  'follow_up',
];

const TOTAL_STEPS = STEPS.length;

/* ── Helper: empty survey ── */
function createEmptySurvey(): SurveyData {
  return {
    role: '',
    field_of_study: '',
    interests: [],
    top_outcome: '',
    tried_research: '',
    biggest_challenge: '',
    google_search: '',
    book_wish: '',
    follow_up: '',
    email: '',
  };
}

/* ── Component ── */
export default function ResearchSurvey() {
  const shouldReduceMotion = useReducedMotion();

  usePageMeta({
    title: 'Help Improve Research Education - Share Your Experience | Krishna Mahawar',
    description:
      'Share your research experiences and challenges to help shape better research education resources for students, educators, and researchers worldwide.',
    canonical: 'https://www.krishnamahawar.in/research-survey',
  });

  useFadeObserver();

  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<SurveyData>(createEmptySurvey);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];

  /* ── Field updaters ── */
  const updateField = useCallback(<K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    setData((prev) => {
      const next = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 2
          ? [...prev.interests, interest]
          : prev.interests;
      return { ...prev, interests: next };
    });
    setValidationError(null);
  }, []);

  /* ── Validation ── */
  const validate = useCallback((): boolean => {
    switch (currentStep) {
      case 'role':
        if (!data.role) { setValidationError('Please select who you are.'); return false; }
        break;
      case 'field':
        if (!data.field_of_study.trim()) { setValidationError('Please enter your field of study.'); return false; }
        break;
      case 'interests':
        if (data.interests.length === 0) { setValidationError('Please select at least one interest.'); return false; }
        break;
      case 'outcome':
        if (!data.top_outcome) { setValidationError('Please select the outcome that matters most.'); return false; }
        break;
      case 'tried_research':
        if (!data.tried_research) { setValidationError('Please select yes or no.'); return false; }
        break;
      case 'challenge':
        if (!data.biggest_challenge.trim()) { setValidationError('Please share your biggest challenge.'); return false; }
        break;
      case 'google_search':
        if (!data.google_search.trim()) { setValidationError('Please enter what you would search for.'); return false; }
        break;
      case 'book_wish':
        if (!data.book_wish.trim()) { setValidationError('Please complete the sentence.'); return false; }
        break;
      case 'follow_up':
        if (!data.follow_up) { setValidationError('Please select yes or no.'); return false; }
        if (data.follow_up === 'Yes' && (!data.email.trim() || !data.email.includes('@'))) {
          setValidationError('Please enter a valid email address.');
          return false;
        }
        break;
    }
    setValidationError(null);
    return true;
  }, [currentStep, data]);

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    if (!validate()) return;

    if (stepIndex === TOTAL_STEPS - 1) {
      handleSubmit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, TOTAL_STEPS - 1));
  }, [stepIndex, validate]);

  const goBack = useCallback(() => {
    setValidationError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'TEXTAREA') {
          e.preventDefault();
          goNext();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    setSubmitStatus('loading');
    setSubmitError(null);

    const { error } = await supabase
      .from('book_survey')
      .insert([{
        role: data.role,
        field_of_study: data.field_of_study.trim(),
        interests: data.interests,
        top_outcome: data.top_outcome,
        tried_research: data.tried_research === 'Yes',
        biggest_challenge: data.biggest_challenge.trim(),
        google_search: data.google_search.trim(),
        book_wish: data.book_wish.trim(),
        follow_up: data.follow_up === 'Yes',
        email: data.follow_up === 'Yes' ? data.email.toLowerCase().trim() : null,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Survey submission error:', error);
      if (error.code === '42P01') {
        setSubmitError('The survey system is being set up. Please try again later.');
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
      setSubmitStatus('error');
    } else {
      setSubmitStatus('success');
    }
  };

  /* ── Scroll to top on mount ── */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ── JSON-LD ── */
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Help Improve Research Education - Survey',
      'description': 'Share your research experiences and challenges to help shape better research education resources.',
      'url': 'https://www.krishnamahawar.in/research-survey',
      'author': {
        '@type': 'Person',
        'name': 'Krishna Mahawar',
      },
      'publisher': {
        '@type': 'Person',
        'name': 'Krishna Mahawar',
      },
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  /* ── Progress ── */
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  /* ── Scroll to survey on CTA click ── */
  const scrollToSurvey = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('survey')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── Render helpers ── */
  const renderSingleSelect = (
    options: readonly string[],
    selected: string,
    onSelect: (val: string) => void,
    idPrefix: string,
  ) => (
    <div className="survey-options" role="radiogroup" aria-label="Select one option">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          id={`${idPrefix}-${option.toLowerCase().replace(/\s+/g, '-')}`}
          aria-checked={selected === option}
          className={`survey-option ${selected === option ? 'selected' : ''}`}
          onClick={() => onSelect(option)}
        >
          <span className="survey-option-radio" aria-hidden="true" />
          {option}
        </button>
      ))}
    </div>
  );

  const renderMultiSelect = (
    options: readonly string[],
    selected: string[],
    onToggle: (val: string) => void,
    maxLabel: string,
    idPrefix: string,
  ) => (
    <>
      <p className="survey-hint">{maxLabel}</p>
      <div className="survey-options" role="group" aria-label="Select options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="checkbox"
            id={`${idPrefix}-${option.toLowerCase().replace(/\s+/g, '-')}`}
            aria-checked={selected.includes(option)}
            className={`survey-option ${selected.includes(option) ? 'selected' : ''}`}
            onClick={() => onToggle(option)}
          >
            <span className="survey-option-check" aria-hidden="true" />
            {option}
          </button>
        ))}
      </div>
    </>
  );

  const renderYesNo = (
    selected: string,
    onSelect: (val: string) => void,
    idPrefix: string,
  ) => (
    <div className="survey-yesno" role="radiogroup" aria-label="Select yes or no">
      {['Yes', 'No'].map((val) => (
        <button
          key={val}
          type="button"
          role="radio"
          id={`${idPrefix}-${val.toLowerCase()}`}
          aria-checked={selected === val}
          className={`survey-option ${selected === val ? 'selected' : ''}`}
          onClick={() => onSelect(val)}
        >
          <span className="survey-option-radio" aria-hidden="true" />
          {val}
        </button>
      ))}
    </div>
  );

  /* ── Step content ── */
  const renderStep = () => {
    switch (currentStep) {
      case 'role':
        return (
          <div className="survey-step" key="role">
            <h2 className="survey-step-question" id="step-question">Who are you?</h2>
            {renderSingleSelect(ROLE_OPTIONS, data.role, (v) => updateField('role', v), 'role')}
          </div>
        );
      case 'field':
        return (
          <div className="survey-step" key="field">
            <h2 className="survey-step-question" id="step-question">What is your field of study?</h2>
            <input
              type="text"
              id="field-of-study"
              className="survey-input"
              placeholder="e.g. Computer Science, Mechanical Engineering, Biology"
              value={data.field_of_study}
              onChange={(e) => updateField('field_of_study', e.target.value)}
              autoComplete="off"
              aria-describedby="step-question"
            />
          </div>
        );
      case 'interests':
        return (
          <div className="survey-step" key="interests">
            <h2 className="survey-step-question" id="step-question">Why are you interested in research?</h2>
            {renderMultiSelect(INTEREST_OPTIONS, data.interests, toggleInterest, 'Select up to 2 options', 'interest')}
          </div>
        );
      case 'outcome':
        return (
          <div className="survey-step" key="outcome">
            <h2 className="survey-step-question" id="step-question">Which ONE outcome matters most to you?</h2>
            {renderSingleSelect(OUTCOME_OPTIONS, data.top_outcome, (v) => updateField('top_outcome', v), 'outcome')}
          </div>
        );
      case 'tried_research':
        return (
          <div className="survey-step" key="tried_research">
            <h2 className="survey-step-question" id="step-question">Have you tried research before?</h2>
            {renderYesNo(data.tried_research, (v) => updateField('tried_research', v), 'tried')}
          </div>
        );
      case 'challenge':
        return (
          <div className="survey-step" key="challenge">
            <h2 className="survey-step-question" id="step-question">What is the biggest challenge stopping you today?</h2>
            <textarea
              id="biggest-challenge"
              className="survey-textarea"
              placeholder="What's holding you back from starting or progressing in research?"
              value={data.biggest_challenge}
              onChange={(e) => updateField('biggest_challenge', e.target.value)}
              aria-describedby="step-question"
            />
          </div>
        );
      case 'google_search':
        return (
          <div className="survey-step" key="google_search">
            <h2 className="survey-step-question" id="step-question">If you searched Google today, what would you type?</h2>
            <input
              type="text"
              id="google-search"
              className="survey-input"
              placeholder="e.g. how to start research as an undergraduate"
              value={data.google_search}
              onChange={(e) => updateField('google_search', e.target.value)}
              autoComplete="off"
              aria-describedby="step-question"
            />
          </div>
        );
      case 'book_wish':
        return (
          <div className="survey-step" key="book_wish">
            <h2 className="survey-step-question" id="step-question">Complete the sentence:</h2>
            <p className="survey-hint" style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--tm)', marginBottom: '20px' }}>
              &ldquo;I wish there were a book that ______.&rdquo;
            </p>
            <textarea
              id="book-wish"
              className="survey-textarea"
              placeholder="...taught me exactly how to go from zero to publishing my first paper"
              value={data.book_wish}
              onChange={(e) => updateField('book_wish', e.target.value)}
              aria-describedby="step-question"
            />
          </div>
        );
      case 'follow_up':
        return (
          <div className="survey-step" key="follow_up">
            <h2 className="survey-step-question" id="step-question">Would you be interested in a short follow-up conversation?</h2>
            {renderYesNo(data.follow_up, (v) => updateField('follow_up', v), 'followup')}
            {data.follow_up === 'Yes' && (
              <div className="survey-email-field">
                <label className="survey-email-label" htmlFor="followup-email">
                  Your email address
                </label>
                <input
                  type="email"
                  id="followup-email"
                  className="survey-input"
                  placeholder="you@example.com"
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  /* ── Main render ── */
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="sec" style={{ paddingTop: '120px' }} aria-labelledby="survey-heading">
        <div className="wrap">
          <div className="survey-hero">
            <motion.span
              className="eyebrow"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Research Education Initiative
            </motion.span>
            <motion.h1
              id="survey-heading"
              className="section-title"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: '18px' }}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Help Improve <span className="accent">Research Education</span>
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              I&rsquo;m speaking with students, educators, and researchers to better understand the challenges beginners face while learning research. Your insights will directly influence:
            </motion.p>
            <motion.ul
              className="survey-hero-benefits fade"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <li>An upcoming beginner-friendly research book</li>
              <li>Free educational resources</li>
              <li>Future research learning initiatives</li>
              <li>Community-driven resources</li>
            </motion.ul>
            <motion.div
              className="survey-meta"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="survey-meta-item">
                <span className="survey-meta-label">Estimated time</span>
                <span className="survey-meta-value">2–3 minutes</span>
              </div>
            </motion.div>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <a href="#survey" className="btn btn-primary" onClick={scrollToSurvey}>
                Share Your Experience
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Survey Section */}
      <section className="sec bg3" id="survey" aria-labelledby="survey-form-heading">
        <div className="wrap">
          <div className="text-center fade" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="eyebrow">Your Perspective Matters</span>
            <h2 className="section-title" id="survey-form-heading">Share Your Research Experience</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Every response helps build better resources for the next generation of researchers.
            </p>
          </div>

          <div className="survey-container fade">
            {submitStatus === 'success' ? (
              <div className="survey-success" role="status" aria-live="polite">
                <div className="survey-success-icon" aria-hidden="true">✓</div>
                <h3>Thank You for Contributing</h3>
                <p>
                  Your insights are incredibly valuable. They will directly shape how we build better research education resources for students everywhere.
                </p>
              </div>
            ) : submitStatus === 'loading' ? (
              <div className="survey-loading" role="status" aria-live="polite">
                <div className="survey-spinner" aria-hidden="true" />
                <span className="survey-loading-text">Submitting your response…</span>
              </div>
            ) : (
              <form
                onSubmit={(e: FormEvent) => { e.preventDefault(); goNext(); }}
                noValidate
                aria-labelledby="step-question"
              >
                {/* Progress */}
                <div className="survey-progress" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${stepIndex + 1} of ${TOTAL_STEPS}`}>
                  <div className="survey-progress-header">
                    <span className="survey-progress-label">Progress</span>
                    <span className="survey-progress-count">{stepIndex + 1} / {TOTAL_STEPS}</span>
                  </div>
                  <div className="survey-progress-track">
                    <div className="survey-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Submit-level error */}
                {submitStatus === 'error' && submitError && (
                  <div className="survey-submit-error" role="alert">{submitError}</div>
                )}

                {/* Step content */}
                {renderStep()}

                {/* Validation error */}
                {validationError && (
                  <div className="survey-error" role="alert">{validationError}</div>
                )}

                {/* Nav buttons */}
                <div className="survey-nav">
                  {!isFirstStep && (
                    <button
                      type="button"
                      className="survey-btn-back"
                      onClick={goBack}
                      aria-label="Go to previous question"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="survey-btn-next"
                    aria-label={isLastStep ? 'Submit survey' : 'Go to next question'}
                  >
                    {isLastStep ? 'Submit' : 'Next →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
