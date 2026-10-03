// ─── Referral System Types ───────────────────────────────────────────

// ── Tier & Status Enums ──

export type ReferrerTier = 'member' | 'trusted' | 'core';
export type ReferrerStatus = 'pending' | 'approved' | 'suspended' | 'revoked';
export type CodeStatus = 'active' | 'expired' | 'revoked';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type RewardStatus = 'pending' | 'approved' | 'credited' | 'cancelled';

export const TIER_LIMITS: Record<ReferrerTier, number> = {
  member: 3,
  trusted: 5,
  core: 10,
};

// ── Database Models ──

export interface Referrer {
  id: string;
  name: string;
  email: string;
  tier: ReferrerTier;
  status: ReferrerStatus;
  access_token_hash: string;
  invite_limit: number;
  invites_used: number;
  invites_reset_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralCode {
  id: string;
  referrer_id: string;
  code: string;
  status: CodeStatus;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  uses_count: number;
  created_at: string;
}

export interface ReferralApplication {
  id: string;
  referral_code_id: string;
  referrer_id: string;
  applicant_name: string;
  applicant_email: string;
  college: string | null;
  year: string | null;
  research_interests: string | null;
  current_stage: string | null;
  motivation: string | null;
  status: ApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  application_id: string;
  reward_type: string | null;
  amount: number | null;
  status: RewardStatus;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  event_type: string;
  referrer_id: string | null;
  referral_code_id: string | null;
  application_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── API Request Types ──

export interface ValidateCodeResponse {
  success: true;
  data: {
    valid: true;
    referrer: { name: string };
    expiresAt: string | null;
    remainingUses: number | null;
  };
}

export interface ApplyRequest {
  code: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  researchInterests?: string;
  currentStage?: string;
  motivation?: string;
  linkedIn?: string;
}

export interface ApplyResponse {
  success: true;
  data: {
    applicationId: string;
    message: string;
  };
}

export interface InviteResponse {
  success: true;
  data: {
    code: string;
    inviteUrl: string;
    remainingInvites: number;
  };
}

// ── Dashboard Types ──

export interface DashboardStats {
  referrer: {
    name: string;
    tier: ReferrerTier;
    inviteLimit: number;
    invitesUsed: number;
    invitesRemaining: number;
    resetDate: string | null;
  };
  stats: {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    totalRewards: number;
  };
  applications: DashboardApplication[];
  codes: DashboardCode[];
}

export interface DashboardApplication {
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  submittedAt: string;
  code: string;
}

export interface DashboardCode {
  code: string;
  status: CodeStatus;
  usesCount: number;
  maxUses: number | null;
  validUntil: string | null;
  createdAt: string;
}

// ── Admin Types ──

export interface AdminStats {
  totalReferrers: number;
  activeReferrers: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  acceptanceRate: number;
  inviteToApplicationRate: number;
  applicationToAcceptanceRate: number;
  applicationsByTier: Record<ReferrerTier, number>;
}

export interface AdminReferrerRow {
  id: string;
  name: string;
  email: string;
  tier: ReferrerTier;
  status: ReferrerStatus;
  inviteLimit: number;
  invitesUsed: number;
  acceptedCount: number;
  createdAt: string;
}

export interface AdminApplicationRow {
  id: string;
  applicantName: string;
  applicantEmail: string;
  college: string | null;
  year: string | null;
  researchInterests: string | null;
  currentStage: string | null;
  motivation: string | null;
  linkedIn: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  referrerName: string;
  code: string;
  reviewNotes: string | null;
}

export interface AdminCodeRow {
  id: string;
  code: string;
  referrerName: string;
  status: CodeStatus;
  usesCount: number;
  maxUses: number | null;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

// ── API Error ──

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = T | ApiError;
