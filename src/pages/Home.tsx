// Import removed for useEffect
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
import useFadeObserver from '../hooks/useFadeObserver';

export default function Home() {
  usePageMeta({
    title: 'Start Research, Publish & Build a Career - Krishna Mahawar',
    description: 'Start research from scratch, publish your work, and use it to land internships, jobs, or build startups. A practical guide.',
    canonical: 'https://www.krishnamahawar.in/',
  });

  useFadeObserver();

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
