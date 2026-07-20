export interface Goal {
  id: string;
  label: string;
  description: string;
  icon: string;
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  narrative: string;
  featuredTestimonialId: string;
}
