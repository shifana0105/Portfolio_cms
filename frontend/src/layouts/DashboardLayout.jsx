import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { CloseIcon, MenuIcon } from '../components/icons';
import { getUnreadCount } from '../services/api/inbox';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/experience', label: 'Experience' },
  { to: '/education', label: 'Education' },
  { to: '/resume', label: 'Resume' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/analytics', label: 'Analytics' },
];

function NavLinks({ onNavigate, unreadCount }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-burgundy/10 text-burgundy'
                : 'text-charcoal/70 hover:bg-warm-gray/40 hover:text-charcoal'
            }`
          }
        >
          {item.label}
          {item.to === '/inbox' && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1.5 text-[0.6rem] font-semibold text-cream">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AccountFooter({ onNavigate }) {
  const { user, logout } = useAuth();

  function handleLogout() {
    onNavigate?.();
    logout();
  }

  return (
    <div className="mt-auto border-t border-warm-gray pt-4">
      <p className="truncate text-sm font-medium text-charcoal">{user?.fullName ?? 'Account'}</p>
      <p className="mb-3 truncate text-xs text-charcoal/50">{user?.email}</p>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-lg border border-warm-gray px-3 py-2 text-sm font-medium text-charcoal/80 transition-colors hover:border-burgundy hover:text-burgundy"
      >
        Log out
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Current page title from nav items
  const currentPage = navItems.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Dashboard';

  // Poll unread count on mount and on navigation
  useEffect(() => {
    let cancelled = false;
    getUnreadCount()
      .then((count) => { if (!cancelled) setUnreadCount(count); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-cream text-charcoal">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-burgundy focus:text-cream focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-warm-gray md:bg-white/40 md:px-4 md:py-6"
        aria-label="Dashboard navigation"
      >
        <span className="mb-8 px-1 font-display text-lg text-burgundy">Portfolio CMS</span>
        <NavLinks unreadCount={unreadCount} />
        <AccountFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-warm-gray px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-warm-gray/40 md:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-charcoal/70">{currentPage}</span>
          <span className="hidden w-11 md:block" aria-hidden="true" />
        </header>

        <main id="main-content" className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-charcoal/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard navigation"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-cream px-4 py-6 shadow-lg md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="mb-8 flex items-center justify-between px-1">
                <span className="font-display text-lg text-burgundy">Portfolio CMS</span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-charcoal transition-colors hover:bg-warm-gray/40"
                  aria-label="Close navigation menu"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
              <NavLinks onNavigate={() => setIsDrawerOpen(false)} unreadCount={unreadCount} />
              <AccountFooter onNavigate={() => setIsDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
