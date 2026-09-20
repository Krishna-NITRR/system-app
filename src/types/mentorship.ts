export interface MentorshipFAQItem {
  question: string;
  answer: string;
}

export interface MentorshipInclude {
  title: string;
  description: string;
  icon: string;
}

export interface MentorshipProcessStep {
  title: string;
  description: string;
}

export interface MentorshipConfig {
  priceINR: number; // in rupees
  priceUSD: number; // in dollars
  durationMinutes: number;
  includes: MentorshipInclude[];
  process: MentorshipProcessStep[];
  faq: MentorshipFAQItem[];
  goodFor: string[];
  notFor: string[];
}

export interface Slot {
  slotStart: string; // ISO string UTC
  slotEnd: string;   // ISO string UTC
}

export interface DaySlots {
  date: string;      // YYYY-MM-DD
  slots: Slot[];
}

// Database models
export interface MentorshipBooking {
  id: string;
  student_name: string;
  student_email: string;
  student_situation: string;
  student_goal: string;
  academic_stage?: string;
  is_minor: boolean;
  guardian_email?: string;
  guardian_consent: boolean;
  slot_start: string;
  slot_end: string;
  reserved_at?: string;
  reservation_expires?: string;
  currency: 'INR' | 'USD';
  amount_minor: number;
  payment_status: 'pending' | 'order_created' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  booking_status: 'pending' | 'payment_pending' | 'confirmed' | 'cancelled' | 'expired' | 'completed' | 'no_show' | 'refunded';
  created_at: string;
  updated_at: string;
}
