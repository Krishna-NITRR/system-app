import type { Resource } from '../types/resource';

export const resources: Record<string, Resource> = {
  'fellowships': {
    slug: 'fellowships',
    tag: 'Resource 01',
    title: 'Research Fellowships & Programs for Indian Students (2026)',
    shortTitle: 'Research Fellowships List',
    description: '50+ international and Indian programs with eligibility, stipends, deadlines, and a step-by-step application roadmap.',
    driveLink: 'https://drive.google.com/drive/folders/1JSCq_yyxIbg-_QiptAuyXZUG7gWgOorU',
    seo: {
      title: '50+ Research Fellowships & Programs for Indian Students (2026)',
      description: 'Curated list of 50+ research fellowships for Indian students, including SRFP, MITACS, and DAAD. Eligibility, stipends, and deadlines included.',
    },
    ctaVerb: 'Get',
  },
  'professor-database': {
    slug: 'professor-database',
    tag: 'Resource 02',
    title: 'Professors Who Actively Take Research Interns',
    shortTitle: 'Professor Database',
    description: 'A curated list of faculty at IITs, IISc, and national labs who are known to take undergraduate interns.',
    seo: { 
      title: 'Professors Who Take Research Interns at IITs, IISc & National Labs', 
      description: 'Curated database of professors at IITs, IISc, and CSIR labs who actively take undergraduate research interns. Includes research areas and contact approach.' 
    },
    ctaVerb: 'Get',
  },
  'cold-email-templates': {
    slug: 'cold-email-templates',
    tag: 'Resource 03',
    title: 'Cold Email Templates That Get Replies from Professors',
    shortTitle: 'Cold Email Templates',
    description: 'Three tested templates built from analysing 130+ real professor emails, plus a pre-send checklist.',
    driveLink: 'https://drive.google.com/file/d/1pSv0XyF52i9JKEld64MpdUmUQWoyGAKI/view?usp=sharing',
    seo: { 
      title: 'Cold Email Templates That Get Replies from Professors', 
      description: 'Three tested cold email templates for reaching out to professors about research internships. Built from analysing 130+ real emails.' 
    },
    ctaVerb: 'Get',
  },
  'internship-guide': {
    slug: 'internship-guide',
    tag: 'Resource 04',
    title: 'The Research Internship Playbook (Step-by-Step Guide)',
    shortTitle: 'Internship Guide',
    description: 'A step-by-step system for finding labs, reaching out to professors, and landing your first research position.',

    seo: { 
      title: 'The Undergraduate Research Internship Guide', 
      description: 'Step-by-step guide to landing research internships at IITs, IISc, CSIR, and independent labs. From finding professors to writing applications.' 
    },
    ctaVerb: 'Get',
  },
  'project-ideas': {
    slug: 'project-ideas',
    tag: 'Resource 05',
    title: 'Research Project Ideas for Internship Applications',
    shortTitle: 'Project Ideas',
    description: 'Starter project ideas across core and non-core engineering branches. Ready to pitch to a professor or start independently.',
    driveLink: 'https://drive.google.com/drive/folders/1dvslQDSaT9-x7R1zJbbCRG7WPDjigcJl',
    seo: { 
      title: 'Research Project Ideas for Undergraduate Internship Applications', 
      description: 'Starter research project ideas across engineering branches. Use them to pitch professors or begin independent work.' 
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
