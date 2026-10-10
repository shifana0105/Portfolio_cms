import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../services/api/experience';
import { parseApiError } from '../utils/apiError';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

const emptyExp = { company: '', jobTitle: '', location: '', employmentType: '', startDate: '', endDate: '', currentlyWorking: false, description: '', displayOrder: 0 };
const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

export default function ExperiencePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyExp);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = () => { getExperiences().then(setItems).catch(() => setError('Failed to load')); };

  useEffect(() => {
    let cancelled = false;
    getExperiences()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setError('Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function openAdd() { setForm(emptyExp); setEditing(null); setFormError(''); setFieldErrors({}); setModalOpen(true); }
  function openEdit(item) { setForm({ company: item.company, jobTitle: item.jobTitle, location: item.location || '', employmentType: item.employmentType || '', startDate: item.startDate || '', endDate: item.endDate || '', currentlyWorking: item.currentlyWorking, description: item.description || '', displayOrder: item.displayOrder }); setEditing(item); setFormError(''); setModalOpen(true); }
  function handleChange(e) { const { name, value, type, checked } = e.target; setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFieldErrors({}); setSaving(true);
    const payload = { ...form, endDate: form.currentlyWorking ? null : form.endDate || null };
    try {
      if (editing) await updateExperience(editing.id, payload);
      else await createExperience(payload);
      setModalOpen(false); reload();
    } catch (err) { const { message, fieldErrors: fe } = parseApiError(err); setFormError(message); setFieldErrors(fe); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteExperience(deleteTarget.id); setDeleteTarget(null); reload(); }
    catch { setError('Failed to delete'); setDeleteTarget(null); }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-charcoal">Experience</h1><p className="text-sm text-charcoal/60">Add your professional experience.</p></div>
        <button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">Add experience</button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}

      {items.length === 0 ? (
        <EmptyState title="No experience yet" description="Add your work experience to showcase your career." action={<button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream">Add experience</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-warm-gray" aria-hidden="true" />
          {items.map((item) => (
            <motion.div key={item.id} variants={staggerItem} className="relative pl-10 pb-6">
              <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-burgundy bg-cream" />
              <div className="rounded-2xl border border-warm-gray bg-white/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-charcoal">{item.jobTitle}</h3>
                    <p className="text-sm text-charcoal/70">{item.company}{item.location ? ` · ${item.location}` : ''}</p>
                    <p className="text-xs text-charcoal/50">{item.startDate} — {item.currentlyWorking ? 'Present' : item.endDate}{item.employmentType ? ` · ${item.employmentType}` : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="rounded-lg border border-warm-gray px-3 py-1 text-xs font-medium text-charcoal/70 hover:text-burgundy">Edit</button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-warm-gray px-3 py-1 text-xs font-medium text-rosewood/70 hover:text-rosewood">Delete</button>
                  </div>
                </div>
                {item.description && <p className="mt-2 text-sm text-charcoal/60">{item.description}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Experience' : 'Add Experience'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="jobTitle" label="Job Title" value={form.jobTitle} onChange={handleChange} error={fieldErrors.jobTitle} />
            <FormField id="company" label="Company" value={form.company} onChange={handleChange} error={fieldErrors.company} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="location" label="Location" value={form.location} onChange={handleChange} required={false} />
            <div className="mb-5">
              <label htmlFor="employmentType" className="mb-1.5 block text-sm font-medium text-charcoal">Type</label>
              <select id="employmentType" name="employmentType" value={form.employmentType} onChange={handleChange}
                className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm outline-none focus:border-burgundy">
                <option value="">Select type</option>
                {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="startDate" label="Start Date" type="date" value={form.startDate} onChange={handleChange} error={fieldErrors.startDate} />
            {!form.currentlyWorking && <FormField id="endDate" label="End Date" type="date" value={form.endDate} onChange={handleChange} required={false} />}
          </div>
          <div className="mb-5 flex items-center gap-3">
            <input type="checkbox" id="currentlyWorking" name="currentlyWorking" checked={form.currentlyWorking} onChange={handleChange} className="h-4 w-4 accent-burgundy" />
            <label htmlFor="currentlyWorking" className="text-sm text-charcoal/80">Currently working here</label>
          </div>
          <div className="mb-5">
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-charcoal">Description</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange}
              className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm outline-none focus:border-burgundy" />
          </div>
          {formError && <p role="alert" className="mb-4 text-sm text-rosewood">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete experience" message={`Delete "${deleteTarget?.jobTitle} at ${deleteTarget?.company}"?`} />
    </motion.div>
  );
}
