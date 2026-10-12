import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const PRICES = {
  INR: 14900, // ₹149 in paise
  USD: 200,   // $2 in cents
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { customerName, customerEmail, customerPhone, currency = 'INR' } = req.body;

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!customerName || customerName.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your name' });
    }

    const cur = (currency === 'USD' ? 'USD' : 'INR') as 'INR' | 'USD';
    const amount = PRICES[cur];

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const receipt = `rm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const order = await razorpay.orders.create({
      amount,
      currency: cur,
      receipt,
      notes: {
        product: 'Placement Prep System (Career Roadmaps)',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : ''
      }
    });

    // Supabase lead tracking
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('leads').insert([{
          name: customerName.trim(),
          email: customerEmail.trim(),
          resource: 'career-roadmaps-checkout'
        }]);
      } catch (err) {
        console.warn('Lead logging non-blocking error:', err);
      }
    }

    return res.status(200).json({
      orderId: order.id,
      receipt,
      amount,
      currency: cur,
      keyId: razorpayKeyId
    });

  } catch (error: any) {
    console.error('Error in roadmaps create-order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
