import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../services/api/skills';
import { parseApiError } from '../utils/apiError';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Tools', 'Languages', 'Other'];
const proficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const emptySkill = { name: '', category: '', proficiency: '', displayOrder: 0 };

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState(emptySkill);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refreshSkills = () => {
    getSkills().then(setSkills).catch(() => setError('Failed to load skills'));
  };

  useEffect(() => {
    let cancelled = false;
    getSkills()
      .then((data) => { if (!cancelled) setSkills(data); })
      .catch(() => { if (!cancelled) setError('Failed to load skills'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function openAdd() { setForm(emptySkill); setEditingSkill(null); setFormError(''); setFieldErrors({}); setModalOpen(true); }
  function openEdit(s) { setForm({ name: s.name, category: s.category || '', proficiency: s.proficiency || '', displayOrder: s.displayOrder }); setEditingSkill(s); setFormError(''); setModalOpen(true); }
  function handleChange(e) { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFieldErrors({}); setSaving(true);
    try {
      if (editingSkill) await updateSkill(editingSkill.id, form);
      else await createSkill(form);
      setModalOpen(false); refreshSkills();
    } catch (err) { const { message, fieldErrors: fe } = parseApiError(err); setFormError(message); setFieldErrors(fe); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteSkill(deleteTarget.id); setDeleteTarget(null); refreshSkills(); }
    catch { setError('Failed to delete skill'); setDeleteTarget(null); }
  }

  // Group by category
  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  // Proficiency breakdown for visualization
  const proficiencyWeights = { Expert: 100, Advanced: 75, Intermediate: 50, Beginner: 25 };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-charcoal">Skills</h1><p className="text-sm text-charcoal/60">Highlight your technical strengths and expertise level.</p></div>
        <button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">Add skill</button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}

      {/* Real Skills Proficiency Visualization Card */}
      {skills.length > 0 && (
        <div className="mb-8 rounded-2xl border border-warm-gray bg-white/60 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal/60">Skills Breakdown & Proficiency</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {skills.map((s) => {
              const pct = proficiencyWeights[s.proficiency] || 60;
              return (
                <div key={s.id} className="rounded-xl border border-warm-gray/60 bg-white/80 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">{s.name}</span>
                    <span className="text-xs font-medium text-burgundy">{s.proficiency || 'General'}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-warm-gray/40">
                    <div className="h-full rounded-full bg-burgundy transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <EmptyState title="No skills yet" description="Add your technical skills to strengthen your portfolio." action={<button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream">Add skill</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {Object.entries(grouped).map(([category, catSkills]) => (
            <motion.div key={category} variants={staggerItem}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/50">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {catSkills.map((s) => (
                  <div key={s.id} className="group flex items-center gap-2 rounded-xl border border-warm-gray bg-white/60 px-3 py-2 transition-shadow hover:shadow-sm">
                    <span className="text-sm font-medium text-charcoal">{s.name}</span>
                    {s.proficiency && <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[0.6rem] font-medium text-sage">{s.proficiency}</span>}
                    <div className="hidden gap-1 group-hover:flex">
                      <button onClick={() => openEdit(s)} className="text-xs text-charcoal/40 hover:text-burgundy" aria-label={`Edit ${s.name}`}>✎</button>
                      <button onClick={() => setDeleteTarget(s)} className="text-xs text-charcoal/40 hover:text-rosewood" aria-label={`Delete ${s.name}`}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSkill ? 'Edit Skill' : 'Add Skill'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="name" label="Skill Name" value={form.name} onChange={handleChange} error={fieldErrors.name} />
          <div className="mb-5">
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-charcoal">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange}
              className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-burgundy">
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-5">
            <label htmlFor="proficiency" className="mb-1.5 block text-sm font-medium text-charcoal">Proficiency</label>
            <select id="proficiency" name="proficiency" value={form.proficiency} onChange={handleChange}
              className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-burgundy">
              <option value="">Select level</option>
              {proficiencies.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <FormField id="displayOrder" label="Display Order" type="number" value={form.displayOrder} onChange={handleChange} required={false} />
          {formError && <p role="alert" className="mb-4 text-sm text-rosewood">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream disabled:opacity-60">{saving ? 'Saving…' : editingSkill ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete skill" message={`Delete "${deleteTarget?.name}"?`} />
    </motion.div>
  );
}
