export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} animate-spin rounded-full border-2 border-warm-gray border-t-burgundy`} role="status">
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
