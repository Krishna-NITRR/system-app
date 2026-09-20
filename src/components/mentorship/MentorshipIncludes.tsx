import { mentorshipConfig } from '../../config/mentorship';

export default function MentorshipIncludes() {
  return (
    <section className="sec" id="includes">
      <div className="wrap fade vis">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '40px' }}>What You Get</div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '24px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {mentorshipConfig.includes.map((item, i) => (
            <div key={i} className="playbook-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text)' }}>{item.title}</h3>
              <p style={{ color: 'var(--tm)', fontSize: '0.9rem', margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
