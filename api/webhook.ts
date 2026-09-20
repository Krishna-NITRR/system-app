import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing Webhook secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Since Vercel parses JSON bodies automatically by default, we need to stringify it back to exactly 
    // what Razorpay sent. Alternatively, use raw body parsing if configured.
    // Assuming standard vercel parsing here.
    const bodyString = JSON.stringify(req.body);

    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const eventId = req.headers['x-razorpay-event-id'] as string;
    const event = req.body.event;
    const payload = req.body.payload;

    if (!eventId || !event) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Initialize Supabase service client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Idempotency check
    const { error: insertError } = await supabase
      .from('payment_events')
      .insert([{ event_id: eventId, event_type: event, payload }]);

    if (insertError) {
      if (insertError.code === '23505') {
        // Unique constraint violation - we've already processed this event
        return res.status(200).json({ status: 'ok', message: 'Already processed' });
      }
      throw insertError;
    }

    // Process event
    if (event === 'order.paid') {
      const order = payload.order.entity;
      const orderId = order.id;
      const bookingId = order.receipt; // We stored bookingId in receipt

      if (bookingId) {
        // Update booking if not already confirmed (e.g. by frontend verify-payment)
        await supabase
          .from('mentorship_bookings')
          .update({
            payment_status: 'paid',
            booking_status: 'confirmed',
            reservation_expires: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId)
          .eq('payment_status', 'order_created'); // Only update if still in order_created state
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      
      if (orderId) {
        await supabase
          .from('mentorship_bookings')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', orderId)
          .eq('payment_status', 'order_created');
      }
    }

    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
