import { useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { mentorshipConfig } from '../config/mentorship';
import MentorshipBooking from '../components/mentorship/MentorshipBooking';
import { Link } from 'react-router-dom';

export default function MentorshipPage() {
  usePageMeta({
    title: '1:1 Mentorship — Research, Internships & Career Guidance · Krishna Mahawar',
    description: 'Book a 30-minute 1:1 session with Krishna Mahawar. Get practical guidance on research internships, cold emails, career direction, and publishing. ₹399 / $20.',
    canonical: 'https://www.krishnamahawar.in/mentorship',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ color: '#111827', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          Krishna Mahawar<span style={{ color: '#6C4CF1' }}>.</span>
        </Link>
        <Link
          to="/"
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}
          onMouseOver={e => e.currentTarget.style.color = '#111827'}
          onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
        >
          Back to home →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #faf9ff 0%, #ffffff 100%)' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at top, rgba(108,76,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(108,76,241,0.08)', color: '#6C4CF1', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '32px', border: '1px solid rgba(108,76,241,0.15)' }}>
            Exclusive 1:1 Mentorship
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px', color: '#111827' }}>
            Not sure what to do next with research, internships, or your career?
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '48px', maxWidth: '580px', margin: '0 auto 48px auto' }}>
            Get 30 focused minutes where we figure it out together. You leave with a clear, written action plan built around your specific situation.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#booking"
              style={{ background: '#6C4CF1', color: '#fff', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(108,76,241,0.3)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(108,76,241,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,76,241,0.3)'; }}
            >
              Book a Session — ₹{mentorshipConfig.priceINR}
            </a>
            <a
              href="#includes"
              style={{ background: '#fff', color: '#374151', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '1.5px solid #e5e7eb', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6C4CF1'; e.currentTarget.style.color = '#6C4CF1'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              See what's included
            </a>
          </div>
        </div>
      </section>

      {/* Price tag strip */}
      <div style={{ background: '#6C4CF1', padding: '14px 24px', textAlign: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
        💡 Have a referral code from a friend? Enter it at checkout to get <strong>10% off</strong>.
      </div>

      {/* What You Get */}
      <section id="includes" style={{ padding: '80px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '16px', color: '#111827', letterSpacing: '-0.02em' }}>What You Get</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '56px', fontSize: '1rem' }}>Every session includes all of the following.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {mentorshipConfig.includes.map((item, i) => (
              <div
                key={i}
                style={{ background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #e5e7eb', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: 700, color: '#111827' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is this right for you */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '56px', color: '#111827', letterSpacing: '-0.02em' }}>Is this the right fit?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#f0fdf4', padding: '36px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                <span style={{ color: '#16a34a', background: 'rgba(22,163,74,0.12)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✓</span>
                This is for you if:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mentorshipConfig.goodFor.map((item, i) => (
                  <li key={i} style={{ color: '#374151', fontSize: '0.95rem', display: 'flex', gap: '12px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#fff5f5', padding: '36px', borderRadius: '16px', border: '1px solid #fecaca' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                <span style={{ color: '#dc2626', background: 'rgba(220,38,38,0.1)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>×</span>
                This is NOT for you if:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {mentorshipConfig.notFor.map((item, i) => (
                  <li key={i} style={{ color: '#374151', fontSize: '0.95rem', display: 'flex', gap: '12px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                    <span style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }}>✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '56px', color: '#111827', letterSpacing: '-0.02em' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mentorshipConfig.process.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ background: '#6C4CF1', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 700, color: '#111827' }}>{step.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Component */}
      <div id="booking" style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px', color: '#111827', letterSpacing: '-0.02em' }}>Book Your Session</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', fontSize: '1rem' }}>Fill the form, pick a slot, pay — and you're confirmed.</p>
          <div style={{ background: '#f9fafb', padding: '40px 24px', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
            <MentorshipBooking />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '56px', color: '#111827', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mentorshipConfig.faq.map((faq, i) => (
              <div key={i} style={{ padding: '28px 0', borderBottom: i !== mentorshipConfig.faq.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '10px', fontWeight: 700, color: '#111827' }}>{faq.question}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.875rem', background: '#fff' }}>
        <p>© {new Date().getFullYear()} Krishna Mahawar. All rights reserved.</p>
      </footer>
    </div>
  );
}
