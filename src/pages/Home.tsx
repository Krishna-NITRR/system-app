import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

import TheBook from '../components/TheBook';
import WhoItsFor from '../components/WhoItsFor';
import ResearchPlaybooks from '../components/ResearchPlaybooks';
import EmailSignup from '../components/EmailSignup';
import Testimonials from '../components/Testimonials';
import Author from '../components/Author';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import usePageMeta from '../hooks/usePageMeta';

export default function Home() {
  usePageMeta({
    title: 'How to Get Research Internships in India — Krishna Mahawar',
    description: 'Step-by-step system to land IIT research fellowships, write cold emails that get replies, and publish your first paper. From an NIT Raipur undergrad who did it.',
    canonical: 'https://www.krishnamahawar.in/',
  });

  useEffect(() => {
    // Fade-in on scroll effect
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
      <Hero />

      <TheBook />
      <WhoItsFor />
      <ResearchPlaybooks />
      <EmailSignup />
      <Testimonials />
      <Author />
      <Contact />
      <Footer />
    </>
  );
}
