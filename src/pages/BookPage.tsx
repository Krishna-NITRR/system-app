import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../hooks/usePageMeta';
import { getGoal } from '../config/goals';
import { book } from '../config/book';
import { getSharedTestimonials } from '../config/testimonials';

import ProductHero from '../components/product/ProductHero';
import CredibilityStrip from '../components/CredibilityStrip';
import ProductNarrative from '../components/product/ProductNarrative';
import TestimonialGrid from '../components/product/TestimonialGrid';
import ProductOverview from '../components/product/ProductOverview';
import ProductChapters from '../components/product/ProductChapters';
import ProductFeatures from '../components/product/ProductFeatures';
import Author from '../components/Author';
import ProductFAQ from '../components/product/ProductFAQ';
import ProductPricing from '../components/product/ProductPricing';

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const goalId = searchParams.get('goal');
  const goal = goalId ? getGoal(goalId) : undefined;

  usePageMeta({
    title: `${book.name} - Krishna Mahawar`,
    description: book.overview.description,
    canonical: "https://www.krishnamahawar.in/book" + (goalId ? "?goal=" + goalId : ""),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroConfig = goal?.hero || book.defaultHero;
  const narrative = goal?.narrative || book.defaultNarrative;

  let testimonials = getSharedTestimonials();
  if (goal?.featuredTestimonialId) {
    const featured = testimonials.find(t => t.id === goal.featuredTestimonialId);
    if (featured) {
      const rest = testimonials.filter(t => t.id !== goal.featuredTestimonialId);
      testimonials = [featured, ...rest];
    }
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Book",
      "name": book.name,
      "author": {
        "@type": "Person",
        "name": "Krishna Mahawar"
      },
      "description": book.overview.description,
      "offers": {
        "@type": "Offer",
        "price": book.pricing.amount,
        "priceCurrency": book.pricing.currency,
        "availability": "https://schema.org/PreOrder"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <PageLayout>
      <ProductHero hero={heroConfig} />
      <CredibilityStrip />
      <ProductNarrative narrative={narrative} />
      <TestimonialGrid testimonials={testimonials} />
      <ProductOverview overview={book.overview} />
      <ProductChapters chapters={book.chapters} />
      <ProductFeatures features={book.features} />
      <Author />
      <ProductFAQ faq={book.faq} />
      <ProductPricing pricing={book.pricing} productId={book.id} />
    </PageLayout>
  );
}
