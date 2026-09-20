import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      console.error('Missing Razorpay secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Initialize Supabase service client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify booking belongs to this order
    const { data: booking, error: fetchError } = await supabase
      .from('mentorship_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Order ID mismatch' });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('mentorship_bookings')
      .update({
        payment_status: 'paid',
        booking_status: 'confirmed',
        razorpay_payment_id,
        razorpay_signature,
        reservation_expires: null, // Clear expiration since it's confirmed
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating confirmed booking:', updateError);
      return res.status(500).json({ error: 'Failed to update booking status' });
    }

    // Success
    return res.status(200).json({ 
      status: 'confirmed', 
      bookingId,
      slotStart: booking.slot_start,
      slotEnd: booking.slot_end
    });

  } catch (error) {
    console.error('Unexpected error in verify-payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
