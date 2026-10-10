import { AnimatePresence, motion } from 'framer-motion';
import { modalTransition } from '../motion/variants';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-charcoal/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              variants={modalTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-warm-gray p-6 shadow-lg sm:p-8`}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal/50 transition-colors hover:bg-warm-gray/40 hover:text-charcoal"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
