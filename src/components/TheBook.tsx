import { Link } from 'react-router-dom';

export default function TheBook() {
  return (
    <section className="sec bg2" id="book" aria-labelledby="book-heading">
      <div className="wrap">
        <span className="eyebrow">Upcoming Book</span>
        <h2 className="section-title" id="book-heading">A Practical Research Guide</h2>
        <p className="section-sub">A straightforward guide to finding internships and writing your first paper. Just the exact steps that worked, no vague advice.</p>
        <div className="about-layout fade">
          <div className="about-body">
            <p>The biggest barrier isn't your CGPA or your college name. It's that nobody tells you how the process actually works until it's too late.</p>
            <p>I wrote this to be the guide I wish I had in my first year. Every chapter gives you an exact method you can use right away.</p>
            <ul className="ch-list">
              <li className="ch-item">
                <span className="ch-num">01</span>
                <div>
                  <div className="ch-title">Identifying Research Interests</div>
                  <div className="ch-desc">Find direction even without a clear field preference. Includes <Link to="/project-ideas" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>research project ideas</Link> to get started.</div>
                </div>
              </li>
              <li className="ch-item">
                <span className="ch-num">02</span>
                <div>
                  <div className="ch-title">Reading Papers Efficiently</div>
                  <div className="ch-desc">Extract what matters in under 30 minutes - the three-pass method that working researchers actually use</div>
                </div>
              </li>
              <li className="ch-item">
                <span className="ch-num">03</span>
                <div>
                  <div className="ch-title">The Cold Email System</div>
                  <div className="ch-desc">Built from analysing 130+ real professor emails. See the <Link to="/cold-email-templates" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>proven templates</Link>.</div>
                </div>
              </li>
              <li className="ch-item">
                <span className="ch-num">04</span>
                <div>
                  <div className="ch-title">Securing Research Internships</div>
                  <div className="ch-desc">IITs, IISc, CSIR, SRFP - the full application system. Browse <Link to="/fellowships" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>50+ fellowship programs</Link>.</div>
                </div>
              </li>
              <li className="ch-item">
                <span className="ch-num">05</span>
                <div>
                  <div className="ch-title">From Internship to Publication</div>
                  <div className="ch-desc">Convert early research into conference and journal papers - targeting realistic venues, not Nature</div>
                </div>
              </li>
              <li className="ch-item">
                <span className="ch-num">06</span>
                <div>
                  <div className="ch-title">Long-Term Research Growth</div>
                  <div className="ch-desc">Build a compounding research profile from year one - not a last-semester scramble</div>
                </div>
              </li>
            </ul>
          </div>
          <div className="about-right">
            <div className="feat-item">
              <span className="feat-num">01</span>
              <div>
                <div className="feat-title">Written for beginners</div>
                <div className="feat-desc">No prior research experience required. Starts from zero.</div>
              </div>
            </div>
            <div className="feat-item">
              <span className="feat-num">02</span>
              <div>
                <div className="feat-title">Actionable steps, not motivation</div>
                <div className="feat-desc">Every chapter gives you a process you can run immediately.</div>
              </div>
            </div>
            <div className="feat-item">
              <span className="feat-num">03</span>
              <div>
                <div className="feat-title">Exact email templates included</div>
                <div className="feat-desc">Based on what actually got replies from 130+ emails. No guessing.</div>
              </div>
            </div>
            <div className="feat-item">
              <span className="feat-num">04</span>
              <div>
                <div className="feat-title">Tested in the real world</div>
                <div className="feat-desc">Methods presented at ISAMET 2026. This is what actually works.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
