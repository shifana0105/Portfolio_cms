export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-warm-gray bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mb-4 text-charcoal/25">{icon}</div>}
      <h3 className="mb-1.5 text-base font-semibold text-charcoal">{title}</h3>
      <p className="mb-5 max-w-sm text-sm text-charcoal/60">{description}</p>
      {action}
    </div>
  );
}
