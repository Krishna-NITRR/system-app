-- ============================================
-- TABLE: mentorship_leads
-- Everyone who submits the /mentorship form, paid or not.
-- Written only by /api/mentorship-lead (service role); RLS blocks anon access.
-- Run once in the Supabase SQL editor.
-- ============================================
CREATE TABLE IF NOT EXISTS mentorship_leads (
  id                  uuid PRIMARY KEY,

  -- Furthest step reached: form submitted → slot picked → Pay clicked
  stage               text NOT NULL DEFAULT 'form'
    CHECK (stage IN ('form', 'slot', 'pay')),

  student_name        text NOT NULL,
  student_email       text NOT NULL,
  student_situation   text,   -- includes contact no., deadline, source and UTM notes
  student_goal        text,
  academic_stage      text,
  is_minor            boolean NOT NULL DEFAULT false,
  guardian_email      text,

  slot_start          timestamptz,
  slot_end            timestamptz,
  currency            text,
  booking_id          uuid,   -- set when Pay is clicked; join to mentorship_bookings

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON mentorship_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON mentorship_leads (student_email);

ALTER TABLE mentorship_leads ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role (server API) can read or write.

-- Unpaid leads to follow up, newest first
CREATE OR REPLACE VIEW mentorship_unpaid_leads AS
SELECT l.*
FROM mentorship_leads l
LEFT JOIN mentorship_bookings b
  ON b.id = l.booking_id AND b.booking_status = 'confirmed'
WHERE b.id IS NULL
ORDER BY l.created_at DESC;
