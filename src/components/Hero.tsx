import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
      <HeroBackground />
      <div className="hero-inner">
        <motion.div {...motionProps} id="hero-text" style={{ ...motionProps.style, flex: 1 }}>
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
        </motion.div>
        
        <motion.div 
          {...motionProps} 
          transition={{ ...motionProps.transition, delay: 0.2 }}
          style={{ perspective: 1000 }}
        >
          <ResearchTimeline />
        </motion.div>
      </div>
    </section>
  );
}
