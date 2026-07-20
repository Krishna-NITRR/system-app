import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { getResource } from '../config/resources';
import ResourceSignupForm from '../components/resource/ResourceSignupForm';

export default function ResourceLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const resource = slug ? getResource(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!resource) {
    return <Navigate to="/" replace />;
  }

  usePageMeta({
    title: resource.seo.title,
    description: resource.seo.description,
    canonical: `https://www.krishnamahawar.in/resources/${resource.slug}`,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '32px 24px', textAlign: 'center' }}>
        <Link to="/" className="nav-logo" style={{ fontSize: '1.2rem' }}>Krishna Mahawar<span>.</span></Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px' }}>
        <ResourceSignupForm resource={resource} />
      </main>
    </div>
  );
}
