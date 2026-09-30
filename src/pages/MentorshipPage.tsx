import { useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { mentorshipConfig } from '../config/mentorship';
import MentorshipBooking from '../components/mentorship/MentorshipBooking';
import { Link } from 'react-router-dom';

export default function MentorshipPage() {
  usePageMeta({
    title: '1:1 Mentorship — Research, Internships & Career Guidance · Krishna Mahawar',
    description: 'Book a 30-minute 1:1 session with Krishna Mahawar. Get practical guidance on research internships, cold emails, career direction, and publishing. ₹1,699 / $20.',
    canonical: 'https://www.krishnamahawar.in/mentorship',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar Minimalist */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          Krishna Mahawar<span style={{ color: '#6C4CF1' }}>.</span>
        </Link>
        <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#888'}>
          Back to home →
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(108,76,241,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(108,76,241,0.1)', color: '#a085ff', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '32px', border: '1px solid rgba(108,76,241,0.2)' }}>
            Exclusive 1:1 Mentorship
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Not sure what to do next with research, internships, or your career?
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#999', lineHeight: 1.6, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>
            Get 30 focused minutes where we figure it out together. You will leave with a clear, written action plan built around your specific situation. Not generic advice. Not a pep talk.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#booking" style={{ background: '#6C4CF1', color: '#fff', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 8px 24px rgba(108,76,241,0.3)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(108,76,241,0.4)' }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(108,76,241,0.3)' }}>
              Book a Session
            </a>
            <a href="#includes" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s ease', border: '1px solid rgba(255,255,255,0.1)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              See what's included
            </a>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section id="includes" style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', letterSpacing: '-0.02em' }}>What You Get</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {mentorshipConfig.includes.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: 600 }}>{item.title}</h3>
                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is this the right fit? */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', letterSpacing: '-0.02em' }}>Is this the right fit?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(39, 174, 96, 0.05) 0%, rgba(39, 174, 96, 0) 100%)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(39, 174, 96, 0.2)' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#27ae60', background: 'rgba(39,174,96,0.2)', padding: '8px', borderRadius: '50%' }}>✓</span> This is for you if:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mentorshipConfig.goodFor.map((item, i) => (
                  <li key={i} style={{ color: '#aaa', fontSize: '1rem', display: 'flex', gap: '16px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: '#27ae60', marginTop: '2px' }}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'linear-gradient(145deg, rgba(231, 76, 60, 0.05) 0%, rgba(231, 76, 60, 0) 100%)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '32px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#e74c3c', background: 'rgba(231,76,60,0.2)', padding: '8px', borderRadius: '50%' }}>×</span> This is NOT for you if:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {mentorshipConfig.notFor.map((item, i) => (
                  <li key={i} style={{ color: '#aaa', fontSize: '1rem', display: 'flex', gap: '16px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: '#e74c3c', marginTop: '2px' }}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', letterSpacing: '-0.02em' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {mentorshipConfig.process.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', background: 'rgba(255,255,255,0.03)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(108,76,241,0.1)', color: '#a085ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: 600 }}>{step.title}</h3>
                  <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Component */}
      <div style={{ padding: '100px 24px', background: '#0a0a0a' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '1000px', margin: '0 auto' }}>
          <MentorshipBooking />
        </div>
      </div>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {mentorshipConfig.faq.map((faq, i) => (
              <div key={i} style={{ paddingBottom: '32px', borderBottom: i !== mentorshipConfig.faq.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 600, color: '#e0e0e0' }}>{faq.question}</h3>
                <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer style={{ padding: '48px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#666', fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} Krishna Mahawar. All rights reserved.</p>
      </footer>
    </div>
  );
}
