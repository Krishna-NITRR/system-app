import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Saves /mentorship form answers as a lead at each booking step, so students
// who stop before paying are not lost. Writes with the service role because
// mentorship_leads has no anon policies.

const STAGES = ['form', 'slot', 'pay'] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== 'string' || isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { leadId, stage, form = {}, slot, currency, bookingId } = req.body || {};

    if (typeof leadId !== 'string' || !UUID_RE.test(leadId)) {
      return res.status(400).json({ error: 'Invalid leadId' });
    }
    if (!STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const email = text(form.student_email, 254);
    const name = text(form.student_name, 200);
    if (!email || !EMAIL_RE.test(email) || !name) {
      return res.status(400).json({ error: 'Name and a valid email are required' });
    }

    const row: Record<string, unknown> = {
      id: leadId,
      stage,
      student_name: name,
      student_email: email.toLowerCase(),
      student_situation: text(form.student_situation, 4000),
      student_goal: text(form.student_goal, 2000),
      academic_stage: text(form.academic_stage, 50),
      is_minor: form.is_minor === true,
      guardian_email: text(form.guardian_email, 254),
      updated_at: new Date().toISOString(),
    };
    if (slot) {
      row.slot_start = isoDate(slot.slotStart);
      row.slot_end = isoDate(slot.slotEnd);
    }
    if (currency === 'INR' || currency === 'USD') row.currency = currency;
    if (typeof bookingId === 'string' && UUID_RE.test(bookingId)) row.booking_id = bookingId;

    const { error } = await getSupabase()
      .from('mentorship_leads')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Lead upsert error:', error);
      return res.status(500).json({ error: 'Failed to save lead' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('mentorship-lead error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
