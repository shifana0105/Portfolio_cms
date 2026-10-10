import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getDashboard } from '../services/api/dashboard';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setError('Failed to load dashboard'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (error) return <p className="py-12 text-center text-sm text-rosewood">{error}</p>;

  const { portfolioCompletion, healthScore, totalViews, recentViews, projectCount, skillCount, experienceCount, educationCount, unreadMessages, hasResume, recentActivity, improvements, profile } = data;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-5xl">
      <p className="mb-1 text-sm font-medium text-charcoal/50">Welcome back, {firstName}</p>
      <h1 className="mb-1.5 text-2xl font-semibold text-charcoal sm:text-3xl">Dashboard</h1>
      <p className="mb-8 text-sm text-charcoal/60">Build and manage your professional portfolio from one place.</p>

      {/* Portfolio Status */}
      <div className="mb-8 rounded-2xl border border-warm-gray bg-white/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-1 text-sm font-semibold text-charcoal">
              {profile?.isPublic ? 'Your portfolio is live' : "Your portfolio isn\u2019t public yet"}
            </h2>
            <p className="text-sm text-charcoal/60">
              {profile ? (profile.isPublic ? `Visible at /p/${profile.username}` : 'Set your profile to public to share it.') : 'Complete your profile to start building your public portfolio.'}
            </p>
          </div>
          <Link to="/profile" className="shrink-0 rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">
            {profile ? 'Edit profile' : 'Complete profile'}
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Completion', value: `${portfolioCompletion}%`, color: portfolioCompletion >= 80 ? 'text-sage' : 'text-muted-gold' },
          { label: 'Health Score', value: `${healthScore?.score ?? 0}`, sub: healthScore?.rating, color: (healthScore?.score ?? 0) >= 70 ? 'text-sage' : 'text-muted-gold' },
          { label: 'Portfolio Views', value: totalViews, sub: `${recentViews} this week` },
          { label: 'Messages', value: unreadMessages, sub: 'unread', link: '/inbox' },
        ].map((metric) => (
          <motion.div key={metric.label} variants={staggerItem} className="rounded-2xl border border-warm-gray bg-white/60 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-charcoal/50">{metric.label}</p>
            <p className={`text-2xl font-semibold ${metric.color || 'text-charcoal'}`}>{metric.value}</p>
            {metric.sub && <p className="mt-0.5 text-xs text-charcoal/50">{metric.sub}</p>}
            {metric.link && <Link to={metric.link} className="text-xs text-burgundy underline underline-offset-2">View</Link>}
          </motion.div>
        ))}
      </motion.div>

      {/* Workspace & Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Workspace</h2>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: 'Projects', count: projectCount, to: '/projects', action: 'Manage' },
              { title: 'Skills', count: skillCount, to: '/skills', action: 'Manage' },
              { title: 'Experience', count: experienceCount, to: '/experience', action: 'Manage' },
              { title: 'Education', count: educationCount, to: '/education', action: 'Manage' },
            ].map((item) => (
              <motion.div key={item.title} variants={staggerItem} className="flex items-center justify-between rounded-2xl border border-warm-gray bg-white/60 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">{item.title}</h3>
                  <p className="text-xs text-charcoal/50">{item.count} {item.count === 1 ? 'item' : 'items'}</p>
                </div>
                <Link to={item.to} className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">
                  {item.action}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Add project', to: '/projects' },
              { label: 'Edit profile', to: '/profile' },
              { label: hasResume ? 'Replace resume' : 'Upload resume', to: '/resume' },
              { label: 'View inbox', to: '/inbox' },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="rounded-lg border border-warm-gray bg-white/60 px-4 py-2.5 text-sm font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Improvements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Recent Activity</h2>
          <div className="rounded-2xl border border-warm-gray bg-white/60 p-5">
            {recentActivity?.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/50" />
                    <div>
                      <p className="text-charcoal/80">{item.description}</p>
                      <p className="text-xs text-charcoal/40">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal/50">No activity yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Suggested Improvements</h2>
          <div className="rounded-2xl border border-warm-gray bg-white/60 p-5">
            {improvements?.length > 0 ? (
              <ul className="space-y-2.5">
                {improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal/70">
                    <span className="mt-0.5 text-muted-gold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-sage font-medium">Your portfolio is looking great!</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
