/**
 * Local dev server that emulates Vercel serverless API routes.
 * Proxies frontend requests to the Vite dev server.
 * Usage: node dev-server.cjs
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const VITE_PORT = 5173;

// ─── API: Create Order ───────────────────────────────────────────────
app.post('/api/create-order', async (req, res) => {
  try {
    // Dynamically import the handler's logic
    const { default: Razorpay } = await import('razorpay');
    const { createClient } = await import('@supabase/supabase-js');

    const { bookingId, currency } = req.body;
    const PRICES = { INR: 169900, USD: 2000 };

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ error: 'Invalid bookingId' });
    }
    if (currency !== 'INR' && currency !== 'USD') {
      return res.status(400).json({ error: 'Invalid currency. Must be INR or USD.' });
    }

    const amount = PRICES[currency];
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch booking
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

    // Reserve slot
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

    // Create Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      await supabase.from('mentorship_bookings').update({ booking_status: 'pending' }).eq('id', bookingId);
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: bookingId,
      notes: { bookingId, studentEmail: booking.student_email }
    });

    // Update booking
    await supabase
      .from('mentorship_bookings')
      .update({
        razorpay_order_id: order.id,
        payment_status: 'order_created',
        currency,
        amount_minor: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    return res.status(200).json({
      orderId: order.id,
      amount,
      currency,
      keyId: razorpayKeyId
    });

  } catch (error) {
    console.error('Unexpected error in create-order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── API: Verify Payment ────────────────────────────────────────────
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
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

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

    await supabase
      .from('mentorship_bookings')
      .update({
        payment_status: 'paid',
        booking_status: 'confirmed',
        razorpay_payment_id,
        razorpay_signature,
        reservation_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

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
});

// ─── Dynamic API routing for Vercel TS handlers ─────────────────────
require('tsx/cjs');
const fs = require('fs');
const path = require('path');

app.use('/api', async (req, res, next) => {
  // We handle existing explicit handlers first, so this acts as a fallback for /api
  // Determine file path
  let endpointPath = req.path.replace(/^\//, ''); // e.g. "referral/admin/manage"
  let tsFilePath = path.join(__dirname, 'api', `${endpointPath}.ts`);
  
  if (!fs.existsSync(tsFilePath)) {
    // try to see if it's a directory index or fallback
    return next();
  }

  try {
    const handlerModule = require(tsFilePath);
    const handler = handlerModule.default || handlerModule;
    await handler(req, res);
  } catch (error) {
    console.error(`Error executing ${tsFilePath}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error in dev-server proxy' });
    }
  }
});

// ─── Proxy everything else to Vite ──────────────────────────────────
app.use('/', createProxyMiddleware({
  target: `http://localhost:${VITE_PORT}`,
  changeOrigin: true,
  ws: true, // WebSocket for HMR
}));

app.listen(PORT, () => {
  console.log(`\n  ✅ Dev server running at http://localhost:${PORT}`);
  console.log(`  → API routes handled locally`);
  console.log(`  → Frontend proxied to Vite on :${VITE_PORT}\n`);
});
