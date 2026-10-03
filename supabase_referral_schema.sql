-- ============================================
-- REFERRAL SYSTEM SCHEMA
-- Exclusive invite-based mentorship referral
-- ============================================

-- ============================================
-- TABLE: referrers
-- Approved community members who can send invitations
-- ============================================
CREATE TABLE referrers (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text NOT NULL,
  email             text NOT NULL UNIQUE,
  tier              text NOT NULL DEFAULT 'member'
    CHECK (tier IN ('member', 'trusted', 'core')),
  status            text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended', 'revoked')),
  access_token_hash text NOT NULL,
  invite_limit      integer NOT NULL DEFAULT 3,
  invites_used      integer NOT NULL DEFAULT 0,
  invites_reset_at  timestamptz,
  approved_at       timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_referrers_email ON referrers (email);
CREATE INDEX idx_referrers_status ON referrers (status);
CREATE INDEX idx_referrers_token_hash ON referrers (access_token_hash);

-- ============================================
-- TABLE: referral_codes
-- Unique invitation codes linked to referrers
-- ============================================
CREATE TABLE referral_codes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES referrers(id) ON DELETE CASCADE,
  code        text UNIQUE NOT NULL,
  status      text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'revoked')),
  valid_from  timestamptz DEFAULT now(),
  valid_until timestamptz,
  max_uses    integer,
  uses_count  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_codes_referrer ON referral_codes (referrer_id);
CREATE INDEX idx_codes_code ON referral_codes (code);
CREATE INDEX idx_codes_status ON referral_codes (status);

-- ============================================
-- TABLE: referral_applications
-- Applications submitted through referral links
-- ============================================
CREATE TABLE referral_applications (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id   uuid NOT NULL REFERENCES referral_codes(id),
  referrer_id        uuid NOT NULL REFERENCES referrers(id),
  applicant_name     text NOT NULL,
  applicant_email    text NOT NULL,
  college            text,
  year               text,
  research_interests text,
  current_stage      text,
  motivation         text,
  linkedin           text,
  status             text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  submitted_at       timestamptz DEFAULT now(),
  reviewed_at        timestamptz,
  reviewed_by        text,
  review_notes       text
);

-- Prevent duplicate active applications from the same email
CREATE UNIQUE INDEX idx_applications_unique_email
  ON referral_applications (applicant_email)
  WHERE status IN ('pending', 'accepted');

CREATE INDEX idx_applications_referrer ON referral_applications (referrer_id);
CREATE INDEX idx_applications_code ON referral_applications (referral_code_id);
CREATE INDEX idx_applications_status ON referral_applications (status);
CREATE INDEX idx_applications_email ON referral_applications (applicant_email);

-- ============================================
-- TABLE: referral_rewards
-- Credits/rewards tracked per referrer
-- ============================================
CREATE TABLE referral_rewards (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id    uuid NOT NULL REFERENCES referrers(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES referral_applications(id),
  reward_type    text,
  amount         numeric,
  status         text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'credited', 'cancelled')),
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_rewards_referrer ON referral_rewards (referrer_id);
CREATE INDEX idx_rewards_status ON referral_rewards (status);

