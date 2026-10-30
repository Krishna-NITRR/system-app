import { useEffect } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { mentorshipConfig } from '../config/mentorship';
import type { MentorshipInclude } from '../types/mentorship';
import MentorshipBooking from '../components/mentorship/MentorshipBooking';
import { Link } from 'react-router-dom';
import { captureUtm, track } from '../utils/analytics';

const PURPLE = '#6C4CF1';

// Inline SVG icons : emoji and symbol glyphs rendered as broken boxes on some devices
function Icon({ name, size = 24 }: { name: MentorshipInclude['icon'] | 'check' | 'cross'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'form':
      return <svg {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></svg>;
    case 'video':
      return <svg {...common}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4z" /></svg>;
    case 'plan':
      return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></svg>;
    case 'check':
      return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
    case 'cross':
      return <svg {...common}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  }
}

const h2Style: React.CSSProperties = { textAlign: 'center', fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', fontWeight: 700, marginBottom: '16px', color: '#111827', letterSpacing: '-0.02em' };
const eyebrowStyle: React.CSSProperties = { textAlign: 'center', color: PURPLE, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' };

function NotReadyCapture() {
  return (
    <section style={{ padding: '64px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
      <div className="mentorship-optin">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Not ready to book?</h2>
          <p style={{ color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Start with the free research tools and resources: cold-email templates, the professor database and more. Book later if you get stuck.
          </p>
        </div>
        <Link
          to="/research-tools-and-resources"
          onClick={() => track('click_tools', { location: 'not_ready' })}
          style={{ display: 'block', textAlign: 'center', padding: '12px 18px', background: '#111827', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}
        >
          Check the free tools →
        </Link>
      </div>
    </section>
  );
}

export default function MentorshipPage() {
  usePageMeta({
    title: '1:1 Research Internship Mentorship · 30 min · ₹399 · Krishna Mahawar',
    description: 'Stuck on a research internship application? Bring one problem: which professors to email, why nobody replies, what to fix in your CV. 30 minutes on Google Meet, a written plan within 24 hours. ₹399, no subscription.',
    canonical: 'https://www.krishnamahawar.in/mentorship',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const utm = captureUtm();
    track('view_mentorship', utm);
  }, []);

  const bookClick = (location: string) => () => track('click_book', { location });

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav className="mentorship-nav">
        <Link to="/" style={{ color: '#111827', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
          Krishna Mahawar<span style={{ color: PURPLE }}>.</span>
        </Link>
        <a
          href="#booking"
          onClick={bookClick('nav')}
          style={{ color: '#fff', background: PURPLE, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}
        >
          Book · ₹{mentorshipConfig.priceINR}
        </a>
      </nav>

      {/* Hero */}
      <section style={{ padding: 'clamp(56px, 10vw, 100px) 16px clamp(48px, 8vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #faf9ff 0%, #ffffff 100%)' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '700px', maxWidth: '100%', height: '400px', background: 'radial-gradient(ellipse at top, rgba(108,76,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(108,76,241,0.08)', color: PURPLE, borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '28px', border: '1px solid rgba(108,76,241,0.15)' }}>
            1:1 · {mentorshipConfig.durationMinutes} min · ₹{mentorshipConfig.priceINR} · Google Meet
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px', color: '#111827' }}>
            Stuck on a research internship application? Let's build your next-step plan.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Bring one problem: which professors to email, why nobody replies, what to fix in your CV. In 30 minutes we decide what to do, and within 24 hours you get it in writing.
          </p>
          <div className="mentorship-hero-btns">
            <a
              href="#booking"
              onClick={bookClick('hero')}
              style={{ background: PURPLE, color: '#fff', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 20px rgba(108,76,241,0.3)', textAlign: 'center' }}
            >
              Book a 30-min session · ₹{mentorshipConfig.priceINR}
            </a>
            <a
              href="#includes"
              style={{ background: '#fff', color: '#374151', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '1.5px solid #e5e7eb', textAlign: 'center' }}
            >
              See what you get
            </a>
          </div>
          <p style={{ marginTop: '20px', fontSize: '0.875rem', color: '#9ca3af' }}>
            For students who want practical direction, not a guarantee of selection. No subscription.
          </p>
        </div>
      </section>

      {/* Blockers */}
      <section style={{ padding: '72px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={eyebrowStyle}>Bring one of these</div>
          <h2 style={{ ...h2Style, marginBottom: '48px' }}>What students usually book for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {mentorshipConfig.blockers.map((b, i) => (
              <div key={i} style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#faf9ff' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>“{b.quote}”</h3>
                <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section id="includes" style={{ padding: '72px 16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={eyebrowStyle}>What ₹{mentorshipConfig.priceINR} includes</div>
          <h2 style={{ ...h2Style, marginBottom: '48px' }}>Before, during and after the call</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {mentorshipConfig.includes.map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(108,76,241,0.08)', color: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon name={item.icon} />
                </div>
                <h3 style={{ fontSize: '1.02rem', marginBottom: '8px', fontWeight: 700, color: '#111827' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Krishna */}
      <section id="about" style={{ padding: '72px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div className="mentorship-about">
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: PURPLE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.6rem', flexShrink: 0 }} aria-hidden="true">
            KM
          </div>
          <div>
            <div style={{ ...eyebrowStyle, textAlign: 'left' }}>Who you'll talk to</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Krishna Mahawar</h2>
            <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '0.95rem' }}>B.Tech, NIT Raipur · 9.06 CGPA</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {mentorshipConfig.credentials.map(c => (
                <span key={c} style={{ padding: '6px 12px', borderRadius: '100px', background: '#f3f4f6', border: '1px solid #e5e7eb', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{c}</span>
              ))}
            </div>
            <p style={{ color: '#374151', fontSize: '1.02rem', lineHeight: 1.7, margin: '0 0 16px 0', fontStyle: 'italic' }}>
              “I spent two years getting ignored by professors before I figured out what works.”
            </p>
            <a href="https://www.linkedin.com/in/krishna-mahawar/" target="_blank" rel="noopener noreferrer author" style={{ color: PURPLE, fontWeight: 600, fontSize: '0.92rem' }}>
              LinkedIn profile →
            </a>
          </div>
        </div>
      </section>

      {/* Is this right for you */}
      <section style={{ padding: '72px 16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ ...h2Style, marginBottom: '48px' }}>Is this the right fit?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
            {[
              { title: 'Book this if you...', items: mentorshipConfig.goodFor, icon: 'check' as const, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { title: 'Not the right fit if you want...', items: mentorshipConfig.notFor, icon: 'cross' as const, color: '#dc2626', bg: '#fff5f5', border: '#fecaca' },
            ].map(col => (
              <div key={col.title} style={{ background: col.bg, padding: '28px', borderRadius: '16px', border: `1px solid ${col.border}` }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                  <span style={{ color: col.color, background: `${col.color}1a`, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={col.icon} size={18} />
                  </span>
                  {col.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {col.items.map((item, i) => (
                    <li key={i} style={{ color: '#374151', fontSize: '0.95rem', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                      <span style={{ color: col.color, marginTop: '3px', flexShrink: 0 }}><Icon name={col.icon} size={16} /></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '72px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ ...h2Style, marginBottom: '48px' }}>How it works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mentorshipConfig.process.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ background: PURPLE, color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', fontWeight: 700, color: '#111827' }}>{step.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.93rem', lineHeight: 1.6, margin: 0 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Component */}
      <div id="booking" style={{ padding: '72px 16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ ...h2Style, marginBottom: '8px' }}>Book your session</h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '36px', fontSize: '1rem' }}>Form → time → pay. About 3 minutes.</p>
          <div className="mentorship-booking-shell">
            <MentorshipBooking />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section style={{ padding: '72px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ ...h2Style, marginBottom: '40px' }}>Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mentorshipConfig.faq.map((faq, i) => (
              <div key={i} style={{ padding: '24px 0', borderBottom: i !== mentorshipConfig.faq.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: 700, color: '#111827' }}>{faq.question}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NotReadyCapture />

      <footer style={{ padding: '32px 16px', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.875rem', background: '#fff', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <span>© {new Date().getFullYear()} Krishna Mahawar</span>
        <a href="#booking" style={{ color: '#6b7280' }}>Book a session</a>
        <a href="https://www.linkedin.com/in/krishna-mahawar/" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280' }}>LinkedIn</a>
      </footer>
    </div>
  );
}
