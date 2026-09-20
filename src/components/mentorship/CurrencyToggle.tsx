import { mentorshipConfig } from '../../config/mentorship';

interface Props {
  currency: 'INR' | 'USD';
  onChange: (currency: 'INR' | 'USD') => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
      <div style={{ 
        display: 'inline-flex', 
        background: 'var(--bg2)', 
        borderRadius: '30px', 
        padding: '4px',
        border: '1px solid var(--div)'
      }}>
        <button
          onClick={() => onChange('INR')}
          style={{
            padding: '8px 24px',
            borderRadius: '24px',
            border: 'none',
            background: currency === 'INR' ? 'var(--bg)' : 'transparent',
            color: currency === 'INR' ? 'var(--text)' : 'var(--tm)',
            fontWeight: currency === 'INR' ? 600 : 500,
            boxShadow: currency === 'INR' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.95rem'
          }}
        >
          ₹{mentorshipConfig.priceINR} INR
        </button>
        <button
          onClick={() => onChange('USD')}
          style={{
            padding: '8px 24px',
            borderRadius: '24px',
            border: 'none',
            background: currency === 'USD' ? 'var(--bg)' : 'transparent',
            color: currency === 'USD' ? 'var(--text)' : 'var(--tm)',
            fontWeight: currency === 'USD' ? 600 : 500,
            boxShadow: currency === 'USD' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.95rem'
          }}
        >
          ${mentorshipConfig.priceUSD} USD
        </button>
      </div>
    </div>
  );
}
