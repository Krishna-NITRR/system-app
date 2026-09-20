import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CurrencyToggle from './CurrencyToggle';
import PreSessionForm, { PreSessionFormData } from './PreSessionForm';
import SlotPicker from './SlotPicker';
import PaymentTrigger from './PaymentTrigger';
import type { Slot } from '../../types/mentorship';

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
    setStep(3);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    navigate(`/mentorship/confirmed?booking=${bookingId}`);
  };

  return (
    <section className="sec bg2" id="booking">
      <div className="wrap fade vis">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '16px' }}>Book Your Session</div>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Let's figure it out</h2>

        <CurrencyToggle currency={currency} onChange={setCurrency} />

        {/* Stepper Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontWeight: step >= 1 ? 600 : 400, color: step >= 1 ? 'var(--purple)' : 'var(--tl)' }}>1. Form</div>
            <div style={{ height: '1px', width: '32px', background: 'var(--div)' }} />
            <div style={{ fontWeight: step >= 2 ? 600 : 400, color: step >= 2 ? 'var(--purple)' : 'var(--tl)' }}>2. Time</div>
            <div style={{ height: '1px', width: '32px', background: 'var(--div)' }} />
            <div style={{ fontWeight: step >= 3 ? 600 : 400, color: step >= 3 ? 'var(--purple)' : 'var(--tl)' }}>3. Pay</div>
          </div>
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
        </div>
      </div>
    </section>
  );
}
