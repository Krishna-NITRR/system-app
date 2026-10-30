// Funnel events for /mentorship. Sends to GA4 (gtag) and/or Plausible when
// either script is installed; a no-op otherwise, so it is safe to call anywhere.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export type MentorshipEvent =
  | 'view_mentorship'
  | 'click_book'
  | 'form_start'
  | 'form_complete'
  | 'slot_selected'
  | 'pay_click'
  | 'payment_success'
  | 'optin_submit';

export function track(event: MentorshipEvent, params: Record<string, string> = {}) {
  try {
    window.gtag?.('event', event, params);
    window.plausible?.(event, { props: params });
  } catch {
    // Analytics must never break the booking flow
  }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const UTM_STORAGE_KEY = 'km_utm';

// Captures UTM params from the landing URL and keeps them for the session,
// so a booking made after navigating around is still attributed.
export function captureUtm(): Record<string, string> {
  const fromUrl: Record<string, string> = {};
  const search = new URLSearchParams(window.location.search);
  UTM_KEYS.forEach(k => {
    const v = search.get(k);
    if (v) fromUrl[k] = v;
  });

  try {
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return fromUrl;
  }
}
