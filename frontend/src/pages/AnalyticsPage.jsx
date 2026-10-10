import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { getAnalytics } from '../services/api/dashboard';
import { getProfile } from '../services/api/profile';
import LoadingSpinner from '../components/LoadingSpinner';
import { fadeSlideUp } from '../motion/variants';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAnalytics().catch(() => null),
      getProfile().catch(() => null),
    ]).then(([a, p]) => {
      if (!cancelled) {
        setAnalytics(a);
        setProfile(p);
        if (p?.username) {
          const targetUrl = `${window.location.origin}/p/${p.username}`;
          QRCode.toDataURL(targetUrl, { width: 200, margin: 2 })
            .then(url => { if (!cancelled) setQrDataUrl(url); })
            .catch(() => {});
        }
      }
    }).catch(() => { if (!cancelled) setError('Failed to load analytics'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (error) return <p className="py-12 text-center text-sm text-rosewood">{error}</p>;

  const publicUrl = profile?.username ? `${window.location.origin}/p/${profile.username}` : null;

  // Simple bar chart via CSS widths
  const maxViews = analytics?.viewsByDate?.length
    ? Math.max(...analytics.viewsByDate.map((d) => d.views), 1)
    : 1;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-4xl">
      <h1 className="mb-1.5 text-2xl font-semibold text-charcoal">Analytics & Sharing</h1>
      <p className="mb-8 text-sm text-charcoal/60">Track your portfolio traffic and share your custom QR code.</p>

      {/* Public portfolio link + QR code card */}
      {publicUrl && profile?.isPublic && (
        <div className="mb-8 rounded-2xl border border-warm-gray bg-white/60 p-6 shadow-xs">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-base font-semibold text-charcoal">Public Portfolio & Sharing QR Code</h2>
              <p className="mb-3 text-sm text-charcoal/60">Share this link or QR code with recruiters, clients, and your professional network.</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                  className="break-all text-sm font-medium text-burgundy underline underline-offset-2">{publicUrl}</a>
                <button type="button" onClick={() => { navigator.clipboard.writeText(publicUrl); }}
                  className="rounded-lg border border-warm-gray bg-white px-3 py-1.5 text-xs font-medium text-charcoal/80 shadow-xs transition-colors hover:border-burgundy hover:text-burgundy">
                  Copy link
                </button>
              </div>
            </div>
            {qrDataUrl && (
              <div className="flex flex-col items-center rounded-xl border border-warm-gray/60 bg-white p-3.5 shadow-xs">
                <img src={qrDataUrl} alt="Portfolio QR Code" className="h-32 w-32 object-contain" />
                <a href={qrDataUrl} download={`${profile.username}-portfolio-qr.png`}
                  className="mt-2 text-xs font-medium text-burgundy hover:underline">
                  Download QR Code
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total Views" value={analytics?.totalViews ?? 0} />
        <MetricCard label="Last 7 Days" value={analytics?.last7DaysViews ?? 0} />
        <MetricCard label="Last 30 Days" value={analytics?.last30DaysViews ?? 0} />
      </div>

      {/* Views chart */}
      <div className="rounded-2xl border border-warm-gray bg-white/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-charcoal">Views Over Time (Last 30 Days)</h2>
        {analytics?.viewsByDate?.length > 0 ? (
          <div className="space-y-2">
            {analytics.viewsByDate.map((entry) => (
              <div key={entry.date} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-charcoal/50">
                  {new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1">
                  <div
                    className="h-6 rounded-md bg-burgundy/20 transition-all"
                    style={{ width: `${Math.max((entry.views / maxViews) * 100, 4)}%` }}
                  >
                    <span className="flex h-full items-center px-2 text-[0.6rem] font-medium text-burgundy">
                      {entry.views}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal/50">No views yet. Share your portfolio to start tracking visits.</p>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-warm-gray bg-white/60 p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</p>
      <p className="text-2xl font-semibold text-charcoal">{value}</p>
    </div>
  );
}
