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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CODE: 'This invitation is not valid.',
  CODE_INACTIVE: 'This invitation is no longer active.',
  CODE_EXPIRED: 'This invitation has expired.',
  CODE_EXHAUSTED: 'This invitation has reached its limit.',
  REFERRER_INACTIVE: 'The referrer for this invitation is no longer active.',
  DUPLICATE_APPLICATION: 'An application with this email already exists.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST.' } });
  }

  try {
    const { code, name, email, college, year, researchInterests, currentStage, motivation, linkedIn } = req.body || {};

    // ── Input Validation ──
    const errors: string[] = [];

    if (!code || typeof code !== 'string' || code.trim().length < 3) errors.push('Invalid referral code.');
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 200) errors.push('Please enter your full name.');
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) errors.push('Please enter a valid email address.');
    if (motivation && typeof motivation === 'string' && motivation.length > 5000) errors.push('Motivation text is too long.');
    if (college && typeof college === 'string' && college.length > 300) errors.push('College name is too long.');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: errors[0] }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();

    const supabase = getSupabase();
    const ipHash = hashIp(req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress);
    const userAgent = (req.headers['user-agent'] || '').slice(0, 200);

    // ── Atomic Application Submission via RPC ──
    const { data: result, error: rpcError } = await supabase.rpc('submit_referral_application', {
      p_code: normalizedCode,
      p_applicant_name: name.trim(),
      p_applicant_email: normalizedEmail,
      p_college: college?.trim() || null,
      p_year: year?.trim() || null,
      p_research_interests: researchInterests?.trim() || null,
      p_current_stage: currentStage?.trim() || null,
      p_motivation: motivation?.trim() || null,
      p_linkedin: linkedIn?.trim() || null,
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);

      // Check for unique constraint violation (duplicate email)
      if (rpcError.code === '23505' || rpcError.message?.includes('unique')) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_APPLICATION', message: 'An application with this email already exists.' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Could not process your application. Please try again.' }
      });
    }

    // Handle RPC-level errors (returned in the JSON result)
    if (!result?.success) {
      const errorCode = result?.error_code || 'UNKNOWN_ERROR';
      const message = ERROR_MESSAGES[errorCode] || 'Could not process your application.';

      // Log the blocked attempt
      await supabase.from('referral_events').insert([{
        event_type: errorCode === 'DUPLICATE_APPLICATION' ? 'duplicate_application_blocked' : 'application_rejected',
        ip_hash: ipHash,
        user_agent: userAgent,
        metadata: { code: normalizedCode, email: normalizedEmail, reason: errorCode }
      }]);

      const statusCode = errorCode === 'DUPLICATE_APPLICATION' ? 409 : 400;
      return res.status(statusCode).json({
        success: false,
        error: { code: errorCode, message }
      });
    }

    // ── Log successful application ──
    await supabase.from('referral_events').insert([{
      event_type: 'application_submitted',
      application_id: result.application_id,
      ip_hash: ipHash,
      user_agent: userAgent,
      metadata: { code: normalizedCode }
    }]);

    return res.status(201).json({
      success: true,
      data: {
        applicationId: result.application_id,
        message: 'Your application has been received. We will review it and get back to you.'
      }
    });

  } catch (error) {
    console.error('Referral apply error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' }
    });
  }
}
