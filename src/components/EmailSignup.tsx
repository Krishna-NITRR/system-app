import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import { motion, useReducedMotion } from 'framer-motion';

export default function EmailSignup() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const stage = formData.get('stage') as string;
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    
    setStatus('loading');
    
    const { error } = await supabase
      .from('signups')
      .insert([{
        name: name || null,
        email: email.toLowerCase().trim(),
        stage: stage || null,
        created_at: new Date().toISOString()
      }]);

    if (error && error.code !== '23505') {
      alert('Database error. Please try again.');
      setStatus('idle');
    } else {
      setStatus('success');
    }
  };

  return (
    <section className="sec bg3" id="signup" aria-labelledby="signup-heading">
      <div className="capture-layout fade">
        <motion.div 
          className="capture-left"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: 15, x: -50 }}
          whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          style={{ perspective: 1000 }}
        >
          <span className="eyebrow">Early Access</span>
          <h2 id="signup-heading">Get research templates, cold email scripts, and internship systems before launch</h2>
          <p>Join the early list. Receive practical research frameworks, not generic advice.</p>
          <ul className="capture-list">
            <li>Cold email templates based on 130+ real emails</li>
            <li>Fellowship list with 50+ programs and deadlines</li>
            <li>Internship application system step by step</li>
            <li>Early chapters of Think Research Publish</li>
            <li>Professor outreach database access</li>
          </ul>
        </motion.div>
        
        <motion.div 
          className="capture-form"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotateY: -15, x: 50 }}
          whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          style={{ perspective: 1000 }}
        >
          {status !== 'success' ? (
            <div id="formWrap">
              <h3>Join the Early List</h3>
              <form onSubmit={handleSubmit} noValidate>
                <div className="f-field">
                  <label htmlFor="s-name">Name (optional)</label>
                  <input type="text" id="s-name" name="name" placeholder="Your name" autoComplete="name" />
                </div>
                <div className="f-field">
                  <label htmlFor="s-email">Email *</label>
                  <input type="email" id="s-email" name="email" placeholder="you@example.com" required autoComplete="email" />
                </div>
                <div className="f-field">
                  <label htmlFor="s-stage">Your stage</label>
                  <select id="s-stage" name="stage">
                    <option value="">Select</option>
                    <option value="high-school">High school student</option>
                    <option value="undergraduate">Undergraduate student</option>
                    <option value="research-intern">Research intern / SRFP applicant</option>
                    <option value="early-researcher">Early researcher / postgrad</option>
                    <option value="curious">Just curious about research</option>
                  </select>
                </div>
                <motion.button 
                  type="submit" 
                  className="f-submit" 
                  disabled={status === 'loading'}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95, y: 3, rotateX: 10 }}
                  style={{ transformStyle: "preserve-3d", perspective: 800 }}
                >
                  {status === 'loading' ? 'Saving...' : 'Join the Waitlist'}
                </motion.button>
              </form>
              <p className="f-note">No spam. Unsubscribe anytime.</p>
            </div>
          ) : (
            <div className="f-success show" id="formSuccess">
              <h3>You're on the list.</h3>
              <p>You'll receive templates, frameworks, and early chapters. Watch your inbox.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
