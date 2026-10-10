import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-3xl text-burgundy mb-2">Not found</h1>
      <p className="text-charcoal/70 mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-sm text-burgundy underline underline-offset-4"
      >
        Back home
      </Link>
    </div>
  );
}
