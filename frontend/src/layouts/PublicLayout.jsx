import { Link, Outlet } from 'react-router-dom';

// Public-facing layout for the landing page and the future /p/{username}
// portfolio page. Kept visually distinct from the dashboard shell - no
// admin chrome. Section components for the public portfolio itself (Hero,
// About, Skills, etc.) are added in a later phase; this header is shared
// chrome for whatever public routes exist.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-charcoal">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-burgundy focus:text-cream focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <header className="border-b border-warm-gray/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="font-display text-lg tracking-tight text-burgundy">
            Portfolio CMS
          </Link>
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal/80 transition-colors hover:text-burgundy"
          >
            Log in
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
