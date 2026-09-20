export default function MentorshipHero() {
  return (
    <section id="hero" style={{ paddingBottom: '40px' }}>
      <div className="hero-inner fade vis">
        <div className="eyebrow" style={{ color: 'var(--purple)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px', fontSize: '0.85rem' }}>1:1 Mentorship with Krishna Mahawar</div>
        <h1>Not sure what to do next with research, internships, or your career?</h1>
        <p className="hero-sub">
          Get 30 focused minutes where we figure it out together. You will leave with a clear, written action plan built around your specific situation. Not generic advice. Not a pep talk.
        </p>
        <div className="mentorship-hero-btns">
          <a href="#booking" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            Book a Session
          </a>
          <a href="#includes" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            See what is included
          </a>
        </div>
      </div>
    </section>
  );
}
