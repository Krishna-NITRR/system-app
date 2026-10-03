import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET.' } });
  }

  try {
    const code = (req.query.code as string || '').trim().toUpperCase();

    if (!code || code.length < 3 || code.length > 20) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Please provide a valid referral code.' }
      });
    }

    // Only alphanumeric codes
    if (!/^[A-Z0-9]+$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Referral code contains invalid characters.' }
      });
    }

    const supabase = getSupabase();

    // Fetch code with referrer info
    const { data: codeRow, error: codeErr } = await supabase
      .from('referral_codes')
      .select('*, referrers!inner(name, status)')
      .eq('code', code)
      .single();

    if (codeErr || !codeRow) {
      // Log validation attempt
      await supabase.from('referral_events').insert([{
        event_type: 'code_validated',
        ip_hash: hashIp(req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress),
        user_agent: (req.headers['user-agent'] || '').slice(0, 200),
        metadata: { code, valid: false, reason: 'not_found' }
      }]);

      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_REFERRAL', message: 'This invitation is not valid.' }
      });
    }

    const referrer = codeRow.referrers as { name: string; status: string };
    const now = new Date();

    // Check referrer status
    if (referrer.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: { code: 'REFERRAL_INACTIVE', message: 'This invitation is no longer active.' }
      });
    }

    // Check code status
    if (codeRow.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'CODE_REVOKED', message: 'This invitation has been revoked.' }
      });
    }

    // Check expiry
    if (codeRow.valid_until && new Date(codeRow.valid_until) < now) {
      return res.status(400).json({
        success: false,
        error: { code: 'CODE_EXPIRED', message: 'This invitation has expired.' }
      });
    }

    // Check max uses
    const remainingUses = codeRow.max_uses != null ? codeRow.max_uses - codeRow.uses_count : null;
    if (remainingUses != null && remainingUses <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'CODE_EXHAUSTED', message: 'This invitation has reached its limit.' }
      });
    }

    // Log successful validation
    await supabase.from('referral_events').insert([{
      event_type: 'code_validated',
      referrer_id: codeRow.referrer_id,
      referral_code_id: codeRow.id,
      ip_hash: hashIp(req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress),
      user_agent: (req.headers['user-agent'] || '').slice(0, 200),
      metadata: { code, valid: true }
    }]);

    // Return sanitized response — no internal IDs, no email, no token
    const displayName = referrer.name.split(' ')[0] + (referrer.name.split(' ').length > 1 ? ' ' + referrer.name.split(' ')[1][0] + '.' : '');

    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        referrer: { name: displayName },
        expiresAt: codeRow.valid_until || null,
        remainingUses
      }
    });

  } catch (error) {
    console.error('Referral validate error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }
    });
  }
}
