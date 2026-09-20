import { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../hooks/usePageMeta';
import CredibilityStrip from '../components/CredibilityStrip';
import Author from '../components/Author';

import MentorshipHero from '../components/mentorship/MentorshipHero';
import MentorshipIncludes from '../components/mentorship/MentorshipIncludes';
import MentorshipAudience from '../components/mentorship/MentorshipAudience';
import MentorshipProcess from '../components/mentorship/MentorshipProcess';
import MentorshipTestimonials from '../components/mentorship/MentorshipTestimonials';
import MentorshipFAQ from '../components/mentorship/MentorshipFAQ';
import MentorshipFinalCTA from '../components/mentorship/MentorshipFinalCTA';

import MentorshipBooking from '../components/mentorship/MentorshipBooking';

export default function MentorshipPage() {
  usePageMeta({
    title: '1:1 Mentorship — Research, Internships & Career Guidance · Krishna Mahawar',
    description: 'Book a 30-minute 1:1 session with Krishna Mahawar. Get practical guidance on research internships, cold emails, career direction, and publishing. ₹1,699 / $20.',
    canonical: 'https://www.krishnamahawar.in/mentorship',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "1:1 Mentorship Session with Krishna Mahawar",
      "provider": {
        "@type": "Person",
        "name": "Krishna Mahawar",
        "url": "https://www.krishnamahawar.in"
      },
      "serviceType": "Career and Research Mentorship",
      "description": "30-minute focused 1:1 session on research, internships, and career direction for students.",
      "offers": {
        "@type": "Offer",
        "price": "20.00",
        "priceCurrency": "USD"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <PageLayout>
      <MentorshipHero />
      <CredibilityStrip />
      <MentorshipIncludes />
      <MentorshipAudience />
      <MentorshipProcess />
      <Author />
      <MentorshipTestimonials />
      <MentorshipBooking />
      <MentorshipFAQ />
      <MentorshipFinalCTA />
    </PageLayout>
  );
}
