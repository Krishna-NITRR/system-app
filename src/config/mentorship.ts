import type { MentorshipConfig } from '../types/mentorship';

export const mentorshipConfig: MentorshipConfig = {
  priceINR: 1699,
  priceUSD: 20,
  durationMinutes: 30,
  
  includes: [
    {
      title: '30-min focused call',
      description: 'Live 1-on-1 session on Google Meet',
      icon: '🎥',
    },
    {
      title: 'Written action plan',
      description: 'Emailed within 24 hours after the call',
      icon: '📝',
    },
    {
      title: 'Pre-session form',
      description: 'So I prepare for your exact situation, not a generic one',
      icon: '🎯',
    },
    {
      title: 'Free reschedule',
      description: 'Up to 12 hours before the session, no questions asked',
      icon: '🔄',
    },
  ],

  process: [
    {
      title: 'Fill a short form',
      description: 'Takes 5 minutes. Tell me what you are stuck on so we get straight to the point.',
    },
    {
      title: 'Pick a time slot',
      description: 'Choose a time that works for you. All times are shown in your local timezone.',
    },
    {
      title: 'Pay to confirm',
      description: 'Secure payment via Razorpay. Your slot is reserved the moment payment clears.',
    },
    {
      title: 'Show up and focus',
      description: 'We get on Google Meet for 30 focused minutes and map out your next steps together.',
    },
    {
      title: 'Receive your action plan',
      description: 'Within 24 hours, I will email you a written summary of exactly what to do next.',
    }
  ],

  goodFor: [
    'Students figuring out research or research internships',
    'Cold email and professor outreach strategy',
    'Internship application planning and positioning',
    'Career decisions: research vs industry vs startup',
    'First-time research paper writers',
    'Students from any college tier (NIT, IIT, Tier 3, abroad)',
  ],

  notFor: [
    'MBA or college admissions consulting',
    'Resume writing as a service (I will review it, not write it for you)',
    'Guaranteed internship placement (I give you the strategy, you do the execution)',
    'PhD application statement review',
    'Domains outside my experience, such as medical or law',
  ],

  faq: [
    {
      question: 'What if the session is not useful for me?',
      answer: 'If you show up, engage genuinely, and still feel you got zero value by the end of the call, tell me and I will issue a full refund. No forms, no conditions.',
    },
    {
      question: 'Can I reschedule?',
      answer: 'Yes. You can reschedule for free up to 12 hours before the session. If you need to cancel entirely, do it at least 24 hours in advance and I will refund you in full.',
    },
    {
      question: 'What timezone are the sessions shown in?',
      answer: 'All time slots in the booking calendar are automatically converted to your local timezone. No math needed on your end.',
    },
    {
      question: 'I am under 18. Can I still book?',
      answer: 'Yes. However, data protection regulations require me to collect a parent or guardian email so they are aware of the booking and consent to data processing.',
    },
    {
      question: 'Will this help me get an internship?',
      answer: 'I cannot guarantee you an internship. What I can do is make sure you leave with a clear strategy: how to write better cold emails, what professors and labs actually look for, and what your next steps are. The execution is yours.',
    },
    {
      question: 'Why pay when other platforms are free?',
      answer: 'Free platforms often have high no-show rates and mentors who show up unprepared. By charging a fee, I limit my intake, read your pre-session form carefully, and commit to delivering a written plan after the call. You get focused time, not a generic chat.',
    },
  ],
};
