export interface Resource {
  slug: string;
  tag: string;
  title: string;
  shortTitle: string;
  description: string;
  driveLink?: string;
  seo: {
    title: string;
    description: string;
  };
  ctaVerb: string;
}
