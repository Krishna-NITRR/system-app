import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { motion, useReducedMotion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';

interface Props {
  tag: string;
  title: string;
  description: string;
  resourceId: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  driveLink?: string;
}

export default function ResourceLandingPage({ tag, title, description, resourceId, seoTitle, seoDescription, canonicalPath, driveLink = "https://drive.google.com/drive/folders/placeholder" }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shouldReduceMotion = useReducedMotion();

  usePageMeta({
    title: seoTitle,
    description: seoDescription,
    canonical: `https://www.krishnamahawar.in${canonicalPath}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{ name, email, resource: resourceId }]);

      if (dbError && dbError.code !== '23505') {
        throw dbError;
      }

      window.location.href = driveLink;
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '32px 24px', textAlign: 'center' }}>
        <Link to="/" className="nav-logo" style={{ fontSize: '1.2rem' }}>Krishna Mahawar<span>.</span></Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px' }}>
        <div className="capture-form" style={{ maxWidth: '460px', width: '100%', padding: '40px 32px', marginTop: '4vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="playbook-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>{tag}</div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text)' }}>
              {title}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.6 }}>
              {description}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="f-field">
              <label htmlFor="name">First Name</label>
              <input 
                type="text" 
                id="name" 
                required 
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="f-field" style={{ marginBottom: '24px' }}>
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                required 
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {error && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

            <motion.button 
              type="submit" 
              className="f-submit" 
              disabled={loading} 
              style={{ padding: '16px', fontSize: '0.95rem', transformStyle: "preserve-3d", perspective: 800 }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95, y: 3, rotateX: 10 }}
            >
              {loading ? 'Processing...' : 'Get Resource'}
            </motion.button>
            <div className="f-note" style={{ marginTop: '16px' }}>
              Access link will open immediately after submission.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
