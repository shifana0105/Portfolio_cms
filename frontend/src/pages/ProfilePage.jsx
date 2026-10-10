import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProfile, saveProfile, uploadAvatar, checkProfileExists } from '../services/api/profile';
import { parseApiError } from '../utils/apiError';
import { useAutosave } from '../hooks/useAutosave';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import SaveIndicator from '../components/SaveIndicator';
import { fadeSlideUp } from '../motion/variants';

const emptyProfile = {
  username: '', fullName: '', professionalHeadline: '', bio: '', location: '',
  contactEmail: '', linkedinUrl: '', githubUrl: '', websiteUrl: '', twitterUrl: '',
  isPublic: false, portfolioTheme: 'default',
};

export default function ProfilePage() {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const doSave = useCallback(async (data) => {
    await saveProfile(data);
  }, []);

  const { triggerSave, saveStatus } = useAutosave(doSave, 3000);

  useEffect(() => {
    let cancelled = false;
    checkProfileExists().then((exists) => {
      if (exists && !cancelled) {
        getProfile().then((p) => {
          if (!cancelled) {
            setForm({
              username: p.username || '', fullName: p.fullName || '', professionalHeadline: p.professionalHeadline || '',
              bio: p.bio || '', location: p.location || '', contactEmail: p.contactEmail || '',
              linkedinUrl: p.linkedinUrl || '', githubUrl: p.githubUrl || '', websiteUrl: p.websiteUrl || '',
              twitterUrl: p.twitterUrl || '', isPublic: p.isPublic || false, portfolioTheme: p.portfolioTheme || 'default',
            });
            setAvatarPreview(p.avatarUrl);
          }
        }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
      } else {
        if (!cancelled) setLoading(false);
      }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    const newForm = { ...form, [name]: newVal };
    setForm(newForm);
    if (form.username) triggerSave(newForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(''); setFieldErrors({}); setSuccess('');
    setSaving(true);
    try {
      await saveProfile(form);
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const { message, fieldErrors: fe } = parseApiError(err);
      setFormError(message);
      setFieldErrors(fe);
    } finally { setSaving(false); }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setFormError('Avatar must be under 2 MB'); return; }
    try {
      const res = await uploadAvatar(file);
      setAvatarPreview(res.avatarUrl);
      setSuccess('Avatar uploaded');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setFormError('Failed to upload avatar'); }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Profile</h1>
          <p className="text-sm text-charcoal/60">Manage your portfolio profile information.</p>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-warm-gray bg-warm-gray/30">
          {avatarPreview ? (
            <img src={avatarPreview.startsWith('http') ? avatarPreview : `http://localhost:8080${avatarPreview}`} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-charcoal/30">
              {form.fullName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div>
          <label className="cursor-pointer rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">
            Upload photo
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
          </label>
          <p className="mt-1.5 text-xs text-charcoal/40">JPG, PNG or WebP. Max 2 MB.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
          <FormField id="username" label="Username" value={form.username} onChange={handleChange} error={fieldErrors.username} autoComplete="off" />
          <FormField id="fullName" label="Full Name" value={form.fullName} onChange={handleChange} error={fieldErrors.fullName} autoComplete="name" />
        </div>
        <FormField id="professionalHeadline" label="Professional Headline" value={form.professionalHeadline} onChange={handleChange} error={fieldErrors.professionalHeadline} required={false} />
        <div className="mb-5">
          <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-charcoal">Bio / About</label>
          <textarea id="bio" name="bio" rows={4} value={form.bio} onChange={handleChange}
            className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-[0.95rem] text-charcoal outline-none transition-colors focus:border-burgundy" />
        </div>
        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
          <FormField id="location" label="Location" value={form.location} onChange={handleChange} required={false} />
          <FormField id="contactEmail" label="Contact Email" type="email" value={form.contactEmail} onChange={handleChange} required={false} />
        </div>

        <h3 className="mb-3 mt-6 text-sm font-semibold text-charcoal/70">Social Links</h3>
        <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
          <FormField id="githubUrl" label="GitHub URL" value={form.githubUrl} onChange={handleChange} required={false} />
          <FormField id="linkedinUrl" label="LinkedIn URL" value={form.linkedinUrl} onChange={handleChange} required={false} />
          <FormField id="websiteUrl" label="Website URL" value={form.websiteUrl} onChange={handleChange} required={false} />
          <FormField id="twitterUrl" label="Twitter / X URL" value={form.twitterUrl} onChange={handleChange} required={false} />
        </div>

        <h3 className="mb-3 mt-6 text-sm font-semibold text-charcoal/70">Portfolio Settings</h3>
        <div className="mb-5 flex items-center gap-3">
          <input type="checkbox" id="isPublic" name="isPublic" checked={form.isPublic} onChange={handleChange}
            className="h-4 w-4 rounded border-warm-gray accent-burgundy" />
          <label htmlFor="isPublic" className="text-sm text-charcoal/80">Make portfolio public</label>
        </div>
        <div className="mb-6">
          <label htmlFor="portfolioTheme" className="mb-1.5 block text-sm font-medium text-charcoal">Portfolio Theme</label>
          <select id="portfolioTheme" name="portfolioTheme" value={form.portfolioTheme} onChange={handleChange}
            className="rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-burgundy">
            <option value="default">Default</option>
            <option value="minimal">Minimal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {formError && <p role="alert" className="mb-4 text-sm text-rosewood">{formError}</p>}
        {success && <p role="status" className="mb-4 text-sm text-sage font-medium">{success}</p>}

        <button type="submit" disabled={saving}
          className="rounded-lg bg-burgundy px-6 py-3 text-sm font-medium text-cream transition-all hover:bg-burgundy/90 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </motion.div>
  );
}
