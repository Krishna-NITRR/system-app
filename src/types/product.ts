export interface ProductHero {
  headline: string;
  subheadline: string;
  cta: string;
}

export interface ProductOverview {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ProductChapter {
  number: string;
  title: string;
  description: string;
}

export interface ProductFeature {
  number: string;
  title: string;
  description: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductPricing {
  amount: number;
  currency: string;
  cta: string;
  note: string;
}

export interface Product {
  id: string;
  name: string;
  defaultHero: ProductHero;
  defaultNarrative: string;
  overview: ProductOverview;
  chapters: ProductChapter[];
  features: ProductFeature[];
  faq: ProductFaq[];
  pricing: ProductPricing;
}
