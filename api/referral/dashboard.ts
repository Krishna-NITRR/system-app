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

async function authenticateReferrer(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token || token.length < 32) return null;

  const tokenHash = hashToken(token);
  const supabase = getSupabase();

  const { data: referrer, error } = await supabase
    .from('referrers')
    .select('*')
    .eq('access_token_hash', tokenHash)
    .eq('status', 'approved')
    .single();

  if (error || !referrer) return null;
  return referrer;
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
    const now = new Date();

    // ── Reset monthly invites if needed ──
    if (referrer.invites_reset_at && new Date(referrer.invites_reset_at) <= now) {
      await supabase
        .from('referrers')
        .update({
          invites_used: 0,
          invites_reset_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', referrer.id);
      referrer.invites_used = 0;
    }

    // ── Fetch applications ──
    const { data: applications, error: appErr } = await supabase
      .from('referral_applications')
      .select('applicant_name, applicant_email, status, submitted_at, referral_codes!inner(code)')
      .eq('referrer_id', referrer.id)
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (appErr) {
      console.error('Dashboard applications error:', appErr);
    }

    // ── Fetch codes ──
    const { data: codes, error: codesErr } = await supabase
      .from('referral_codes')
      .select('code, status, uses_count, max_uses, valid_until, created_at')
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (codesErr) {
      console.error('Dashboard codes error:', codesErr);
    }

    // ── Fetch rewards ──
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('amount, status')
      .eq('referrer_id', referrer.id)
      .in('status', ['approved', 'credited']);

    const totalRewards = (rewards || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // ── Calculate stats ──
    const apps = applications || [];
    const totalApplications = apps.length;
    const pendingApplications = apps.filter(a => a.status === 'pending').length;
    const acceptedApplications = apps.filter(a => a.status === 'accepted').length;
    const rejectedApplications = apps.filter(a => a.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      data: {
        referrer: {
          name: referrer.name,
          tier: referrer.tier,
          inviteLimit: referrer.invite_limit,
          invitesUsed: referrer.invites_used,
          invitesRemaining: Math.max(0, referrer.invite_limit - referrer.invites_used),
          resetDate: referrer.invites_reset_at,
        },
        stats: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          totalRewards,
        },
        applications: apps.map(a => ({
          applicantName: a.applicant_name,
          applicantEmail: a.applicant_email,
          status: a.status,
          submittedAt: a.submitted_at,
          code: (a as any).referral_codes?.code || '',
        })),
        codes: (codes || []).map(c => ({
          code: c.code,
          status: c.status,
          usesCount: c.uses_count,
          maxUses: c.max_uses,
          validUntil: c.valid_until,
          createdAt: c.created_at,
        })),
      }
    });

  } catch (error) {
    console.error('Referral dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }
    });
  }
}
