
export default function Testimonials() {
  return (
    <section className="sec bg2" id="testimonials" aria-labelledby="testi-heading">
      <div className="wrap">
        <span className="eyebrow">Early Readers</span>
        <h2 className="section-title" id="testi-heading">What students are saying</h2>
        <div className="testi-layout fade">
          <div className="testi-item">
            <p className="testi-text">Finally someone explaining research the way it actually works. The cold email chapter alone changed everything for me.</p>
            <div className="testi-author">
              <div className="testi-av">AR</div>
              <div><div className="testi-name">Ananya R.</div><div className="testi-role">B.Tech, IIT Kharagpur · June 2026</div></div>
            </div>
          </div>
          <div className="testi-item">
            <p className="testi-text">Applied to 3 research internships using these steps. Got selected at CSIR. The professor approach method works.</p>
            <div className="testi-author">
              <div className="testi-av">SK</div>
              <div><div className="testi-name">Siddharth K.</div><div className="testi-role">Research Intern, CSIR-NIO · May 2026</div></div>
            </div>
          </div>
          <div className="testi-item">
            <p className="testi-text">Found this in 12th grade. It gave me a clear path into undergraduate research before most of my classmates knew it was possible.</p>
            <div className="testi-author">
              <div className="testi-av">PM</div>
              <div><div className="testi-name">Preethi M.</div><div className="testi-role">1st Year, NIT Surathkal · April 2026</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
