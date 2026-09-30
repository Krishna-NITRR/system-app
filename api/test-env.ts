import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
    razorpayId: process.env.RAZORPAY_KEY_ID ? 'set' : 'missing',
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET ? 'set' : 'missing'
  });
}
