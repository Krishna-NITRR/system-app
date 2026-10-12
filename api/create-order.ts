import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const BASE_PRICES = {
  INR: 39900,   // ₹399 in paise
  USD: 2000,    // $20 in cents
} as const;

const REFERRAL_DISCOUNT = 0.10; // 10% off

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { bookingId, currency, referralCode } = req.body;

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ error: 'Invalid bookingId' });
    }

    if (currency !== 'INR' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be INR or USD.' });
    }

    const supabase = getSupabase();

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

    // 2. Validate referral code if provided (non-blocking — discount is best-effort)
    let discountApplied = false;
    if (referralCode && typeof referralCode === 'string') {
      try {
        const code = referralCode.trim().toUpperCase();
        const { data: codeRow } = await supabase
          .from('referral_codes')
          .select('*, referrers!inner(status)')
          .eq('code', code)
          .single();

        const referrer = codeRow?.referrers as { status: string } | undefined;
        const now = new Date();
        const isActive =
          codeRow &&
          codeRow.status === 'active' &&
          referrer?.status === 'approved' &&
          (!codeRow.valid_until || new Date(codeRow.valid_until) > now) &&
          (codeRow.max_uses == null || codeRow.uses_count < codeRow.max_uses);

        if (isActive) {
          discountApplied = true;
        }
      } catch (refErr) {
        console.warn('Referral validation non-blocking error:', refErr);
      }
    }

    const baseAmount = BASE_PRICES[currency];
    const amount = discountApplied
      ? Math.round(baseAmount * (1 - REFERRAL_DISCOUNT))
      : baseAmount;

    // 3. Reserve the slot atomically via RPC
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

    // 4. Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      await supabase.from('mentorship_bookings').update({ booking_status: 'pending' }).eq('id', bookingId);
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: bookingId,
      notes: {
        bookingId,
        studentEmail: booking.student_email,
        ...(discountApplied ? { referralCode: referralCode.trim().toUpperCase(), discount: '10%' } : {})
      }
    });

    // 5. Update booking with order details + discount info
    const { error: updateError } = await supabase
      .from('mentorship_bookings')
      .update({
        razorpay_order_id: order.id,
        payment_status: 'order_created',
        currency,
        amount_minor: amount,
        updated_at: new Date().toISOString(),
        ...(discountApplied ? { referral_code: referralCode.trim().toUpperCase() } : {})
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return res.status(500).json({ error: 'Failed to update booking status' });
    }

    return res.status(200).json({
      orderId: order.id,
      amount,
      currency,
      keyId: razorpayKeyId,
      discountApplied,
    });

  } catch (error) {
    console.error('Unexpected error in create-order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
