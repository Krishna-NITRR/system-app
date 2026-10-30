import type { PreSessionFormData } from '../components/mentorship/PreSessionForm';
import type { Slot } from '../types/mentorship';

interface LeadUpdate {
  leadId: string;
  stage: 'form' | 'slot' | 'pay';
  form: PreSessionFormData;
  slot?: Slot | null;
  currency?: 'INR' | 'USD';
  bookingId?: string;
}

// Fire-and-forget: saving a lead must never slow down or break the booking flow.
export function saveLead(update: LeadUpdate) {
  try {
    fetch('/api/mentorship-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
      keepalive: true, // still sent if the student closes the tab right away
    }).catch(() => {});
  } catch {
    // ignore
  }
}
