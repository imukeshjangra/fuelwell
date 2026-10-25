/** Re-runs on every navigation: pages ease in instead of snapping. */
export default function Template({ children }: { children: React.ReactNode }) { return <div className="animate-page-in">{children}</div>; }
