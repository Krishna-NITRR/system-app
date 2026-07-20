import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../config/copy';
import usePageMeta from '../hooks/usePageMeta';

export default function WaitlistSuccessPage() {
  usePageMeta({
    title: `Waitlist Joined`,
    description: copy.waitlist.message,
    canonical: `https://www.krishnamahawar.in/waitlist-success`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '32px 24px', textAlign: 'center' }}>
        <Link to="/" className="nav-logo" style={{ fontSize: '1.2rem' }}>Krishna Mahawar<span>.</span></Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="capture-form" style={{ maxWidth: '460px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text)' }}>
            {copy.waitlist.heading}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--tm)', lineHeight: 1.6, marginBottom: '24px', whiteSpace: 'pre-line' }}>
            {copy.waitlist.message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              {copy.waitlist.primaryCTA} &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
