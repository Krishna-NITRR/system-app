import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const PRICES = {
  INR: 169900,  // ₹1,699 in paise
  USD: 2000,    // $20 in cents
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { bookingId, currency } = req.body;

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ error: 'Invalid bookingId' });
    }

    if (currency !== 'INR' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be INR or USD.' });
    }

    const amount = PRICES[currency];

    // Initialize Supabase service client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch the booking
    const { data: booking, error: fetchError } = await supabase
      .from('mentorship_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in a state to be paid' });
    }

    // 2. Reserve the slot atomically via RPC
    const { data: reserved, error: rpcError } = await supabase
      .rpc('reserve_mentorship_slot', {
        p_booking_id: bookingId,
        p_slot_start: booking.slot_start,
        p_slot_end: booking.slot_end,
        p_expire_minutes: 15
      });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return res.status(500).json({ error: 'Failed to reserve slot' });
    }

    if (!reserved) {
      return res.status(409).json({ error: 'Slot is no longer available' });
    }

    // 3. Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      // Revert reservation if we can't create the order
      await supabase.from('mentorship_bookings').update({ booking_status: 'pending' }).eq('id', bookingId);
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount,
      currency,
      receipt: bookingId,
      notes: {
        bookingId,
        studentEmail: booking.student_email
      }
    };

    const order = await razorpay.orders.create(options);

    // 4. Update booking with order details
    const { error: updateError } = await supabase
      .from('mentorship_bookings')
      .update({
        razorpay_order_id: order.id,
        payment_status: 'order_created',
        currency,
        amount_minor: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return res.status(500).json({ error: 'Failed to update booking status' });
    }

    // Return the response for frontend
    return res.status(200).json({
      orderId: order.id,
      amount,
      currency,
      keyId: razorpayKeyId // Safe to send to frontend
    });

  } catch (error) {
    console.error('Unexpected error in create-order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
