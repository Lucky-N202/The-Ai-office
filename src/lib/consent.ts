export type ConsentStatus = "granted" | "denied";

const STORAGE_KEY = "cookie-consent";
export const CONSENT_REOPEN_EVENT = "cookie-consent-reopen";
const CONSENT_CHANGE_EVENT = "cookie-consent-change";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** null means no choice has been made yet — show the banner. */
export function getStoredConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

/**
 * Records the choice and, critically, tells Google's Consent Mode about it
 * so AdSense/Analytics actually stop setting ad/analytics cookies when
 * denied — not just a banner that disappears while tracking continues
 * underneath. See AdSenseScript for where the *default* (denied) is set,
 * before this ever runs.
 */
export function setStoredConsent(status: ConsentStatus) {
  localStorage.setItem(STORAGE_KEY, status);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: status }));

  window.gtag?.("consent", "update", {
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
    analytics_storage: status,
  });
}
