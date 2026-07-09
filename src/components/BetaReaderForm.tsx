import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import { motion, useReducedMotion } from 'framer-motion';

export default function BetaReaderForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const school = formData.get('school') as string;
    const year = formData.get('year') as string;
    const linkedin = formData.get('linkedin') as string;
    const experience = formData.get('experience') as string;
    const motivation = formData.get('motivation') as string;
    const commitment = formData.get('commitment') === 'on';
    const additionalInfo = formData.get('additionalInfo') as string;
    
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!name || !school || !year || !experience || !motivation) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!commitment) {
      setErrorMsg('You must commit to providing feedback to apply.');
      return;
    }
    
    setStatus('loading');
    
    // Attempting to insert into beta_readers table.
    // If the table doesn't exist yet, it will throw an error, which we will catch and show gracefully.
    const { error } = await supabase
      .from('beta_readers')
      .insert([{
        name,
        email: email.toLowerCase().trim(),
        school,
        year,
        linkedin: linkedin || null,
        experience,
        motivation,
        commitment,
        additional_info: additionalInfo || null,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error(error);
      if (error.code === '42P01') {
        // Table does not exist yet.
        setErrorMsg('The beta reader application system is being set up. Please try again later.');
      } else if (error.code === '23505') {
        setErrorMsg('You have already applied with this email.');
      } else {
        setErrorMsg('Something went wrong submitting your application. Please try again.');
      }
      setStatus('idle');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        className="beta-form-wrap beta-success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3>Application Received</h3>
        <p>Thank you for stepping up. I'm personally reviewing applications and will reach out via email if you're selected.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="beta-form-wrap"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3>Apply to be a Beta Reader</h3>
      <p>I read every single application.</p>

      {errorMsg && (
        <div style={{ color: '#e53935', background: 'rgba(229,57,53,0.1)', padding: '12px', borderRadius: '4px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 500 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="beta-form" noValidate>
        <div className="form-group">
          <label htmlFor="br-name">Full Name <span>*</span></label>
          <input type="text" id="br-name" name="name" placeholder="John Doe" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="br-email">Email Address <span>*</span></label>
          <input type="email" id="br-email" name="email" placeholder="john@university.edu" required />
        </div>

        <div className="form-group">
          <label htmlFor="br-school">School / University <span>*</span></label>
          <input type="text" id="br-school" name="school" placeholder="e.g. Stanford University" required />
        </div>

        <div className="form-group">
          <label htmlFor="br-year">Current Academic Year <span>*</span></label>
          <select id="br-year" name="year" required>
            <option value="">Select your year</option>
            <option value="high-school">High School</option>
            <option value="freshman">College Freshman (1st Year)</option>
            <option value="sophomore">College Sophomore (2nd Year)</option>
            <option value="junior">College Junior (3rd Year)</option>
            <option value="senior">College Senior (4th Year)</option>
            <option value="grad">Graduate Student</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="br-linkedin">LinkedIn Profile (Optional)</label>
          <input type="url" id="br-linkedin" name="linkedin" placeholder="https://linkedin.com/in/johndoe" />
        </div>

        <div className="form-group">
          <label htmlFor="br-exp">Have you worked on research before? <span>*</span></label>
          <textarea id="br-exp" name="experience" placeholder="Briefly describe your experience (or lack thereof). It is completely okay if you have 0 experience - that's who this book is for." required></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="br-mot">Why do you want to become a beta reader? <span>*</span></label>
          <textarea id="br-mot" name="motivation" placeholder="What are you hoping to learn or achieve from reading this book early?" required></textarea>
        </div>

        <div className="form-group checkbox-group">
          <input type="checkbox" id="br-commit" name="commitment" required />
          <label htmlFor="br-commit">I commit to reading the early chapters and providing honest, detailed, and constructive feedback.</label>
        </div>

        <div className="form-group">
          <label htmlFor="br-add">Anything else I should know? (Optional)</label>
          <textarea id="br-add" name="additionalInfo" placeholder="Any specific topics you're passionate about, or anything else you'd like to share."></textarea>
        </div>

        <motion.button 
          type="submit" 
          className="btn btn-primary beta-submit"
          disabled={status === 'loading'}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Application'}
        </motion.button>
      </form>
    </motion.div>
  );
}
