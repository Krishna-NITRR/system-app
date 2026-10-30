import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreSessionForm, { type PreSessionFormData } from './PreSessionForm';
import SlotPicker from './SlotPicker';
import PaymentTrigger from './PaymentTrigger';
import type { Slot } from '../../types/mentorship';
import { mentorshipConfig } from '../../config/mentorship';
import { track } from '../../utils/analytics';

export default function MentorshipBooking() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<PreSessionFormData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const navigate = useNavigate();

  const handleFormSubmit = (data: PreSessionFormData) => {
    setFormData(data);
    setStep(2);
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    track('slot_selected');
    setStep(3);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    track('payment_success', { currency });
    navigate(`/mentorship/confirmed?booking=${bookingId}`);
  };

  const price = currency === 'INR' ? `₹${mentorshipConfig.priceINR}` : `$${mentorshipConfig.priceUSD}`;
  const steps = ['About you', 'Time', `Pay ${price}`];

  return (
    <div>
      {/* Stepper Header : kept on one line, even on phones */}
      <div className="mentorship-stepper" aria-label="Booking steps">
        {steps.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {i > 0 && <div style={{ height: '1px', width: '20px', background: 'var(--div)', flexShrink: 0 }} />}
              <span style={{ fontWeight: step >= n ? 600 : 400, color: step >= n ? 'var(--purple)' : 'var(--tl)', whiteSpace: 'nowrap' }}>
                {n} · {label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {step === 1 && (
          <PreSessionForm onSubmit={handleFormSubmit} loading={false} />
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--tm)', cursor: 'pointer', padding: 0 }}
              >
                ← Back to form
              </button>
            </div>
            <SlotPicker selectedSlot={selectedSlot} onSelectSlot={handleSlotSelect} />
          </div>
        )}

        {step === 3 && formData && selectedSlot && (
          <PaymentTrigger
            formData={formData}
            selectedSlot={selectedSlot}
            currency={currency}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setStep(2)}
          />
        )}

        {/* India-first: INR by default, USD tucked behind a small link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--tl)' }}>
          Secure payment via Razorpay · UPI, cards
          {' · '}
          <button
            type="button"
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--purple)', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            {currency === 'INR' ? `Paying from abroad? ($${mentorshipConfig.priceUSD})` : `Pay in INR (₹${mentorshipConfig.priceINR})`}
          </button>
        </p>
      </div>
    </div>
  );
}
