import type { Product } from '../types/product';

export const book: Product = {
  id: 'think-research-publish',
  name: 'Think Research Publish',
  
  defaultHero: {
    headline: 'A practical guide to starting research, publishing, and building a career',
    subheadline: 'The exact systems I used to land positions at IIT Madras, IIT BHU, and publish my first paper.',
    cta: 'Get the Book',
  },
  defaultNarrative: 'The biggest barrier isn\'t your CGPA or your college name. It\'s that nobody tells you how the process actually works until it\'s too late. I wrote this to be the guide I wish I had in my first year. Every chapter gives you an exact method you can use right away.',

  overview: {
    eyebrow: 'What\'s Inside',
    title: 'A Practical Research Guide',
    description: 'A straightforward guide to starting research from scratch, publishing, and landing internships, fellowships, or jobs. Just the exact steps that worked, no vague advice.',
  },

  chapters: [
    { number: '01', title: 'Identifying Research Interests', description: 'Find direction even without a clear field preference. Includes research project ideas to get started.' },
    { number: '02', title: 'Reading Papers Efficiently', description: 'Extract what matters in under 30 minutes - the three-pass method that working researchers actually use.' },
    { number: '03', title: 'The Cold Email System', description: 'Built from analysing 130+ real professor emails. See the proven templates.' },
    { number: '04', title: 'Securing Research Internships', description: 'IITs, IISc, CSIR, SRFP - the full application system. Browse 50+ fellowship programs.' },
    { number: '05', title: 'From Internship to Publication', description: 'Convert early research into conference and journal papers - targeting realistic venues, not Nature.' },
    { number: '06', title: 'Long-Term Research Growth', description: 'Build a compounding research profile from year one - not a last-semester scramble.' },
  ],

  features: [
    { number: '01', title: 'Written for beginners', description: 'No prior research experience required. Starts from zero.' },
    { number: '02', title: 'Actionable steps, not motivation', description: 'Every chapter gives you a process you can run immediately.' },
    { number: '03', title: 'Exact email templates included', description: 'Based on what actually got replies from 130+ emails. No guessing.' },
    { number: '04', title: 'Tested in the real world', description: 'Methods presented at ISAMET 2026. This is what actually works.' },
  ],

  faq: [
    { question: 'Is this book only for engineering students?', answer: 'The cold email, literature review, and publication systems work for any STEM field. The specific fellowship examples are engineering/science focused, but the core methods apply universally.' },
    { question: 'Do I need prior research experience?', answer: 'No. The book is specifically written assuming you are starting from zero.' },
    { question: 'When will the book be available?', answer: 'We are currently in the final stages of review. By joining the waitlist, you will be the first to know when it drops.' }
  ],

  pricing: {
    amount: 0,
    currency: 'INR',
    cta: 'Join the Waitlist',
    note: 'Instant digital delivery upon launch',
  },
};
