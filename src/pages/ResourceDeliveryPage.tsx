import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import GoalChooser from '../components/resource/GoalChooser';
import { getResource } from '../config/resources';
import { useLeadContext } from '../hooks/useLeadContext';
import { copy } from '../config/copy';
import usePageMeta from '../hooks/usePageMeta';

export default function ResourceDeliveryPage() {
  const { slug } = useParams<{ slug: string }>();
  const resource = slug ? getResource(slug) : undefined;
  const { lead, isLoaded } = useLeadContext();

  usePageMeta({
    title: `Your Resource - ${resource?.shortTitle || 'Delivery'}`,
    description: 'Download your resource and choose your next step.',
    canonical: `https://www.krishnamahawar.in/resources/${slug}/get`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!resource) {
    return <Navigate to="/" replace />;
  }

  if (!isLoaded) {
    return null;
  }

  if (!lead || lead.resourceSlug !== slug) {
    return <Navigate to={`/resources/${slug}`} replace />;
  }

  return (
    <PageLayout>
      <section className="sec" style={{ paddingTop: '120px' }}>
        <div className="wrap">
          <div className="capture-layout fade">
            <div className="capture-left">
              <h2>{copy.delivery.heading}</h2>
              <p>{copy.delivery.subheading}</p>
              
              <div style={{ marginTop: '32px' }}>
                {resource.driveLink ? (
                  <a 
                    href={resource.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                    style={{ fontSize: '1rem', padding: '16px 28px' }}
                  >
                    {resource.ctaVerb} {resource.shortTitle} &rarr;
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="btn btn-primary"
                    style={{ fontSize: '1rem', padding: '16px 28px', opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    Download Coming Soon
                  </button>
                )}
              </div>
            </div>
            
            <div className="capture-right">
              <GoalChooser />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
