
export default function Author() {
  return (
    <section className="sec" id="author" aria-labelledby="author-heading">
      <div className="wrap">
        <span className="eyebrow">About</span>
        <div className="author-layout fade">
          <div className="author-av">KM</div>
          <div>
            <h2 className="author-name" id="author-heading">Krishna Mahawar</h2>
            <div className="author-title">B.Tech Mining Engineering, NIT Raipur</div>
            <div className="author-creds">
              <span className="cred-pill">IIT Madras Summer Research Fellow</span>
              <span className="cred-pill">IIT BHU Intern</span>
              <span className="cred-pill">ISAMET 2026 First Author</span>
              <span className="cred-pill">9.06 CGPA</span>
              <span className="cred-pill">130+ Cold Emails Analysed</span>
            </div>
            <p className="author-bio">I'm an undergraduate at NIT Raipur. I spent my first two years trying to figure out how to get into research - sending emails that got ignored, applying to programs I wasn't eligible for, and getting zero guidance from seniors. Then I figured out what actually works.</p>
            <p className="author-bio" style={{ marginTop: '12px' }}>Since then: research fellowship at IIT Madras, internship at IIT BHU, and first-author paper at an international conference (ISAMET 2026). I built this site so you don't have to waste two years like I did.</p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a href="https://www.linkedin.com/in/krishna-mahawar/" target="_blank" rel="noopener noreferrer author" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'underline' }}>
                LinkedIn Profile →
              </a>
              <span style={{ color: 'var(--tm)', fontSize: '0.8rem' }}>Last updated: June 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
