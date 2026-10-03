import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateCode(): string {
  // 6-char alphanumeric uppercase code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

async function authenticateReferrer(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!token || token.length < 32) return null;

  const tokenHash = hashToken(token);
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('referrers')
    .select('*')
    .eq('access_token_hash', tokenHash)
    .eq('status', 'approved')
    .single();

  if (error || !data) return null;
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } });
  }

  try {
    const referrer = await authenticateReferrer(req);
    if (!referrer) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token.' }
      });
    }

    const supabase = getSupabase();

    // Generate unique code (with retry for collisions)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    if (attempts >= 5) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Could not generate a unique code. Please try again.' }
      });
    }

    // Validity: 30 days from now
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Atomic invite generation via RPC
    const { data: success, error: rpcError } = await supabase.rpc('generate_referral_invite', {
      p_referrer_id: referrer.id,
      p_code: code,
      p_valid_until: validUntil,
      p_max_uses: 1,  // Each invite code is single-use by default
    });

    if (rpcError) {
      console.error('Invite RPC error:', rpcError);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Could not generate invitation. Please try again.' }
      });
    }

    if (!success) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVITE_LIMIT_REACHED', message: 'You have used all your invitations for this period.' }
      });
    }

    // Log event
    await supabase.from('referral_events').insert([{
      event_type: 'invite_generated',
      referrer_id: referrer.id,
      metadata: { code }
    }]);

    // Refresh referrer to get updated invites_used
    const { data: updated } = await supabase
      .from('referrers')
      .select('invites_used, invite_limit')
      .eq('id', referrer.id)
      .single();

    const domain = process.env.VITE_SITE_URL || 'https://www.krishnamahawar.in';
    const inviteUrl = `${domain}/join?ref=${code}`;

    return res.status(201).json({
      success: true,
      data: {
        code,
        inviteUrl,
        remainingInvites: Math.max(0, (updated?.invite_limit || referrer.invite_limit) - (updated?.invites_used || referrer.invites_used + 1)),
      }
    });

  } catch (error) {
    console.error('Referral invite error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }
    });
  }
}
