import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, useReducedMotion } from 'framer-motion';
import type { Resource } from '../../types/resource';
import { useLeadContext } from '../../hooks/useLeadContext';
import { copy } from '../../config/copy';

interface Props {
  resource: Resource;
}

export default function ResourceSignupForm({ resource }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setLead } = useLeadContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const trafficSource = document.referrer || 'direct';
      const urlParams = new URLSearchParams(window.location.search);
      const utmMedium = urlParams.get('utm_medium') || null;
      const utmCampaign = urlParams.get('utm_campaign') || null;

      // Fallback mechanism to handle cases where UTM columns don't exist in Supabase yet
      const payload: any = { 
        name, 
        email, 
        resource: resource.slug 
      };

      // Add tracking if possible, but we'll try without if it fails
      const fullPayload = {
        ...payload,
        traffic_source: trafficSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      };

      let { error: dbError } = await supabase.from('leads').insert([fullPayload]);

      // If we get an error about missing columns (like PGRST204), try the basic payload
      if (dbError && (dbError.code === 'PGRST204' || dbError.code === '42703')) {
        const { error: retryError } = await supabase.from('leads').insert([payload]);
        dbError = retryError;
      }

      if (dbError && dbError.code !== '23505') {
        throw dbError;
      }

      setLead({
        name,
        email,
        resourceSlug: resource.slug,
        trafficSource,
        signupDate: new Date().toISOString()
      });

      navigate(`/resources/${resource.slug}/get`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="capture-form" style={{ maxWidth: '460px', width: '100%', padding: '40px 32px', marginTop: '4vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="playbook-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>{resource.tag}</div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text)' }}>
          {resource.title}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--tm)', lineHeight: 1.6 }}>
          {resource.description}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="f-field">
          <label htmlFor="name">First Name</label>
          <input 
            type="text" 
            id="name" 
            required 
            placeholder="Enter your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="f-field" style={{ marginBottom: '24px' }}>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            required 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {error && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

        <motion.button 
          type="submit" 
          className="f-submit" 
          disabled={loading} 
          style={{ padding: '16px', fontSize: '0.95rem', transformStyle: "preserve-3d", perspective: 800 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95, y: 3, rotateX: 10 }}
        >
          {loading ? copy.forms.submitLoading : `${resource.ctaVerb} ${resource.shortTitle}`}
        </motion.button>
        <div className="f-note" style={{ marginTop: '16px' }}>
          {copy.forms.privacyNote}
        </div>
      </form>
    </div>
  );
}
