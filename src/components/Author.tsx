
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
              <span className="cred-pill">ISAMET 2026</span>
              <span className="cred-pill">9.06 CGPA</span>
            </div>
            <p className="author-bio">I'm an undergraduate engineering student at NIT Raipur. I spent my first two years trying to figure out how to get into research, sending countless ignored emails before figuring out what works. Since then, I've completed a research fellowship at IIT Madras, interned at IIT BHU, and presented as first author at an international conference (ISAMET 2026).</p>
          </div>
        </div>
      </div>
    </section>
  );
}
