import type { Goal } from '../types/goal';

export const goals: Goal[] = [
  {
    id: 'first-research-opportunity',
    label: 'Get my first research opportunity',
    description: 'Land an internship at IIT, IISc, CSIR, or any research lab.',
    icon: '🔬',
    hero: {
      headline: 'The step-by-step system to land your first research internship',
      subheadline: 'Cold emails, applications, and professor outreach: the exact playbook that got me into IIT Madras and IIT BHU.',
      cta: 'Join the Waitlist',
    },
    narrative: 'You\'ve been scrolling through fellowship lists and sending generic emails. You know you need research experience, but it feels like a closed club. The truth is, there\'s a systematic way to approach professors and land internships, even if you\'re not from a top-tier college.',
    featuredTestimonialId: 'siddharth-k',
  },
  {
    id: 'publish-first-paper',
    label: 'Publish my first research paper',
    description: 'Go from a blank page to a published conference or journal paper.',
    icon: '📄',
    hero: {
      headline: 'From blank page to published research paper',
      subheadline: 'Pick a realistic venue, structure your writing, and submit with confidence.',
      cta: 'Join the Waitlist',
    },
    narrative: 'Publishing feels impossible when nobody around you has done it. You don\'t know how to pick a topic, structure the methodology, or where to submit. But the process is more structured than it looks. Once you learn the steps, you can reliably produce research papers.',
    featuredTestimonialId: 'ananya-r',
  },
  {
    id: 'strengthen-application',
    label: 'Strengthen my Master\'s or PhD application',
    description: 'Build a research profile that makes your application stand out.',
    icon: '🎓',
    hero: {
      headline: 'Building a research profile that stands out for grad school',
      subheadline: 'Go beyond CGPA. Get strong recommendation letters and build a compounding research portfolio.',
      cta: 'Join the Waitlist',
    },
    narrative: 'When everyone applying to grad school has a high CGPA, research experience is the differentiator. You need publications, real internship experience, and professors who can write detailed, specific letters about your work.',
    featuredTestimonialId: 'preethi-m',
  },
  {
    id: 'become-confident-researcher',
    label: 'Become confident doing research',
    description: 'Learn how to read papers, find direction, and work independently.',
    icon: '💡',
    hero: {
      headline: 'Stop feeling lost when reading research papers',
      subheadline: 'Learn to extract what matters, spot research gaps, and build the confidence to work independently.',
      cta: 'Join the Waitlist',
    },
    narrative: 'Your first few research papers feel overwhelming. It seems like everyone else understands something you don\'t. But there\'s a specific method to reading literature, identifying gaps, and moving from a consumer of research to a contributor.',
    featuredTestimonialId: 'ananya-r',
  },
];

export function getGoal(id: string): Goal | undefined {
  return goals.find(g => g.id === id);
}
