import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const TIER_LIMITS: Record<string, number> = { member: 3, trusted: 5, core: 10 };

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Simple in-memory rate limit (resets on cold start, good enough for serverless)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  entry.count++;
  return entry.count <= 10; // Max 10 attempts per 15 min
}

function authenticateAdmin(req: VercelRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const provided = authHeader.slice(7).trim();
  if (!provided) return false;

  try {
    return timingSafeCompare(provided, secret);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' }
    });
  }

  if (!authenticateAdmin(req)) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed.' }
    });
  }

  try {
    const { action, ...params } = req.body || {};
    const supabase = getSupabase();

    switch (action) {
      // ═══════════════════════════════════════
      // REFERRERS
      // ═══════════════════════════════════════

      case 'list_referrers': {
        const { data: referrers, error } = await supabase
          .from('referrers')
          .select('id, name, email, tier, status, invite_limit, invites_used, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Count accepted applications per referrer
        const { data: accepted } = await supabase
          .from('referral_applications')
          .select('referrer_id')
          .eq('status', 'accepted');

        const acceptedMap = new Map<string, number>();
        (accepted || []).forEach(a => {
          acceptedMap.set(a.referrer_id, (acceptedMap.get(a.referrer_id) || 0) + 1);
        });

        return res.status(200).json({
          success: true,
          data: (referrers || []).map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            tier: r.tier,
            status: r.status,
            inviteLimit: r.invite_limit,
            invitesUsed: r.invites_used,
            acceptedCount: acceptedMap.get(r.id) || 0,
            createdAt: r.created_at,
          }))
        });
      }

      case 'approve_referrer': {
        const { referrerId } = params;
        if (!referrerId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'referrerId required.' } });

        // Generate access token — returned ONCE
        const rawToken = generateAccessToken();
        const tokenHash = hashToken(rawToken);
        const now = new Date();

        const { error } = await supabase
          .from('referrers')
          .update({
            status: 'approved',
            access_token_hash: tokenHash,
            approved_at: now.toISOString(),
            invites_reset_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', referrerId);

        if (error) throw error;

        await supabase.from('referral_events').insert([{
          event_type: 'referrer_approved',
          referrer_id: referrerId,
          metadata: {}
        }]);

        return res.status(200).json({
          success: true,
          data: {
            accessToken: rawToken, // ← RETURNED ONCE, never stored/logged
            message: 'Referrer approved. Save this access token — it will not be shown again.'
          }
        });
      }

      case 'create_referrer': {
        const { name, email, tier } = params;
        if (!name || !email) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'name and email required.' } });

        const normalizedEmail = email.trim().toLowerCase();
        const selectedTier = tier && TIER_LIMITS[tier] ? tier : 'member';
        const rawToken = generateAccessToken();
        const tokenHash = hashToken(rawToken);
        const now = new Date();

        const { data: existing } = await supabase
          .from('referrers')
          .select('id')
          .eq('email', normalizedEmail)
          .single();

        if (existing) {
          return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'A referrer with this email already exists.' } });
        }

        const { error } = await supabase
          .from('referrers')
          .insert([{
            name: name.trim(),
            email: normalizedEmail,
            tier: selectedTier,
            status: 'approved',
            access_token_hash: tokenHash,
            invite_limit: TIER_LIMITS[selectedTier],
            invites_used: 0,
            invites_reset_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            approved_at: now.toISOString(),
          }]);

        if (error) throw error;

        await supabase.from('referral_events').insert([{
          event_type: 'referrer_approved',
          metadata: { email: normalizedEmail }
        }]);

        return res.status(201).json({
          success: true,
          data: {
            accessToken: rawToken,
            message: 'Referrer created and approved. Save this access token — it will not be shown again.'
          }
        });
      }

      case 'suspend_referrer': {
        const { referrerId } = params;
        if (!referrerId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'referrerId required.' } });

        await supabase.from('referrers').update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('id', referrerId);
        await supabase.from('referral_events').insert([{ event_type: 'referrer_suspended', referrer_id: referrerId }]);

        return res.status(200).json({ success: true, data: { message: 'Referrer suspended.' } });
      }

      case 'revoke_referrer': {
        const { referrerId } = params;
        if (!referrerId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'referrerId required.' } });

        await supabase.from('referrers').update({ status: 'revoked', updated_at: new Date().toISOString() }).eq('id', referrerId);
        // Also revoke all their active codes
        await supabase.from('referral_codes').update({ status: 'revoked' }).eq('referrer_id', referrerId).eq('status', 'active');
        await supabase.from('referral_events').insert([{ event_type: 'referrer_revoked', referrer_id: referrerId }]);

        return res.status(200).json({ success: true, data: { message: 'Referrer revoked and all codes deactivated.' } });
      }

      case 'change_tier': {
        const { referrerId, tier } = params;
        if (!referrerId || !tier || !TIER_LIMITS[tier]) {
          return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'referrerId and valid tier required.' } });
        }

        await supabase.from('referrers').update({
          tier,
          invite_limit: TIER_LIMITS[tier],
          updated_at: new Date().toISOString()
        }).eq('id', referrerId);

        return res.status(200).json({ success: true, data: { message: `Tier changed to ${tier}.` } });
      }

      // ═══════════════════════════════════════
      // APPLICATIONS
      // ═══════════════════════════════════════

      case 'list_applications': {
        const { data, error } = await supabase
          .from('referral_applications')
          .select('*, referral_codes!inner(code), referrers!inner(name)')
          .order('submitted_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          data: (data || []).map(a => ({
            id: a.id,
            applicantName: a.applicant_name,
            applicantEmail: a.applicant_email,
            college: a.college,
            year: a.year,
            researchInterests: a.research_interests,
            currentStage: a.current_stage,
            motivation: a.motivation,
            linkedIn: a.linkedin,
            status: a.status,
            submittedAt: a.submitted_at,
            referrerName: (a as any).referrers?.name || '',
            code: (a as any).referral_codes?.code || '',
            reviewNotes: a.review_notes,
          }))
        });
      }

      case 'accept_application': {
        const { applicationId, notes } = params;
        if (!applicationId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'applicationId required.' } });

        const { data: app } = await supabase
          .from('referral_applications')
          .select('referrer_id')
          .eq('id', applicationId)
          .single();

        await supabase.from('referral_applications').update({
          status: 'accepted',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          review_notes: notes || null,
        }).eq('id', applicationId);

        // Create pending reward for referrer
        if (app?.referrer_id) {
          await supabase.from('referral_rewards').insert([{
            referrer_id: app.referrer_id,
            application_id: applicationId,
            reward_type: 'referral_credit',
            amount: 1,
            status: 'pending',
          }]);
        }

        await supabase.from('referral_events').insert([{
          event_type: 'applicant_accepted',
          application_id: applicationId,
          referrer_id: app?.referrer_id,
        }]);

        return res.status(200).json({ success: true, data: { message: 'Application accepted.' } });
      }

      case 'reject_application': {
        const { applicationId, notes } = params;
        if (!applicationId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'applicationId required.' } });

        await supabase.from('referral_applications').update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          review_notes: notes || null,
        }).eq('id', applicationId);

        await supabase.from('referral_events').insert([{
          event_type: 'applicant_rejected',
          application_id: applicationId,
        }]);

        return res.status(200).json({ success: true, data: { message: 'Application rejected.' } });
      }

      // ═══════════════════════════════════════
      // CODES
      // ═══════════════════════════════════════

      case 'list_codes': {
        const { data, error } = await supabase
          .from('referral_codes')
          .select('*, referrers!inner(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          data: (data || []).map(c => ({
            id: c.id,
            code: c.code,
            referrerName: (c as any).referrers?.name || '',
            status: c.status,
            usesCount: c.uses_count,
            maxUses: c.max_uses,
            validFrom: c.valid_from,
            validUntil: c.valid_until,
            createdAt: c.created_at,
          }))
        });
      }

      case 'revoke_code': {
        const { codeId } = params;
        if (!codeId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'codeId required.' } });

        await supabase.from('referral_codes').update({ status: 'revoked' }).eq('id', codeId);
        await supabase.from('referral_events').insert([{ event_type: 'code_revoked', referral_code_id: codeId }]);

        return res.status(200).json({ success: true, data: { message: 'Code revoked.' } });
      }

      case 'generate_code': {
        const { referrerId, validDays, maxUses } = params;
        if (!referrerId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'referrerId required.' } });

        let code = generateCode();
        // Check for collision
        const { data: existing } = await supabase.from('referral_codes').select('id').eq('code', code).single();
        if (existing) code = generateCode();

        const validUntil = validDays ? new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString() : null;

        await supabase.from('referral_codes').insert([{
          referrer_id: referrerId,
          code,
          status: 'active',
          valid_until: validUntil,
          max_uses: maxUses || null,
        }]);

        return res.status(201).json({
          success: true,
          data: { code, inviteUrl: `https://www.krishnamahawar.in/join?ref=${code}` }
        });
      }

      // ═══════════════════════════════════════
      // REWARDS
      // ═══════════════════════════════════════

      case 'approve_reward': {
        const { rewardId } = params;
        if (!rewardId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'rewardId required.' } });
        await supabase.from('referral_rewards').update({ status: 'approved' }).eq('id', rewardId);
        return res.status(200).json({ success: true, data: { message: 'Reward approved.' } });
      }

      case 'credit_reward': {
        const { rewardId } = params;
        if (!rewardId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'rewardId required.' } });
        await supabase.from('referral_rewards').update({ status: 'credited' }).eq('id', rewardId);
        return res.status(200).json({ success: true, data: { message: 'Reward credited.' } });
      }

      case 'cancel_reward': {
        const { rewardId } = params;
        if (!rewardId) return res.status(400).json({ success: false, error: { code: 'MISSING_PARAM', message: 'rewardId required.' } });
        await supabase.from('referral_rewards').update({ status: 'cancelled' }).eq('id', rewardId);
        return res.status(200).json({ success: true, data: { message: 'Reward cancelled.' } });
      }

      // ═══════════════════════════════════════
      // ANALYTICS
      // ═══════════════════════════════════════

      case 'get_stats': {
        const { data: referrers } = await supabase.from('referrers').select('id, tier, status');
        const { data: apps } = await supabase.from('referral_applications').select('id, status, referrer_id');
        const { data: codes } = await supabase.from('referral_codes').select('id, uses_count');

        const allReferrers = referrers || [];
        const allApps = apps || [];
        const allCodes = codes || [];

        const totalReferrers = allReferrers.length;
        const activeReferrers = allReferrers.filter(r => r.status === 'approved').length;
        const totalApplications = allApps.length;
        const pendingApplications = allApps.filter(a => a.status === 'pending').length;
        const acceptedApplications = allApps.filter(a => a.status === 'accepted').length;
        const rejectedApplications = allApps.filter(a => a.status === 'rejected').length;
        const totalInvites = allCodes.reduce((s, c) => s + c.uses_count, 0);

        const applicationsByTier: Record<string, number> = { member: 0, trusted: 0, core: 0 };
        const referrerTierMap = new Map(allReferrers.map(r => [r.id, r.tier]));
        allApps.forEach(a => {
          const tier = referrerTierMap.get(a.referrer_id) || 'member';
          applicationsByTier[tier] = (applicationsByTier[tier] || 0) + 1;
        });

        return res.status(200).json({
          success: true,
          data: {
            totalReferrers,
            activeReferrers,
            totalApplications,
            pendingApplications,
            acceptedApplications,
            rejectedApplications,
            acceptanceRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
            inviteToApplicationRate: totalInvites > 0 ? Math.round((totalApplications / totalInvites) * 100) : 0,
            applicationToAcceptanceRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
            applicationsByTier,
          }
        });
      }

      // ═══════════════════════════════════════
      // EXPORT
      // ═══════════════════════════════════════

      case 'export_csv': {
        const { type } = params;
        let csvContent = '';

        if (type === 'applications') {
          const { data } = await supabase
            .from('referral_applications')
            .select('*, referral_codes!inner(code), referrers!inner(name)')
            .order('submitted_at', { ascending: false });

          csvContent = 'Name,Email,College,Year,Status,Referrer,Code,Submitted\n';
          (data || []).forEach(a => {
            csvContent += `"${a.applicant_name}","${a.applicant_email}","${a.college || ''}","${a.year || ''}","${a.status}","${(a as any).referrers?.name || ''}","${(a as any).referral_codes?.code || ''}","${a.submitted_at}"\n`;
          });
        } else if (type === 'referrers') {
          const { data } = await supabase.from('referrers').select('name, email, tier, status, invite_limit, invites_used, created_at').order('created_at', { ascending: false });

          csvContent = 'Name,Email,Tier,Status,Limit,Used,Created\n';
          (data || []).forEach(r => {
            csvContent += `"${r.name}","${r.email}","${r.tier}","${r.status}",${r.invite_limit},${r.invites_used},"${r.created_at}"\n`;
          });
        } else {
          return res.status(400).json({ success: false, error: { code: 'INVALID_EXPORT', message: 'Export type must be "applications" or "referrers".' } });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=referral_${type}_${new Date().toISOString().slice(0, 10)}.csv`);
        return res.status(200).send(csvContent);
      }

      default:
        return res.status(400).json({
          success: false,
          error: { code: 'UNKNOWN_ACTION', message: 'Unknown admin action.' }
        });
    }

  } catch (error) {
    console.error('Admin manage error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An internal error occurred.' }
    });
  }
}
