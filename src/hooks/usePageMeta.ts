import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

export default function usePageMeta({ title, description, canonical, image }: PageMeta) {
  useEffect(() => {
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // OG and Twitter tags helper
    const setMeta = (nameOrProperty: string, content: string, isProperty = true) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', nameOrProperty);
        } else {
          tag.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', 'website');
    if (canonical) setMeta('og:url', canonical);

    setMeta('twitter:title', title, false);
    setMeta('twitter:description', description, false);
    setMeta('twitter:card', 'summary_large_image', false);

    const imgUrl = image || 'https://www.krishnamahawar.in/og-image.png';
    setMeta('og:image', imgUrl);
    setMeta('twitter:image', imgUrl, false);
  }, [title, description, canonical, image]);
}
