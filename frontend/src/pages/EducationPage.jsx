import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEducation, createEducation, updateEducation, deleteEducation } from '../services/api/education';
import { parseApiError } from '../utils/apiError';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

const emptyEdu = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '', description: '', displayOrder: 0 };

export default function EducationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEdu);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = () => { getEducation().then(setItems).catch(() => setError('Failed to load')); };

  useEffect(() => {
    let cancelled = false;
    getEducation()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch(() => { if (!cancelled) setError('Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function openAdd() { setForm(emptyEdu); setEditing(null); setFormError(''); setFieldErrors({}); setModalOpen(true); }
  function openEdit(item) { setForm({ institution: item.institution, degree: item.degree, fieldOfStudy: item.fieldOfStudy || '', startDate: item.startDate || '', endDate: item.endDate || '', grade: item.grade || '', description: item.description || '', displayOrder: item.displayOrder }); setEditing(item); setFormError(''); setModalOpen(true); }
  function handleChange(e) { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFieldErrors({}); setSaving(true);
    try {
      if (editing) await updateEducation(editing.id, form);
      else await createEducation(form);
      setModalOpen(false); reload();
    } catch (err) { const { message, fieldErrors: fe } = parseApiError(err); setFormError(message); setFieldErrors(fe); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteEducation(deleteTarget.id); setDeleteTarget(null); reload(); }
    catch { setError('Failed to delete'); setDeleteTarget(null); }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-charcoal">Education</h1><p className="text-sm text-charcoal/60">Add your education background.</p></div>
        <button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">Add education</button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}

      {items.length === 0 ? (
        <EmptyState title="No education yet" description="Add your education to complete your portfolio." action={<button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream">Add education</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {items.map((item) => (
            <motion.div key={item.id} variants={staggerItem} className="rounded-2xl border border-warm-gray bg-white/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">{item.degree}{item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ''}</h3>
                  <p className="text-sm text-charcoal/70">{item.institution}</p>
                  <p className="text-xs text-charcoal/50">{item.startDate} — {item.endDate || 'Present'}{item.grade ? ` · GPA: ${item.grade}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="rounded-lg border border-warm-gray px-3 py-1 text-xs font-medium text-charcoal/70 hover:text-burgundy">Edit</button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-warm-gray px-3 py-1 text-xs font-medium text-rosewood/70 hover:text-rosewood">Delete</button>
                </div>
              </div>
              {item.description && <p className="mt-2 text-sm text-charcoal/60">{item.description}</p>}
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Education' : 'Add Education'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="institution" label="Institution" value={form.institution} onChange={handleChange} error={fieldErrors.institution} />
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="degree" label="Degree" value={form.degree} onChange={handleChange} error={fieldErrors.degree} />
            <FormField id="fieldOfStudy" label="Field of Study" value={form.fieldOfStudy} onChange={handleChange} required={false} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="startDate" label="Start Date" type="date" value={form.startDate} onChange={handleChange} error={fieldErrors.startDate} />
            <FormField id="endDate" label="End Date" type="date" value={form.endDate} onChange={handleChange} required={false} />
          </div>
          <FormField id="grade" label="Grade / GPA" value={form.grade} onChange={handleChange} required={false} />
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
      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete education" message={`Delete "${deleteTarget?.degree} at ${deleteTarget?.institution}"?`} />
    </motion.div>
  );
}
