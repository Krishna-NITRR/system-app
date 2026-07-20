import type { Resource } from '../types/resource';

export const resources: Record<string, Resource> = {
  'fellowships': {
    slug: 'fellowships',
    tag: 'Resource 01',
    title: 'Research Fellowships & Programs for Indian Students (2026)',
    shortTitle: 'Research Fellowships List',
    description: '50+ international and Indian programs. Exact eligibility, stipends, deadlines, and application roadmap.',
    driveLink: 'https://drive.google.com/drive/folders/1JSCq_yyxIbg-_QiptAuyXZUG7gWgOorU',
    seo: {
      title: '50+ Research Fellowships for Students in India (2026)',
      description: 'Complete list of research fellowships and programs for students.',
    },
    ctaVerb: 'Get',
  },
  'professor-database': {
    slug: 'professor-database',
    tag: 'Resource 02',
    title: 'Professor Outreach Database',
    shortTitle: 'Professor Database',
    description: 'Professors at IITs and IISc who actively take interns.',
    driveLink: 'https://drive.google.com/drive/folders/placeholder',
    seo: { 
      title: 'Professor Outreach Database - Cold Email Targets', 
      description: 'A list of professors at prestigious labs like IITs and IISc who actively take interns.' 
    },
    ctaVerb: 'Get',
  },
  'cold-email-templates': {
    slug: 'cold-email-templates',
    tag: 'Resource 03',
    title: 'Cold Email Templates That Get Replies',
    shortTitle: 'Cold Email Templates',
    description: 'Based on 130+ real emails. Three templates that worked, plus a checklist before you hit send.',
    driveLink: 'https://drive.google.com/drive/folders/placeholder',
    seo: { 
      title: 'Cold Email Templates for Research Internships', 
      description: 'Templates that actually get replies from professors.' 
    },
    ctaVerb: 'Get',
  },
  'internship-guide': {
    slug: 'internship-guide',
    tag: 'Resource 04',
    title: 'Internship & Research Guide',
    shortTitle: 'Internship Guide',
    description: 'Step-by-step notes on landing internships and learning how to research from year one.',
    driveLink: 'https://drive.google.com/drive/folders/placeholder',
    seo: { 
      title: 'Internship & Research Guide for Engineering Students', 
      description: 'Step-by-step notes on landing internships.' 
    },
    ctaVerb: 'Get',
  },
  'project-ideas': {
    slug: 'project-ideas',
    tag: 'Resource 05',
    title: 'Project Ideas for Research Internships',
    shortTitle: 'Project Ideas',
    description: 'Good starting ideas across core and non-core engineering. Ready to use.',
    driveLink: 'https://drive.google.com/drive/folders/placeholder',
    seo: { 
      title: 'Project Ideas for Research Internships', 
      description: 'Good starting ideas across core and non-core engineering.' 
    },
    ctaVerb: 'Get',
  },
};

export function getResource(slug: string): Resource | undefined {
  return resources[slug];
}

export function getAllResources(): Resource[] {
  return Object.values(resources);
}
