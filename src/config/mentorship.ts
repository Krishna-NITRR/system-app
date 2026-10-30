import type { MentorshipConfig } from '../types/mentorship';

export const mentorshipConfig: MentorshipConfig = {
  priceINR: 399,
  priceUSD: 20,
  durationMinutes: 30,

  // The four blockers students most often book for
  blockers: [
    {
      quote: 'Which ones do I apply to?',
      description: 'You leave with a shortlist of programmes and professors that fit your profile, in priority order.',
    },
    {
      quote: 'Professors don’t reply.',
      description: 'We take apart your cold email together. You leave knowing exactly what to change before the next send.',
    },
    {
      quote: 'Is my CV / SOP good enough?',
      description: 'The 3 fixes that matter most for your target, and what to leave alone.',
    },
    {
      quote: 'I have no lab experience.',
      description: 'A realistic first step: a project, a paper to read, or a professor to approach this month.',
    },
  ],

  includes: [
    {
      title: 'Before: I read your form',
      description: '5 short questions, so the call starts on your problem, not on introductions.',
      icon: 'form',
    },
    {
      title: 'During: 30 focused minutes',
      description: 'Clarify the goal → diagnose → weigh the options → set priorities. Live on Google Meet.',
      icon: 'video',
    },
    {
      title: 'After: a written plan in 24 h',
      description: '3–5 prioritised actions, what to improve, and the first step to take.',
      icon: 'plan',
    },
    {
      title: 'Free reschedule',
      description: 'Up to 12 hours before. Cancel 24 hours ahead for a full refund.',
      icon: 'calendar',
    },
  ],

  credentials: [
    'IIT Madras Summer Research Fellow',
    'IIT BHU Research Intern',
    'First author, ISAMET 2026',
    '130+ professor cold emails analysed',
  ],

  process: [
    {
      title: 'Fill a short form',
      description: 'About 3 minutes. Tell me the one problem you want solved so we get straight to it.',
    },
    {
      title: 'Pick a time slot',
      description: 'All times are shown in your local timezone.',
    },
    {
      title: 'Pay to confirm',
      description: 'Secure payment via Razorpay (UPI, cards). Your slot is reserved the moment payment clears.',
    },
    {
      title: 'Show up and focus',
      description: '30 minutes on Google Meet. We decide what to do next, in what order.',
    },
    {
      title: 'Receive your action plan',
      description: 'Within 24 hours, a written summary of exactly what to do next.',
    },
  ],

  goodFor: [
    'are applying for research internships (SRFP, IIT/IISc, CSIR, abroad) and feel stuck',
    'are cold-emailing professors and getting no replies',
    'are starting your first research project or paper',
    'study at any college, at any tier',
  ],

  notFor: [
    'a guaranteed internship or publication',
    'someone to write your CV, SOP or emails for you',
    'MBA, admissions or PhD-statement consulting',
    'guidance outside engineering and science research',
  ],

  faq: [
    {
      question: 'Will this get me an internship?',
      answer: 'No one can promise that. You’ll leave knowing what to do next and why: who to approach, what to fix, what to send first. The strategy is mine. The execution is yours.',
    },
    {
      question: 'What if the session isn’t useful?',
      answer: 'Tell me at the end of the call and I’ll refund you in full. No forms.',
    },
    {
      question: 'Why pay when free mentoring exists?',
      answer: 'Free platforms are great for general advice. This is one specific research-application problem, prepared in advance, with a written plan afterwards.',
    },
    {
      question: 'Will you review my CV or email?',
      answer: 'Yes, during the call and as part of your plan. I won’t rewrite it for you.',
    },
    {
      question: 'Can I reschedule?',
      answer: 'Yes, free, up to 12 hours before the session. Cancel at least 24 hours ahead for a full refund.',
    },
    {
      question: 'I am under 18. Can I still book?',
      answer: 'Yes. Tick “I am under 18” in the form and add a parent or guardian email, so they are aware of the booking and consent to data processing.',
    },
  ],
};
