import { useState } from 'react';
import type { PreSessionFormData } from './PreSessionForm';
import type { Slot } from '../../types/mentorship';
import { supabase } from '../../supabaseClient';

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

export default function PaymentTrigger({ formData, selectedSlot, currency, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create booking record (pending) using anon key
      const { data: booking, error: insertError } = await supabase
        .from('mentorship_bookings')
        .insert([{
          ...formData,
          slot_start: selectedSlot.slotStart,
          slot_end: selectedSlot.slotEnd,
          currency,
          amount_minor: 0, // Will be set by server
          payment_status: 'pending',
          booking_status: 'pending'
        }])
        .select('id')
        .single();

      if (insertError || !booking) {
        throw new Error(insertError?.message || 'Failed to initialize booking');
      }

      const bookingId = booking.id;

      // 2. Call server to reserve slot and create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, currency })
      });

      const orderData = await orderResponse.json();

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
              setError(verifyData.error || 'Payment verification failed');
              setLoading(false);
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
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
        setError(`Payment failed: ${response.error.description}`);
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
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)', padding: '32px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text)' }}>Confirm Booking</h3>
      <p style={{ color: 'var(--tm)', marginBottom: '32px' }}>
        You are booking a 30-minute session. Your slot will be reserved immediately upon successful payment.
      </p>
      
      {error && (
        <div style={{ color: '#e74c3c', marginBottom: '16px', background: 'rgba(231,76,60,0.1)', padding: '12px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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
          {loading ? 'Processing...' : 'Pay & Book Slot'}
        </button>
      </div>
    </div>
  );
}
