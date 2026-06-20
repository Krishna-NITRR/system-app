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
    title: 'Start Research, Publish & Build a Career - Krishna Mahawar',
    description: 'This website shows students how to start research from scratch, publish their work, and use it to get internships, fellowships, jobs, or even build startups.',
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
