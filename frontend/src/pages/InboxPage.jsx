import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getInbox, markAsRead, deleteMessage } from '../services/api/inbox';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = () => { getInbox().then(setMessages).catch(() => setError('Failed to load messages')); };

  useEffect(() => {
    let cancelled = false;
    getInbox()
      .then((data) => { if (!cancelled) setMessages(data); })
      .catch(() => { if (!cancelled) setError('Failed to load messages'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleSelect(msg) {
    setSelected(msg);
    if (!msg.isRead) {
      try { await markAsRead(msg.id); reload(); } catch {}
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteMessage(deleteTarget.id); setDeleteTarget(null); if (selected?.id === deleteTarget.id) setSelected(null); reload(); }
    catch { setError('Failed to delete'); setDeleteTarget(null); }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-4xl">
      <h1 className="mb-1.5 text-2xl font-semibold text-charcoal">Inbox</h1>
      <p className="mb-6 text-sm text-charcoal/60">Messages from your public portfolio contact form.</p>
      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}

      {messages.length === 0 ? (
        <EmptyState title="No messages yet" description="Messages from your public contact form will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Message list */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2 lg:col-span-2">
            {messages.map((msg) => (
              <motion.button key={msg.id} variants={staggerItem} type="button" onClick={() => handleSelect(msg)}
                className={`w-full rounded-xl border p-4 text-left transition-shadow hover:shadow-sm ${selected?.id === msg.id ? 'border-burgundy bg-burgundy/5' : 'border-warm-gray bg-white/60'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${msg.isRead ? 'text-charcoal/70' : 'text-charcoal'}`}>{msg.senderName}</span>
                  {!msg.isRead && <span className="h-2 w-2 rounded-full bg-burgundy" />}
                </div>
                <p className="mt-0.5 text-xs text-charcoal/50">{msg.senderEmail}</p>
                <p className="mt-1 text-sm text-charcoal/60 line-clamp-1">{msg.message}</p>
                <p className="mt-1 text-[0.65rem] text-charcoal/40">{new Date(msg.createdAt).toLocaleString()}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-2xl border border-warm-gray bg-white/60 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-charcoal">{selected.senderName}</h3>
                    <a href={`mailto:${selected.senderEmail}`} className="text-sm text-burgundy underline underline-offset-2">{selected.senderEmail}</a>
                    <p className="mt-1 text-xs text-charcoal/40">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(selected)}
                    className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-rosewood/70 hover:text-rosewood">Delete</button>
                </div>
                <div className="border-t border-warm-gray pt-4">
                  <p className="whitespace-pre-wrap text-sm text-charcoal/80 leading-relaxed">{selected.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-warm-gray bg-white/60">
                <p className="text-sm text-charcoal/40">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete message" message="Delete this message permanently?" />
    </motion.div>
  );
}
