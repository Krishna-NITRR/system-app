import type { Goal } from '../types/goal';

export const goals: Goal[] = [
  {
    id: 'first-research-opportunity',
    label: 'Get my first research opportunity',
    description: 'Land an internship at IIT, IISc, CSIR, or any research lab.',
    icon: '🔬',
    hero: {
      headline: 'The step-by-step system to land your first research internship',
      subheadline: 'Cold emails, applications, and professor outreach — the exact playbook that got me into IIT Madras and IIT BHU.',
      cta: 'Get the Research Internship Playbook',
    },
    narrative: 'You\'ve been scrolling through fellowship lists and sending generic emails. You know you need research experience, but it feels like a closed club. The truth is, there is a systemic way to approach professors and land internships, even if you are not from a top-tier college.',
    featuredTestimonialId: 'siddharth-k',
  },
  {
    id: 'publish-first-paper',
    label: 'Publish my first research paper',
    description: 'Go from a blank page to a published conference or journal paper.',
    icon: '📄',
    hero: {
      headline: 'From blank page to published paper — a practical system',
      subheadline: 'Target realistic venues, write efficiently, and submit with confidence.',
      cta: 'Get the Publication Playbook',
    },
    narrative: 'Publishing feels impossible when nobody around you has done it. You don\'t know how to pick a topic, how to write the methodology, or where to submit. But the process is highly structured. Once you learn the steps, you can reliably produce research papers.',
    featuredTestimonialId: 'ananya-r',
  },
  {
    id: 'strengthen-application',
    label: 'Strengthen my Master\'s or PhD application',
    description: 'Build a research profile that makes your application stand out.',
    icon: '🎓',
    hero: {
      headline: 'Build a research profile that stands out to admissions committees',
      subheadline: 'Go beyond CGPA. Learn how to get strong letters of recommendation and build a compounding research portfolio.',
      cta: 'Get the Grad School Playbook',
    },
    narrative: 'When everyone applying to grad school has a high CGPA, research experience is the differentiator. You need publications, real internship experience, and professors who can write detailed, specific letters of recommendation about your capabilities.',
    featuredTestimonialId: 'preethi-m',
  },
  {
    id: 'become-confident-researcher',
    label: 'Become confident doing research',
    description: 'Learn how to read papers, find direction, and work independently.',
    icon: '💡',
    hero: {
      headline: 'Stop feeling lost when reading research papers',
      subheadline: 'Learn how to extract what matters, find research gaps, and build the confidence to work independently.',
      cta: 'Get the Research Confidence Playbook',
    },
    narrative: 'Reading your first few research papers can feel overwhelming. It feels like everyone else knows something you don\'t. But there is a specific method to reading literature, identifying gaps, and moving from a consumer of research to a creator.',
    featuredTestimonialId: 'ananya-r',
  },
];

export function getGoal(id: string): Goal | undefined {
  return goals.find(g => g.id === id);
}
