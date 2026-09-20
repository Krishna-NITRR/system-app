import { mentorshipConfig } from '../../config/mentorship';

export default function MentorshipProcess() {
  return (
    <section className="sec" id="process">
      <div className="wrap fade vis">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>How it Works</div>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '48px' }}>The Process</h2>

        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {mentorshipConfig.process.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'var(--purple-light)', 
                color: 'var(--purple)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 600,
                flexShrink: 0
              }}>
                {i + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text)' }}>{step.title}</h3>
                <p style={{ color: 'var(--tm)', fontSize: '0.95rem', margin: 0 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
