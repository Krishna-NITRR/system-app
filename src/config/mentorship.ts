import type { MentorshipConfig } from '../types/mentorship';

export const mentorshipConfig: MentorshipConfig = {
  priceINR: 1699,
  priceUSD: 20,
  durationMinutes: 30,
  
  includes: [
    {
      title: '30-min call',
      description: '1-on-1 on Google Meet',
      icon: '🎥',
    },
    {
      title: 'Action plan',
      description: 'Written summary via email',
      icon: '📝',
    },
    {
      title: 'Pre-session form',
      description: 'So I prepare for your exact needs',
      icon: '🎯',
    },
    {
      title: 'Free reschedule',
      description: 'Up to 12 hours before session',
      icon: '🔄',
    },
  ],

  process: [
    {
      title: 'Fill a short form',
      description: 'Takes 5 minutes. Tell me what you\'re stuck on so we don\'t waste time.',
    },
    {
      title: 'Book a time slot',
      description: 'Pick a time that works for you. Slots are in your local timezone.',
    },
    {
      title: 'Pay to confirm',
      description: 'Secure payment via Razorpay. Your slot is reserved instantly.',
    },
    {
      title: 'Meet 1-on-1',
      description: 'We get on Google Meet for 30 focused minutes and figure out your next steps.',
    },
    {
      title: 'Get your action plan',
      description: 'Within 24 hours, I\'ll email you a written summary of exactly what you need to do next.',
    }
  ],

  goodFor: [
    'Students figuring out research or internships',
    'Cold email / professor outreach help',
    'Internship application strategy',
    '"Should I do X or Y?" career decisions',
    'First-time paper writers',
    'Students from any college tier (NIT, IIT, Tier 3)',
  ],

  notFor: [
    'MBA or college admissions consulting',
    'Resume writing service (I will review it, not write it)',
    'Guaranteed internship placement (I give strategy, you do the work)',
    'PhD application review',
    'Subjects I don\'t have experience in (e.g., medical, law)',
  ],

  faq: [
    {
      question: 'What happens if the session isn\'t useful?',
      answer: 'If you show up, engage, and genuinely feel you got zero value out of the session, let me know at the end of the call and I will issue a full refund. No questions asked.',
    },
    {
      question: 'Can I reschedule?',
      answer: 'Yes, you can reschedule for free up to 12 hours before the session. If you need to cancel entirely, let me know 24 hours in advance for a full refund.',
    },
    {
      question: 'What timezone are sessions in?',
      answer: 'All slots shown in the booking calendar are automatically converted to your local timezone. You don\'t need to do any math.',
    },
    {
      question: 'I\'m under 18 — can I still book?',
      answer: 'Yes. However, due to data protection laws, if you are a high school student or under 18, I require you to provide a parent/guardian email so they are aware of the booking.',
    },
    {
      question: 'Will this help me get an internship?',
      answer: 'I cannot guarantee you an internship. What I can guarantee is that you will leave the session knowing exactly what steps to take, how to write better cold emails, and what professors look for. The execution is up to you.',
    },
    {
      question: 'Why should I pay when other platforms are free?',
      answer: 'Free platforms often have high no-show rates, generic advice, and mentors who haven\'t prepared for your specific situation. By charging a fee, I can limit the number of students I take, read your pre-session form carefully, and give you a written action plan afterward.',
    },
  ],
};
