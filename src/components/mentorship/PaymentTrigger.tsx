import { useState } from 'react';
import type { PreSessionFormData } from './PreSessionForm';
import type { Slot } from '../../types/mentorship';
import { supabase } from '../../supabaseClient';
import { mentorshipConfig } from '../../config/mentorship';
import { track } from '../../utils/analytics';

// Add razorpay to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  formData: PreSessionFormData;
  selectedSlot: Slot;
  currency: 'INR' | 'USD';
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

function formatSlotDateTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { date, time };
}

const REFERRAL_DISCOUNT = 0.10; // 10% off with valid referral code

export default function PaymentTrigger({ formData, selectedSlot, currency, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referral state
  const [refCode, setRefCode] = useState('');
  const [refStatus, setRefStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [refReferrer, setRefReferrer] = useState<string | null>(null);
  const [showRef, setShowRef] = useState(false);

  const basePrice = currency === 'INR' ? mentorshipConfig.priceINR : mentorshipConfig.priceUSD;
  const symbol = currency === 'INR' ? '₹' : '$';
  const discount = refStatus === 'valid' ? Math.round(basePrice * REFERRAL_DISCOUNT) : 0;
  const finalPrice = basePrice - discount;

  const slotStart = formatSlotDateTime(selectedSlot.slotStart);
  const slotEnd = formatSlotDateTime(selectedSlot.slotEnd);

  const handleApplyRef = async () => {
    const code = refCode.trim().toUpperCase();
    if (!code) return;
    setRefStatus('checking');
    setRefReferrer(null);
    try {
      const res = await fetch(`/api/referral/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && data.data?.valid) {
        setRefStatus('valid');
        setRefReferrer(data.data.referrer?.name || null);
      } else {
        setRefStatus('invalid');
      }
    } catch {
      setRefStatus('invalid');
    }
  };

  const handlePayment = async () => {
    track('pay_click', { currency });
    try {
      setLoading(true);
      setError(null);

      // 1. Create booking record (pending) using anon key
      const bookingId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('mentorship_bookings')
        .insert([{
          id: bookingId,
          ...formData,
          slot_start: selectedSlot.slotStart,
          slot_end: selectedSlot.slotEnd,
          currency,
          amount_minor: 0, // Will be set by server
          payment_status: 'pending',
          booking_status: 'pending',
          ...(refStatus === 'valid' ? { referral_code: refCode.trim().toUpperCase() } : {})
        }]);

      if (insertError) {
        throw new Error(insertError.message || 'Failed to initialize booking');
      }

      // 2. Call server to reserve slot and create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          currency,
          ...(refStatus === 'valid' ? { referralCode: refCode.trim().toUpperCase() } : {})
        })
      });

      let orderData;
      try {
        orderData = await orderResponse.json();
      } catch {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 3. Initialize Razorpay checkout
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Krishna Mahawar',
        description: '1:1 Mentorship Session',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.status === 'confirmed') {
              onSuccess(bookingId);
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: formData.student_name,
          email: formData.student_email,
        },
        theme: { color: '#6C4CF1' },
        modal: {
          ondismiss: function() { setLoading(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        const desc = response.error?.description || 'Payment could not be processed';
        const reason = response.error?.reason || '';
        setError(`Payment failed: ${desc}${reason ? ` (${reason})` : ''}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const card: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: 'clamp(18px, 5vw, 32px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#9ca3af',
    marginBottom: '4px'
  };

  const valueStyle: React.CSSProperties = {
    color: '#111827',
    fontWeight: 600,
    fontSize: '1rem'
  };

  return (
    <div style={card}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', color: '#111827', textAlign: 'center', fontWeight: 700 }}>
        Confirm &amp; Pay
      </h3>

      {/* Order Summary */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={labelStyle}>Session</span>
              <span style={valueStyle}>1:1 Mentorship · {mentorshipConfig.durationMinutes} min</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={labelStyle}>Price</span>
              {discount > 0 && (
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  {symbol}{basePrice.toLocaleString()}
                </div>
              )}
              <div style={{ color: '#6C4CF1', fontWeight: 700, fontSize: '1.3rem' }}>
                {symbol}{finalPrice.toLocaleString()}
              </div>
              {discount > 0 && (
                <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                  You save {symbol}{discount} (10% off)
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <span style={labelStyle}>Date &amp; Time</span>
            <div style={valueStyle}>{slotStart.date}</div>
            <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{slotStart.time} to {slotEnd.time}</div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <span style={labelStyle}>Booking for</span>
            <div style={valueStyle}>{formData.student_name}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{formData.student_email}</div>
          </div>
        </div>
      </div>

      {/* Referral Code : collapsed to a small link so buyers don't leave to hunt for a code */}
      {!showRef && refStatus !== 'valid' ? (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowRef(true)}
            style={{ background: 'none', border: 'none', padding: 0, color: '#6b7280', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Have a referral code?
          </button>
        </div>
      ) : (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <input
            type="text"
            placeholder="e.g. KRISHNA10"
            value={refCode}
            onChange={e => { setRefCode(e.target.value); setRefStatus('idle'); setRefReferrer(null); }}
            disabled={refStatus === 'valid' || loading}
            aria-label="Referral code"
            autoFocus
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 14px',
              border: `1.5px solid ${refStatus === 'valid' ? '#16a34a' : refStatus === 'invalid' ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              background: refStatus === 'valid' ? '#f0fdf4' : '#fff',
              color: '#111827',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          {refStatus !== 'valid' ? (
            <button
              type="button"
              onClick={handleApplyRef}
              disabled={!refCode.trim() || refStatus === 'checking' || loading}
              style={{
                padding: '10px 18px',
                background: '#6C4CF1',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                cursor: refCode.trim() ? 'pointer' : 'not-allowed',
                opacity: refCode.trim() ? 1 : 0.6,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {refStatus === 'checking' ? '...' : 'Apply'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setRefStatus('idle'); setRefCode(''); setRefReferrer(null); }}
              style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Remove
            </button>
          )}
        </div>

        {refStatus === 'valid' && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            ✓ Code applied{refReferrer ? `. Referred by ${refReferrer}` : ''}. 10% discount applied!
          </div>
        )}
        {refStatus === 'invalid' && (
          <div style={{ marginTop: '8px', color: '#dc2626', fontSize: '0.85rem' }}>
            Invalid or expired referral code.
          </div>
        )}
      </div>
      )}

      <p style={{ color: '#6b7280', marginBottom: '20px', textAlign: 'center', fontSize: '0.875rem' }}>
        Your slot is reserved the moment payment clears. You'll receive a Google Meet link and calendar invite by email.
      </p>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '16px', background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="payment-trigger-actions">
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: '0 0 auto',
            padding: '12px 24px',
            border: '1.5px solid #d1d5db',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            background: '#fff',
            color: '#374151',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            flex: '1 1 200px',
            padding: '14px 24px',
            background: '#6C4CF1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(108,76,241,0.35)'
          }}
        >
          {loading ? 'Processing...' : `Pay ${symbol}${finalPrice.toLocaleString()} via Razorpay`}
        </button>
      </div>
    </div>
  );
}
