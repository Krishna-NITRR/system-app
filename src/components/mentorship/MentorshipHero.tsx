export default function MentorshipHero() {
  return (
    <section id="hero" style={{ paddingBottom: '40px' }}>
      <div className="hero-inner fade vis">
        <div className="eyebrow" style={{ color: 'var(--purple)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px', fontSize: '0.85rem' }}>1:1 Mentorship</div>
        <h1>Stuck on what to do next with research, internships, or your career?</h1>
        <p className="hero-sub">
          I'll spend 30 focused minutes helping you figure it out — and you'll leave with a clear, written action plan. No generic advice, just practical steps tailored to your specific situation.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          <a href="#booking" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            Book a Session
          </a>
          <a href="#includes" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            See what's included ↓
          </a>
        </div>
      </div>
    </section>
  );
}
