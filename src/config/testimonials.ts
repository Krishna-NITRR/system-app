import type { Testimonial } from '../types/testimonial';

export const testimonials: Testimonial[] = [
  {
    id: 'ananya-r',
    name: 'Ananya R.',
    role: 'B.Tech, IIT Kharagpur',
    initials: 'AR',
    text: 'Finally someone explaining research the way it actually works. The cold email chapter alone changed everything for me.',
    goalIds: ['publish-first-paper', 'become-confident-researcher'],
  },
  {
    id: 'siddharth-k',
    name: 'Siddharth K.',
    role: 'Research Intern, CSIR-NIO · May 2026',
    initials: 'SK',
    text: 'Applied to 3 research internships using these steps. Got selected at CSIR. The professor approach method works.',
    goalIds: ['first-research-opportunity'],
  },
  {
    id: 'preethi-m',
    name: 'Preethi M.',
    role: '1st Year, NIT Surathkal · April 2026',
    initials: 'PM',
    text: 'Found this in 12th grade. It gave me a clear path into undergraduate research before most of my classmates knew it was possible.',
    goalIds: ['strengthen-application'],
  },
];

export function getTestimonialsForGoal(goalId: string): Testimonial[] {
  return testimonials.filter(t => t.goalIds.includes(goalId));
}

export function getSharedTestimonials(): Testimonial[] {
  return testimonials;
}
