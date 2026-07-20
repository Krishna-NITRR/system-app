import { useState } from 'react';
import type { ProductPricing as ProductPricingType } from '../../types/product';
import { useLeadContext } from '../../hooks/useLeadContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface Props {
  pricing: ProductPricingType;
  productId: string;
}

export default function ProductPricing({ pricing }: Props) {
  const { lead } = useLeadContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    setLoading(true);
    if (lead?.email) {
      try {
        await supabase
          .from('leads')
          .insert([{ 
            name: lead.name, 
            email: lead.email, 
            resource_slug: 'book-waitlist',
            traffic_source: 'waitlist_flow'
          }]);
      } catch (err) {
        console.error('Waitlist recording error', err);
      }
    }
    navigate('/waitlist-success');
  };

  return (
    <section className="sec" id="pricing">
      <div className="wrap fade">
        <div className="pricing-card">
          <div className="pricing-amount">
            <span className="pricing-currency">{pricing.currency === 'INR' ? '₹' : pricing.currency}</span>
            {pricing.amount}
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', marginTop: '24px' }}
            onClick={handleJoinWaitlist}
            disabled={loading}
          >
            {loading ? 'Joining...' : pricing.cta}
          </button>
          <p className="pricing-note">{pricing.note}</p>
        </div>
      </div>
    </section>
  );
}
