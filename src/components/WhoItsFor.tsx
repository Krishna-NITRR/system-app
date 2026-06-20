
export default function WhoItsFor() {
  return (
    <section className="sec" id="for-who" aria-labelledby="who-heading">
      <div className="wrap">
        <span className="eyebrow">Who It's For</span>
        <h2 className="section-title" id="who-heading">Written for students who want to start early</h2>
        <p className="section-sub">You don't have to wait for your final year to do research. If you are a first or second-year student, you can start now.</p>
        <div className="who-layout fade">
          <div className="who-item">
            <div className="who-title">High School Students</div>
            <p className="who-desc">Build a research profile before college applications. Start before others know it's possible.</p>
          </div>
          <div className="who-item">
            <div className="who-title">Undergraduate Researchers</div>
            <p className="who-desc">1st or 2nd year. Want IIT labs or international programs? These are the steps.</p>
          </div>
          <div className="who-item">
            <div className="who-title">First-Time Paper Writers</div>
            <p className="who-desc">Want to publish but don't know the steps. From a blank page to submission.</p>
          </div>
          <div className="who-item">
            <div className="who-title">Early Career Academics</div>
            <p className="who-desc">Build your profile, meet professors, and start your publication record early.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