-- ============================================
-- TABLE: referral_events
-- Audit log for anti-abuse and analytics
-- ============================================
CREATE TABLE referral_events (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type       text NOT NULL,
  referrer_id      uuid,
  referral_code_id uuid,
  application_id   uuid,
  ip_hash          text,
  user_agent       text,
  metadata         jsonb DEFAULT '{}'::jsonb,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_events_type ON referral_events (event_type);
CREATE INDEX idx_events_referrer ON referral_events (referrer_id);
CREATE INDEX idx_events_created ON referral_events (created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Public: no direct access to referrers table
-- All referrer data is accessed through API endpoints

-- Public: can read active referral codes (limited info via API)
CREATE POLICY "anon_read_active_codes"
  ON referral_codes FOR SELECT
  TO anon
  USING (status = 'active');

-- Public: can insert applications (via API with server-side validation)
CREATE POLICY "anon_insert_applications"
  ON referral_applications FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

-- Public: can insert audit events
CREATE POLICY "anon_insert_events"
  ON referral_events FOR INSERT
  TO anon
  WITH CHECK (true);

-- Service role: full access (bypasses RLS by default)
-- Used by Vercel serverless functions

-- ============================================
-- RPC: Atomic invite generation
-- Checks limit and increments invites_used in one step
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_invite(
  p_referrer_id    uuid,
  p_code           text,
  p_valid_until    timestamptz DEFAULT NULL,
  p_max_uses       integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer   referrers%ROWTYPE;
  v_now        timestamptz := now();
BEGIN
  -- Lock the referrer row to prevent race conditions
  SELECT * INTO v_referrer
  FROM referrers
  WHERE id = p_referrer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check referrer is approved
  IF v_referrer.status != 'approved' THEN
    RETURN false;
  END IF;

  -- Reset monthly invites if needed
  IF v_referrer.invites_reset_at IS NOT NULL AND v_referrer.invites_reset_at <= v_now THEN
    UPDATE referrers
    SET invites_used = 0,
        invites_reset_at = v_now + INTERVAL '1 month',
        updated_at = v_now
    WHERE id = p_referrer_id;

    v_referrer.invites_used := 0;
  END IF;

  -- Check invite limit
  IF v_referrer.invites_used >= v_referrer.invite_limit THEN
    RETURN false;
  END IF;

  -- Create the referral code
  INSERT INTO referral_codes (referrer_id, code, status, valid_from, valid_until, max_uses)
  VALUES (p_referrer_id, p_code, 'active', v_now, p_valid_until, p_max_uses);

  -- Increment invite usage
  UPDATE referrers
  SET invites_used = invites_used + 1,
      updated_at = v_now
  WHERE id = p_referrer_id;

  RETURN true;
END;
$$;

-- ============================================
-- RPC: Submit referral application atomically
-- Validates code, checks duplicates, creates application, increments usage
-- ============================================
CREATE OR REPLACE FUNCTION submit_referral_application(
  p_code              text,
  p_applicant_name    text,
  p_applicant_email   text,
  p_college           text DEFAULT NULL,
  p_year              text DEFAULT NULL,
  p_research_interests text DEFAULT NULL,
  p_current_stage     text DEFAULT NULL,
  p_motivation        text DEFAULT NULL,
  p_linkedin          text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code       referral_codes%ROWTYPE;
  v_referrer   referrers%ROWTYPE;
  v_app_id     uuid;
  v_now        timestamptz := now();
  v_email      text;
BEGIN
  -- Normalize email
  v_email := lower(trim(p_applicant_email));

  -- Find and lock the code
  SELECT * INTO v_code
  FROM referral_codes
  WHERE code = p_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_CODE');
  END IF;

  IF v_code.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CODE_INACTIVE');
  END IF;

  IF v_code.valid_until IS NOT NULL AND v_code.valid_until < v_now THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CODE_EXPIRED');
  END IF;

  IF v_code.max_uses IS NOT NULL AND v_code.uses_count >= v_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CODE_EXHAUSTED');
  END IF;

  -- Check referrer
  SELECT * INTO v_referrer
  FROM referrers
  WHERE id = v_code.referrer_id
  FOR UPDATE;

  IF NOT FOUND OR v_referrer.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'REFERRER_INACTIVE');
  END IF;

  -- Check duplicate application
  IF EXISTS (
    SELECT 1 FROM referral_applications
    WHERE applicant_email = v_email
    AND status IN ('pending', 'accepted')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'DUPLICATE_APPLICATION');
  END IF;

  -- Create application
  v_app_id := gen_random_uuid();
  INSERT INTO referral_applications (
    id, referral_code_id, referrer_id,
    applicant_name, applicant_email, college, year,
    research_interests, current_stage, motivation, linkedin,
    status, submitted_at
  ) VALUES (
    v_app_id, v_code.id, v_referrer.id,
    trim(p_applicant_name), v_email, p_college, p_year,
    p_research_interests, p_current_stage, p_motivation, p_linkedin,
    'pending', v_now
  );

  -- Increment code usage
  UPDATE referral_codes
  SET uses_count = uses_count + 1
  WHERE id = v_code.id;

  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_app_id::text
  );
END;
$$;
