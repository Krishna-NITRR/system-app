import { useState } from 'react';
import type { PreSessionFormData } from './PreSessionForm';
import type { Slot } from '../../types/mentorship';
import { supabase } from '../../supabaseClient';
import { mentorshipConfig } from '../../config/mentorship';

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

export default function PaymentTrigger({ formData, selectedSlot, currency, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = currency === 'INR' ? mentorshipConfig.priceINR : mentorshipConfig.priceUSD;
  const symbol = currency === 'INR' ? '₹' : '$';
  const slotStart = formatSlotDateTime(selectedSlot.slotStart);
  const slotEnd = formatSlotDateTime(selectedSlot.slotEnd);

  const handlePayment = async () => {
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
          booking_status: 'pending'
        }]);

      if (insertError) {
        throw new Error(insertError.message || 'Failed to initialize booking');
      }

      // 2. Call server to reserve slot and create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, currency })
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
        // Dynamically load Razorpay script if not already there
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
          // 4. Verify payment on server
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
        theme: {
          color: '#6C4CF1'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
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

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)', padding: '32px' }}>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--text)', textAlign: 'center' }}>Confirm & Pay</h3>

      {/* Order Summary */}
      <div style={{ background: 'rgba(108,76,241,0.05)', border: '1px solid rgba(108,76,241,0.15)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--tl)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Session</div>
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>1:1 Mentorship — {mentorshipConfig.durationMinutes} min</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--tl)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Price</div>
              <div style={{ color: '#a085ff', fontWeight: 700, fontSize: '1.2rem' }}>{symbol}{price.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <div style={{ color: 'var(--tl)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Date & Time</div>
            <div style={{ color: 'var(--text)', fontWeight: 500 }}>{slotStart.date}</div>
            <div style={{ color: 'var(--tm)', fontSize: '0.95rem' }}>{slotStart.time} — {slotEnd.time}</div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <div style={{ color: 'var(--tl)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Booking for</div>
            <div style={{ color: 'var(--text)', fontWeight: 500 }}>{formData.student_name}</div>
            <div style={{ color: 'var(--tm)', fontSize: '0.9rem' }}>{formData.student_email}</div>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--tm)', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
        Your slot is reserved the moment payment clears. You'll receive a Google Meet link and calendar invite by email.
      </p>
      
      {error && (
        <div style={{ color: '#e74c3c', marginBottom: '16px', background: 'rgba(231,76,60,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="payment-trigger-actions">
        <button 
          className="btn btn-outline" 
          onClick={onCancel}
          disabled={loading}
          style={{ padding: '12px 24px' }}
        >
          Back
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handlePayment}
          disabled={loading}
          style={{ padding: '12px 32px' }}
        >
          {loading ? 'Processing...' : `Pay ${symbol}${price.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

