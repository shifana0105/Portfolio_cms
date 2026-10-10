import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Layout shell for login/register pages. Kept minimal and centered - no
// dashboard chrome, no public-portfolio chrome. An already-authenticated
// user is redirected away rather than shown the login form again.
//
// The card treatment (border/radius/shadow) lives here rather than being
// duplicated in Login.jsx and Register.jsx, since both pages share it.
export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12 text-charcoal sm:py-16">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-burgundy focus:text-cream focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <Link to="/" className="mb-8 font-display text-xl tracking-tight text-burgundy">
        Portfolio CMS
      </Link>

      <main id="main-content" className="w-full max-w-md">
        <div className="rounded-2xl border border-warm-gray bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
