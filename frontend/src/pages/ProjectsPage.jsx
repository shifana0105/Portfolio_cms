import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api/projects';
import { parseApiError } from '../utils/apiError';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

const emptyProject = { title: '', description: '', techStack: '', liveUrl: '', githubUrl: '', thumbnailUrl: '', featured: false, displayOrder: 0 };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refreshProjects = () => {
    getProjects().then(setProjects).catch(() => setError('Failed to load projects'));
  };

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => { if (!cancelled) setProjects(data); })
      .catch(() => { if (!cancelled) setError('Failed to load projects'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function openAdd() { setForm(emptyProject); setEditingProject(null); setFormError(''); setFieldErrors({}); setModalOpen(true); }
  function openEdit(p) { setForm({ title: p.title, description: p.description || '', techStack: p.techStack || '', liveUrl: p.liveUrl || '', githubUrl: p.githubUrl || '', thumbnailUrl: p.thumbnailUrl || '', featured: p.featured, displayOrder: p.displayOrder }); setEditingProject(p); setFormError(''); setFieldErrors({}); setModalOpen(true); }
  function handleChange(e) { const { name, value, type, checked } = e.target; setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setFieldErrors({}); setSaving(true);
    try {
      if (editingProject) { await updateProject(editingProject.id, form); }
      else { await createProject(form); }
      setModalOpen(false); refreshProjects();
    } catch (err) { const { message, fieldErrors: fe } = parseApiError(err); setFormError(message); setFieldErrors(fe); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try { await deleteProject(deleteTarget.id); setDeleteTarget(null); refreshProjects(); }
    catch { setError('Failed to delete project'); setDeleteTarget(null); }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Projects</h1>
          <p className="text-sm text-charcoal/60">Showcase the work you want recruiters to see.</p>
        </div>
        <button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">Add project</button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Add your first project to start building your portfolio." action={<button onClick={openAdd} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream">Add project</button>} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <motion.div key={p.id} variants={staggerItem} className="rounded-2xl border border-warm-gray bg-white/60 p-5 transition-shadow hover:shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-charcoal">{p.title}</h3>
                {p.featured && <span className="rounded-full bg-muted-gold/20 px-2 py-0.5 text-[0.65rem] font-medium text-muted-gold">Featured</span>}
              </div>
              {p.description && <p className="mb-3 text-sm text-charcoal/60 line-clamp-2">{p.description}</p>}
              {p.techStack && <p className="mb-3 text-xs text-charcoal/50">{p.techStack}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">Edit</button>
                <button onClick={() => setDeleteTarget(p)} className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-rosewood/70 transition-colors hover:border-rosewood hover:text-rosewood">Delete</button>
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">Live ↗</a>}
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">GitHub ↗</a>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <FormField id="title" label="Title" value={form.title} onChange={handleChange} error={fieldErrors.title} />
          <div className="mb-5">
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-charcoal">Description</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange}
              className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-burgundy" />
          </div>
          <FormField id="techStack" label="Tech Stack" value={form.techStack} onChange={handleChange} required={false} />
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField id="liveUrl" label="Live URL" value={form.liveUrl} onChange={handleChange} required={false} />
            <FormField id="githubUrl" label="GitHub URL" value={form.githubUrl} onChange={handleChange} required={false} />
          </div>
          <FormField id="thumbnailUrl" label="Thumbnail URL" value={form.thumbnailUrl} onChange={handleChange} required={false} />
          <div className="mb-5 flex items-center gap-3">
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} className="h-4 w-4 accent-burgundy" />
            <label htmlFor="featured" className="text-sm text-charcoal/80">Featured project</label>
          </div>
          <FormField id="displayOrder" label="Display Order" type="number" value={form.displayOrder} onChange={handleChange} required={false} />
          {formError && <p role="alert" className="mb-4 text-sm text-rosewood">{formError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90 disabled:opacity-60">{saving ? 'Saving…' : editingProject ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete project" message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </motion.div>
  );
}
