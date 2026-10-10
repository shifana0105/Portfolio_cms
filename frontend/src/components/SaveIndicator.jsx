export default function SaveIndicator({ status }) {
  if (!status) return null;

  const styles = {
    saving: 'text-muted-gold',
    saved: 'text-sage',
    error: 'text-rosewood',
  };

  const labels = {
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed',
  };

  return (
    <span className={`text-xs font-medium ${styles[status] || ''}`} role="status" aria-live="polite">
      {labels[status] || ''}
    </span>
  );
}
