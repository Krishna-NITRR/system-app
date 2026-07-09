import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BetaReaderForm from '../components/BetaReaderForm';
import usePageMeta from '../hooks/usePageMeta';
import { motion, useReducedMotion } from 'framer-motion';
import './BetaReader.css';

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

export default function BetaReader() {
  const shouldReduceMotion = useReducedMotion();

  usePageMeta({
    title: 'Become a Beta Reader - Think Research Publish',
    description: 'Join the exclusive beta reading group for Krishna Mahawar\'s upcoming book on starting research, publishing, and building a career.',
    canonical: 'https://www.krishnamahawar.in/beta-reader',
  });

  useEffect(() => {
    // Fade-in on scroll effect for non-framer-motion elements
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });
    
    document.querySelectorAll('.fade').forEach((el) => io.observe(el));
    
    return () => {
      io.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="sec" style={{ paddingTop: '120px' }}>
        <div className="wrap">
          <div className="beta-hero">
            <motion.span 
              className="eyebrow"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Exclusive Invitation
            </motion.span>
            <motion.h1 
              className="section-title"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Help Shape <span className="accent">Think Research Publish</span>
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              I am looking for serious high school and college students to read early drafts of my upcoming book. Your feedback will determine what stays, what gets cut, and how the final system is built.
            </motion.p>
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="#apply" className="btn btn-primary">Apply to Beta Read</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story & Context */}
      <section className="sec bg2">
        <div className="wrap">
          <div className="story-grid fade">
            <div className="story-text">
              <span className="eyebrow">The Origin</span>
              <h2>Why I'm Writing This Book</h2>
              <p>
                When I started college, I knew I wanted to do research, but I was completely lost. 
                I didn't go to a tier-1 institute, I had no mentors, and every guide I read was either too vague or required you to already be a genius.
              </p>
              <p>
                It took me years of brute-force trial and error, getting rejected from hundreds of cold emails, and making every mistake possible before I finally figured it out. I eventually published papers, won fellowships, and built a career - but the process shouldn't have been that painful.
              </p>
              <p>
                <strong>Think Research Publish</strong> is the playbook I wish I had on day one. It's the exact, step-by-step system for starting from scratch, getting professors to actually reply to your emails, and executing research that matters. No fluff. Just raw, actionable mechanics.
              </p>
            </div>
            <div className="story-image-wrap">
              <img src="/images/hero-bg.webp" alt="Research process" className="story-img" style={{ minHeight: '300px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="sec">
        <div className="wrap">
          <div className="text-center fade" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="eyebrow">The Audience</span>
            <h2 className="section-title">Who Should Apply?</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              I am specifically looking for students who are hungry to learn but don't know where to start. 
              If you already have 5 published papers, this book is not for you.
            </p>
          </div>

          <div className="benefits-grid fade">
            <div className="benefit-card">
              <span className="benefit-icon">🎓</span>
              <h3>
                {"Undergraduates".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`c1-${i}`}>{char}</Letter>)}
              </h3>
              <p>1st and 2nd year students are the best fit, but 3rd, 4th, or even final year students are completely okay too.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🏫</span>
              <h3>
                {"High School Students".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`c2-${i}`}>{char}</Letter>)}
              </h3>
              <p>You are ambitious and want to understand how academic research works before you even step foot into college.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💡</span>
              <h3>
                {"The \"Lost\" Student".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`c3-${i}`}>{char}</Letter>)}
              </h3>
              <p>You've tried sending cold emails but got ignored. You want a tested system to finally break into a lab.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🔬</span>
              <h3>
                {"Early Researchers".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`c4-${i}`}>{char}</Letter>)}
              </h3>
              <p>You want to start building your profile early but don't know the first thing about reading a research paper.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expectations */}
      <section className="sec bg3">
        <div className="wrap fade">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow">The Deal</span>
            <h2 className="section-title">What I Need From You</h2>
            <p className="section-sub" style={{ marginBottom: '32px' }}>
              Being a beta reader is a commitment. I am opening up my raw, unedited drafts to you. In exchange, I need brutal honesty.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'var(--purple)', fontSize: '1.5rem', fontWeight: 600 }}>01</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Read Within Deadlines</h4>
                  <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>I will send chapters in batches. You will have a specific window (usually a week) to read and provide feedback.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'var(--purple)', fontSize: '1.5rem', fontWeight: 600 }}>02</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Provide Brutal Feedback</h4>
                  <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>If a section is boring, tell me. If a cold email template doesn't make sense, tell me. Don't worry about hurting my feelings. I want to build the best book possible.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'var(--purple)', fontSize: '1.5rem', fontWeight: 600 }}>03</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Keep It Confidential</h4>
                  <p style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>These are early drafts. You cannot share the PDFs, templates, or concepts publicly until the book officially launches.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="sec" id="apply">
        <div className="wrap">
          <BetaReaderForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="sec bg2">
        <div className="wrap">
          <div className="text-center fade" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list fade">
            <div className="faq-item">
              <div className="faq-q">Do I need research experience to be a beta reader?</div>
              <div className="faq-a">Absolutely not. In fact, I prefer if you don't. The entire point of this book is to teach beginners. If beginners can't understand my drafts, I've failed.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What do I get out of this?</div>
              <div className="faq-a">You get to read the book months before anyone else, completely for free. You will learn the exact systems to get research internships. Plus, if you provide excellent feedback, your name will be printed in the Acknowledgments section of the final published book.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">How many people will be selected?</div>
              <div className="faq-a">I am keeping the group small - around 20-30 people. I want to be able to read and process everyone's feedback deeply.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">When does the beta reading start?</div>
              <div className="faq-a">I will be selecting the group in the coming weeks and will reach out via email with the first batch of chapters.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
