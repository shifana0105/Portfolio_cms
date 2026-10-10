import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', isDestructive = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="mb-6 text-sm text-charcoal/70">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-charcoal/30"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-cream transition-colors ${
            isDestructive ? 'bg-rosewood hover:bg-rosewood/90' : 'bg-burgundy hover:bg-burgundy/90'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
