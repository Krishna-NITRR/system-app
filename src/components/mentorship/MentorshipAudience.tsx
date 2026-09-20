import { mentorshipConfig } from '../../config/mentorship';

export default function MentorshipAudience() {
  return (
    <section className="sec bg2" id="audience">
      <div className="wrap fade vis">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>Who This Is For</div>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>Is this the right fit?</h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Who it is for */}
          <div style={{ background: 'var(--bg)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#27ae60' }}>✓</span> This is for you if:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mentorshipConfig.goodFor.map((item, i) => (
                <li key={i} style={{ color: 'var(--tm)', fontSize: '0.95rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#27ae60', flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who it is NOT for */}
          <div style={{ background: 'var(--bg)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#e74c3c' }}>✗</span> This is NOT for you if:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mentorshipConfig.notFor.map((item, i) => (
                <li key={i} style={{ color: 'var(--tl)', fontSize: '0.95rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#e74c3c', flexShrink: 0 }}>✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
