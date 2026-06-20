import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!message || message.trim().length < 5) {
      alert('Message must be at least 5 characters.');
      return;
    }
    
    setStatus('loading');
    
    const { error } = await supabase
      .from('contacts')
      .insert([{
        name: name || null,
        email: email.toLowerCase().trim(),
        subject: subject || null,
        message: message.trim(),
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert('Database error. Please try again.');
      setStatus('idle');
    } else {
      setStatus('success');
    }
  };

  return (
    <section className="sec bg2" id="contact" aria-labelledby="contact-heading">
      <div className="wrap">
        <span className="eyebrow">Contact</span>
        <h2 className="section-title" id="contact-heading">Get in Touch</h2>
        <div className="contact-layout fade">
          <div className="contact-info">
            <h3>Reach out directly</h3>
            <p>For research collaborations, book inquiries, speaking invitations, or questions. All messages are read personally.</p>
            <div className="contact-links">
              <a href="mailto:admin@krishnamahawar.in" className="contact-link">
                <div>
                  <span className="contact-link-label">Email</span>
                  <span className="contact-link-val">admin@krishnamahawar.in</span>
                </div>
              </a>
              <a href="https://www.linkedin.com/in/krishna-mahawar/" target="_blank" rel="noopener noreferrer" className="contact-link">
                <div>
                  <span className="contact-link-label">LinkedIn</span>
                  <span className="contact-link-val">linkedin.com/in/krishna-mahawar</span>
                </div>
              </a>
              <a href="https://krishnamahawar.in" className="contact-link">
                <div>
                  <span className="contact-link-label">Website</span>
                  <span className="contact-link-val">krishnamahawar.in</span>
                </div>
              </a>
            </div>
          </div>
          <div>
            <div className="capture-form" style={{ boxShadow: 'none' }}>
              {status !== 'success' ? (
                <form id="contactForm" onSubmit={handleSubmit} noValidate>
                  <div className="f-field">
                    <label htmlFor="c-name">Name (optional)</label>
                    <input type="text" id="c-name" name="name" placeholder="Your name" autoComplete="name" />
                  </div>
                  <div className="f-field">
                    <label htmlFor="c-email">Email *</label>
                    <input type="email" id="c-email" name="email" placeholder="you@example.com" required autoComplete="email" />
                  </div>
                  <div className="f-field">
                    <label htmlFor="c-subject">Subject</label>
                    <input type="text" id="c-subject" name="subject" placeholder="Research collaboration / Book inquiry / Other" />
                  </div>
                  <div className="f-field">
                    <label htmlFor="c-msg">Message</label>
                    <textarea id="c-msg" name="message" className="cf-textarea" placeholder="Your message..." required></textarea>
                  </div>
                  <button type="submit" className="f-submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              ) : (
                <div className="f-success show" id="contactSuccess">
                  <h3>Message received.</h3>
                  <p>Krishna will get back to you personally.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
