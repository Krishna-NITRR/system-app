import type { Product } from '../types/product';

export const book: Product = {
  id: 'think-research-publish',
  name: 'Think Research Publish',
  
  defaultHero: {
    headline: 'A practical system for starting research, publishing papers, and building a career',
    subheadline: 'The exact systems I used to land positions at IIT Madras and IIT BHU, and publish my first paper.',
    cta: 'Join the Waitlist',
  },
  defaultNarrative: 'The biggest barrier isn\'t your CGPA or your college name. It\'s that nobody tells you how the process actually works until it\'s too late. I wrote this to be the guide I wish I had in my first year. Every chapter gives you an exact method you can use right away.',

  overview: {
    eyebrow: 'What\'s Inside',
    title: 'A Practical Research Guide for Undergraduates',
    description: 'A straightforward guide to starting research from scratch, publishing papers, and landing internships or fellowships. The exact steps that worked, with no vague advice.',
  },

  chapters: [
    { number: '01', title: 'Identifying Your Research Interests', description: 'Find direction even without a clear field preference. Includes starter project ideas to help you begin.' },
    { number: '02', title: 'Reading Papers Efficiently', description: 'Extract what matters in under 30 minutes using the three-pass method that working researchers actually use.' },
    { number: '03', title: 'The Cold Email System', description: 'Built from analysing 130+ real professor emails. Includes the proven templates and a pre-send checklist.' },
    { number: '04', title: 'Securing Research Internships', description: 'IITs, IISc, CSIR, SRFP: the full application system, plus a directory of 50+ fellowship programs.' },
    { number: '05', title: 'Publishing Your First Paper', description: 'Turn early research into conference and journal papers by targeting realistic venues, not Nature.' },
    { number: '06', title: 'Building a Long-Term Research Profile', description: 'Build a compounding research profile from year one instead of a last-semester scramble.' },
  ],

  features: [
    { number: '01', title: 'Written for beginners', description: 'No prior research experience required. Starts from zero.' },
    { number: '02', title: 'Actionable steps, not motivation', description: 'Every chapter gives you a process you can run immediately.' },
    { number: '03', title: 'Exact email templates included', description: 'Based on what actually got replies from 130+ emails. No guessing.' },
    { number: '04', title: 'Tested in the real world', description: 'Methods presented at ISAMET 2026. This is what actually works.' },
  ],

  faq: [
    { question: 'Is this book only for engineering students?', answer: 'The cold email, literature review, and publication systems work for any STEM field. The specific fellowship examples lean towards engineering and science, but the core methods apply across disciplines.' },
    { question: 'Do I need prior research experience?', answer: 'No. The book is written for students starting from zero. That\'s exactly who it\'s for.' },
    { question: 'When will the book be available?', answer: 'It\'s in the final stages of review. Join the waitlist and you\'ll be the first to know when it launches.' }
  ],

  pricing: {
    amount: 0,
    currency: 'INR',
    cta: 'Join the Waitlist',
    note: 'Free. You\'ll be notified the moment it launches.',
  },
};
