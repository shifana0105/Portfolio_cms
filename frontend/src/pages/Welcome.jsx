import { motion } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

// Real empty-state workspace, not a status board. Every action here is a
// disabled preview of where Phase 2/3 content management will live -
// Profile, Projects, Skills, Experience, Education, and resume upload
// don't exist yet, so their buttons are genuinely disabled rather than
// linking to routes/pages that don't exist. This communicates the state
// of the USER's portfolio (empty, not yet public) rather than the
// development status of the software.
const workspaceItems = [
  { title: 'Projects', description: 'Showcase the work you want recruiters to see.', action: 'Add project' },
  { title: 'Skills', description: 'Highlight your technical strengths.', action: 'Add skill' },
  { title: 'Experience', description: 'Add your professional experience.', action: 'Add experience' },
  { title: 'Education', description: 'Add your education.', action: 'Add education' },
];

const quickActions = ['Add project', 'Edit profile', 'Upload resume'];

function DisabledActionButton({ children, className = '' }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="Available once this section is built"
      className={`cursor-not-allowed rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/40 ${className}`}
    >
      {children}
    </button>
  );
}

export default function Welcome() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-4xl">
      <p className="mb-1 text-sm font-medium text-charcoal/50">Welcome back, {firstName}</p>
      <h1 className="mb-1.5 text-2xl font-semibold text-charcoal sm:text-3xl">Dashboard</h1>
      <p className="mb-8 text-sm text-charcoal/60">
        Build and manage your professional portfolio from one place.
      </p>

      {/* Portfolio status / onboarding */}
      <div className="mb-10 rounded-2xl border border-warm-gray bg-white/60 p-6">
        <h2 className="mb-1 text-sm font-semibold text-charcoal">Your portfolio isn&rsquo;t public yet</h2>
        <p className="mb-4 text-sm text-charcoal/60">
          Complete your profile to start building your public portfolio.
        </p>
        <DisabledActionButton className="bg-burgundy/5 !text-burgundy/50 !border-burgundy/20">
          Complete profile
        </DisabledActionButton>
      </div>

      {/* Workspace */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Workspace</h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {workspaceItems.map((item) => (
          <motion.div
            key={item.title}
            variants={staggerItem}
            className="rounded-2xl border border-warm-gray bg-white/60 p-5"
          >
            <h3 className="mb-1 text-sm font-semibold text-charcoal">{item.title}</h3>
            <p className="mb-4 text-sm text-charcoal/60">{item.description}</p>
            <DisabledActionButton>{item.action}</DisabledActionButton>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Quick actions</h2>
      <div className="mb-10 flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <DisabledActionButton key={action}>{action}</DisabledActionButton>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">Recent activity</h2>
      <div className="rounded-2xl border border-warm-gray bg-white/60 p-6 text-sm text-charcoal/50">
        No activity yet.
      </div>
    </motion.div>
  );
}
