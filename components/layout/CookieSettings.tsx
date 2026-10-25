'use client';
export default function CookieSettings() {
  return <button onClick={() => { localStorage.removeItem('fw_consent'); window.dispatchEvent(new Event('fw-consent-reset')); }} className="hover:text-tang">Cookie settings</button>;
}
