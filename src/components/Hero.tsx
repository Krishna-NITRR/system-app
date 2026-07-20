import { useState } from 'react';
import HeroBackground from './HeroBackground';
import ResearchTimeline from './ResearchTimeline';

const Letter = ({ children }: { children: React.ReactNode }) => {
  const [jiggling, setJiggling] = useState(false);
  
  const handleHover = () => {
    if (!jiggling) {
      setJiggling(true);
      setTimeout(() => setJiggling(false), 2000);
    }
  };

  return (
    <span 
      className={`letter-jiggle ${jiggling ? 'is-jiggling' : ''}`} 
      onMouseEnter={handleHover}
    >
      {children}
    </span>
  );
};

export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading">
      <HeroBackground />
      <div className="hero-inner">
        <div className="hero-enter" id="hero-text" style={{ flex: 1 }}>
          <div className="hero-tag">Student Research Guide</div>
          <h1 id="hero-heading">
            {"Research isn't reserved ".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`t1-${i}`}>{char}</Letter>)}
            <br />
            {"for PhDs.".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`t2-${i}`}>{char}</Letter>)}
          </h1>
          <p className="hero-sub">This website shows you how to start research from scratch, publish your work, and use it to get internships, fellowships, jobs, or even build startups. Learn the exact systems I used to land positions at <strong>IIT Madras</strong>, <strong>IIT BHU</strong>, and publish my first paper.</p>
          <div className="hero-cta-row">
            <a href="#playbooks" className="btn btn-primary">Get the Guides</a>
            <a href="#book" className="btn btn-outline">Read the Book</a>
          </div>
        </div>
        
        <div className="hero-enter hero-enter-delay" style={{ perspective: 1000 }}>
          <ResearchTimeline />
        </div>
      </div>
    </section>
  );
}
