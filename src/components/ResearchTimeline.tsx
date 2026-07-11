import { motion, useReducedMotion } from 'framer-motion';

const timelineData = [
  { year: "2023", title: "Started B.Tech", sub: "NIT Raipur" },
  { year: "2025", title: "Summer Research Internship", sub: "IIT BHU" },
  { year: "2025", title: "Started writing book", sub: "Analyzing 17+ case studies on leveraging research to build high-impact careers as founders, executives, and elite academics" },
  { year: "2026", title: "First Author & Presenter", sub: "ISAMET 2026 International Conference" },
  { year: "2026", title: "Summer Research Fellowship", sub: "IIT Madras" },
  { year: "Now", title: "Building practical research resources for students", sub: "" },
];

export default function ResearchTimeline() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  const lineVariants = {
    hidden: { height: 0 },
    show: { height: "100%", transition: { duration: 1.2, ease: "easeOut" as const } }
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: "spring" as const, stiffness: 200 } }
  };

  return (
    <div className="timeline-container" style={{ position: 'relative', padding: '28px 24px', background: 'var(--bg2)', border: '1px solid var(--div)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--sh)', maxWidth: '440px' }}>
      <div className="hero-right-label" style={{ fontSize: '.65rem', fontWeight: 600, color: 'var(--tl)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
        Research Journey
      </div>
      
      <motion.div 
        variants={shouldReduceMotion ? {} : containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '16px' }}
      >
        {/* The Vertical Line */}
        <motion.div 
          variants={shouldReduceMotion ? {} : lineVariants}
          style={{ 
            position: 'absolute', 
            top: '8px', 
            bottom: '8px', 
            left: '2px', 
            width: '2px', 
            background: 'linear-gradient(to bottom, var(--purple) 0%, rgba(108,76,241,0.1) 100%)',
            transformOrigin: 'top'
          }} 
        />

        {timelineData.map((item, index) => (
          <motion.div 
            key={index}
            variants={shouldReduceMotion ? {} : itemVariants}
            whileHover={shouldReduceMotion ? {} : { x: 5 }}
            whileTap={shouldReduceMotion ? {} : { y: -2 }}
            style={{ position: 'relative', cursor: 'default' }}
          >
            {/* The Dot */}
            <motion.div 
              variants={shouldReduceMotion ? {} : dotVariants}
              style={{
                position: 'absolute',
                left: '-18px',
                top: '5px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--bg2)',
                border: '2px solid var(--purple)',
                boxShadow: '0 0 8px rgba(108,76,241,0.6)',
                zIndex: 2
              }}
            />
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', minWidth: '40px' }}>
                {item.year}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {item.title}
                </span>
                {item.sub && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--tm)', marginTop: '2px' }}>
                    {item.sub}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <button 
        className="hero-right-cta"
        onClick={() => {
          document.getElementById('author')?.scrollIntoView({ behavior: 'smooth' });
        }}
        style={{ marginTop: '28px', width: '100%', textAlign: 'center', background: 'var(--purple-light)', border: '1px solid rgba(108,76,241,.2)', color: 'var(--purple)', borderRadius: 'var(--radius)', padding: '11px', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all var(--trans)', display: 'block', letterSpacing: '.2px' }}
      >
        See Full Background
      </button>
    </div>
  );
}
