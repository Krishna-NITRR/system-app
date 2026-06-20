import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

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
      const shouldReduceMotion = useReducedMotion();

  const motionProps = shouldReduceMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8 } }
    : {
        initial: { opacity: 0, y: 50, rotateX: 15, scale: 0.95 },
        animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
        transition: { duration: 1, type: "spring" as const, bounce: 0.2 },
        style: { perspective: 1000 }
      };

  return (
    <section id="hero" aria-labelledby="hero-heading">
      <div className="hero-inner">
        <motion.div {...motionProps} id="hero-text" style={{ ...motionProps.style, flex: 1 }}>
          <div className="hero-tag">Student Research Guide</div>
          <h1 id="hero-heading">
            {"Research isn't reserved ".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`t1-${i}`}>{char}</Letter>)}
            <br />
            {"for PhDs.".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`t2-${i}`}>{char}</Letter>)}
          </h1>
          <p className="hero-sub">I sent 130+ cold emails before getting my first reply. Then I figured out what works — got into <strong>IIT Madras</strong> as a research fellow, interned at <strong>IIT BHU</strong>, and presented as first author at <strong>ISAMET 2026</strong>. These are the exact methods.</p>
          <div className="hero-cta-row">
            <a href="#playbooks" className="btn btn-primary">Get the Guides</a>
            <a href="#book" className="btn btn-outline">Read the Book</a>
          </div>
        </motion.div>
        
        <motion.div 
          {...motionProps} 
          transition={{ ...motionProps.transition, delay: 0.2 }}
          className="hero-right"
          style={{ perspective: 1000 }}
        >
          <div className="hero-right-label">Track Record</div>
          
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">Fellowship</span>
              <span className="stat-value purple">IIT Madras Research</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Internship</span>
              <span className="stat-value">IIT BHU Varanasi</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Conference</span>
              <span className="stat-value">ISAMET 2026</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">CGPA</span>
              <span className="stat-value">9.06 / 10</span>
            </div>
          </div>
          
          <button 
            className="hero-right-cta"
            onClick={() => {
              document.getElementById('author')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Full Background
          </button>
        </motion.div>
      </div>
    </section>
  );
}
