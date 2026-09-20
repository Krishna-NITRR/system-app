-- ============================================
-- TABLE: mentorship_availability
-- Recurring weekly schedule (Asia/Kolkata)
-- ============================================
CREATE TABLE mentorship_availability (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week   smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time    time NOT NULL,  -- in Asia/Kolkata
  end_time      time NOT NULL,  -- in Asia/Kolkata
  slot_duration smallint NOT NULL DEFAULT 30,  -- minutes
  buffer_after  smallint NOT NULL DEFAULT 0,   -- minutes between slots
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Unique: one active slot-window per day
CREATE UNIQUE INDEX idx_avail_day_active
  ON mentorship_availability (day_of_week)
  WHERE is_active = true;

-- Seed initial availability (Asia/Kolkata times)
INSERT INTO mentorship_availability (day_of_week, start_time, end_time)
VALUES
  (1, '18:00', '21:00'),  -- Monday
  (2, '18:00', '21:00'),  -- Tuesday
  (4, '18:00', '21:00'),  -- Thursday
  (5, '18:00', '21:00'),  -- Friday
  (6, '10:00', '14:00');  -- Saturday

-- ============================================
-- TABLE: mentorship_blocked_slots
-- Manual overrides: specific dates/periods unavailable
-- ============================================
CREATE TABLE mentorship_blocked_slots (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  block_date  date NOT NULL,
  start_time  time,           -- null = entire day blocked
  end_time    time,           -- null = entire day blocked
  reason      text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_blocked_date ON mentorship_blocked_slots (block_date);

-- ============================================
-- TABLE: mentorship_bookings
-- Core booking + payment record
-- ============================================
CREATE TABLE mentorship_bookings (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Student info (filled by pre-session form)
  student_name        text NOT NULL,
  student_email       text NOT NULL,
  student_situation   text NOT NULL,
  student_goal        text NOT NULL,
  academic_stage      text,
  is_minor            boolean NOT NULL DEFAULT false,
  guardian_email      text,
  guardian_consent    boolean NOT NULL DEFAULT false,

  -- Slot info (UTC)
  slot_start          timestamptz NOT NULL,
  slot_end            timestamptz NOT NULL,

  -- Reservation
  reserved_at         timestamptz,
  reservation_expires timestamptz,

  -- Currency + pricing
  currency            text NOT NULL CHECK (currency IN ('INR', 'USD')),
  amount_minor        integer NOT NULL,
    -- Amount in smallest unit: paise (INR) or cents (USD)
    -- INR 1699 => 169900, USD 20 => 2000

  -- Payment state
  payment_status      text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN (
      'pending',        -- form submitted, no order created
      'order_created',  -- Razorpay order created, awaiting payment
      'paid',           -- payment verified (signature check passed)
      'failed',         -- payment attempt failed
      'refunded'        -- refund processed
    )),
  razorpay_order_id   text,
  razorpay_payment_id text,
  razorpay_signature  text,

  -- Booking state
  booking_status      text NOT NULL DEFAULT 'pending'
    CHECK (booking_status IN (
      'pending',          -- form submitted
      'payment_pending',  -- slot reserved, awaiting payment
      'confirmed',        -- payment verified, session booked
      'cancelled',        -- cancelled by student or mentor
      'expired',          -- reservation expired (no payment)
      'completed',        -- session happened
      'no_show',          -- student did not attend
      'refunded'          -- cancelled + refund issued
    )),

  -- Post-session
  action_plan_sent    boolean NOT NULL DEFAULT false,
  meeting_link        text,

  -- Timestamps
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Prevent double-booking: no two confirmed/pending bookings for same slot
CREATE UNIQUE INDEX idx_booking_slot_active
  ON mentorship_bookings (slot_start)
  WHERE booking_status IN ('payment_pending', 'confirmed');

CREATE INDEX idx_booking_email ON mentorship_bookings (student_email);
CREATE INDEX idx_booking_status ON mentorship_bookings (booking_status);
CREATE INDEX idx_booking_payment ON mentorship_bookings (payment_status);
CREATE INDEX idx_booking_reservation_expires
  ON mentorship_bookings (reservation_expires)
  WHERE booking_status = 'payment_pending';

-- ============================================
-- TABLE: payment_events
-- Razorpay webhook idempotency
-- ============================================
CREATE TABLE payment_events (
  event_id     text PRIMARY KEY,  -- from x-razorpay-event-id header
  event_type   text NOT NULL,
  payload      jsonb NOT NULL,
  processed_at timestamptz DEFAULT now()
);

-- ============================================
-- TABLE: analytics_events
-- Basic tracking (if not already existing)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name   text NOT NULL,
  payload      jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now()
);


-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE mentorship_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Availability: anon can read active slots (frontend displays them)
CREATE POLICY "anon_read_availability"
  ON mentorship_availability FOR SELECT
  TO anon
  USING (is_active = true);

-- Blocked slots: anon can read (frontend needs to exclude them)
CREATE POLICY "anon_read_blocked"
  ON mentorship_blocked_slots FOR SELECT
  TO anon
  USING (true);

-- Bookings: anon can read slot_start/slot_end + booking_status
-- for determining which slots are taken (limited columns via select)
CREATE POLICY "anon_read_booked_slots"
  ON mentorship_bookings FOR SELECT
  TO anon
  USING (booking_status IN ('payment_pending', 'confirmed'));

-- Bookings: anon can INSERT (pre-session form creates the booking)
-- but payment/status fields have defaults and cannot be set by anon
CREATE POLICY "anon_insert_booking"
  ON mentorship_bookings FOR INSERT
  TO anon
  WITH CHECK (
    payment_status = 'pending'
    AND booking_status = 'pending'
  );

-- Bookings: anon can update to 'expired' only if it has actually expired
-- This is a nice-to-have allowing the client to self-cleanup, though RPC handles it mainly
CREATE POLICY "anon_update_booking_expired"
  ON mentorship_bookings FOR UPDATE
  TO anon
  USING (booking_status = 'payment_pending' AND reservation_expires < now())
  WITH CHECK (booking_status = 'expired');

-- Service role: full access (for Vercel serverless functions)
-- service_role bypasses RLS by default, so no policy needed.

-- Payment events: no anon access
-- (service_role only — no policy for anon means denied)

-- Analytics: anon can insert
CREATE POLICY "anon_insert_analytics"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);


-- ============================================
-- RPC: Atomic slot reservation
-- Called by server-side code to reserve a slot safely
-- ============================================
CREATE OR REPLACE FUNCTION reserve_mentorship_slot(
  p_booking_id     uuid,
  p_slot_start     timestamptz,
  p_slot_end       timestamptz,
  p_expire_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflict_count integer;
BEGIN
  -- First, expire any stale reservations
  UPDATE mentorship_bookings
  SET booking_status = 'expired',
      updated_at = now()
  WHERE booking_status = 'payment_pending'
    AND reservation_expires < now();

  -- Check for conflicts
  SELECT count(*) INTO v_conflict_count
  FROM mentorship_bookings
  WHERE slot_start = p_slot_start
    AND booking_status IN ('payment_pending', 'confirmed');

  IF v_conflict_count > 0 THEN
    RETURN false;  -- Slot already taken
  END IF;

  -- Reserve the slot
  UPDATE mentorship_bookings
  SET booking_status = 'payment_pending',
      reserved_at = now(),
      reservation_expires = now() + (p_expire_minutes || ' minutes')::interval,
      updated_at = now()
  WHERE id = p_booking_id
    AND booking_status = 'pending';

  RETURN FOUND;  -- true if the update matched a row
END;
$$;
