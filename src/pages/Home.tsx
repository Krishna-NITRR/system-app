import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AeoSection from '../components/AeoSection';

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
    title: 'Start Research, Publish & Build a Career - Krishna Mahawar',
    description: 'Start research from scratch, publish your work, and use it to land internships, jobs, or build startups. A practical guide.',
    canonical: 'https://www.krishnamahawar.in/',
  });

  useEffect(() => {
    // Fade-in on scroll effect with staggering
    let staggerIndex = 0;
    let staggerTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const io = new IntersectionObserver((entries) => {
      let isAnyIntersecting = false;
      
      entries.forEach((e) => {
        if (e.isIntersecting) {
          isAnyIntersecting = true;
          // Apply a staggered transition delay
          (e.target as HTMLElement).style.transitionDelay = `${staggerIndex * 100}ms`;
          e.target.classList.add('vis');
          
          staggerIndex++;
          io.unobserve(e.target);
        }
      });
      
      if (isAnyIntersecting) {
        // Reset stagger index after a short period (when the scroll batch finishes)
        if (staggerTimeout) clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
          staggerIndex = 0;
        }, 100);
      }
    }, { threshold: 0.07 });
    
    document.querySelectorAll('.fade').forEach((el) => io.observe(el));
    
    return () => {
      io.disconnect();
      if (staggerTimeout) clearTimeout(staggerTimeout);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <AeoSection />
        <TheBook />
        <WhoItsFor />
        <ResearchPlaybooks />
        <EmailSignup />
        <Testimonials />
        <Author />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
