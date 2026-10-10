import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getResume, uploadResume, deleteResume, downloadResume } from '../services/api/resume';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { fadeSlideUp } from '../motion/variants';

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getResume()
      .then((r) => { if (!cancelled) setResume(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(''); setSuccess('');

    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB'); return; }
    if (file.type !== 'application/pdf') { setError('Only PDF files are allowed'); return; }

    setUploading(true);
    try {
      const r = await uploadResume(file);
      setResume(r);
      setSuccess('Resume uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload resume');
    } finally { setUploading(false); }
  }

  async function handleDelete() {
    try {
      await deleteResume();
      setResume(null);
      setDeleteOpen(false);
      setSuccess('Resume deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete resume'); setDeleteOpen(false); }
  }

  async function handleViewDownload() {
    if (downloading) return;
    setError('');
    setDownloading(true);
    try {
      const blobData = await downloadResume();
      const pdfBlob = blobData.type === 'application/pdf'
        ? blobData
        : new Blob([blobData], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);

      const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (resume?.originalFilename) {
          link.download = resume.originalFilename;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      let message = 'Failed to load resume';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) {
            message = json.message;
          }
        } catch {
          // Non-JSON blob
        }
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }

      if (err?.response?.status === 401) {
        message = message && message !== 'Failed to load resume' ? message : 'Authentication required';
      } else if (err?.response?.status === 403) {
        message = message && message !== 'Failed to load resume' ? message : 'Access denied';
      }
      setError(message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="max-w-2xl">
      <h1 className="mb-1.5 text-2xl font-semibold text-charcoal">Resume</h1>
      <p className="mb-8 text-sm text-charcoal/60">Upload your resume for recruiters to download from your public portfolio.</p>

      {error && <p role="alert" className="mb-4 text-sm text-rosewood">{error}</p>}
      {success && <p role="status" className="mb-4 text-sm text-sage font-medium">{success}</p>}

      {resume ? (
        <div className="rounded-2xl border border-warm-gray bg-white/60 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-burgundy/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-burgundy"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{resume.originalFilename}</p>
              <p className="text-xs text-charcoal/50">{(resume.fileSize / 1024).toFixed(0)} KB • Uploaded {new Date(resume.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleViewDownload}
              disabled={downloading}
              className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy disabled:opacity-50"
            >
              {downloading ? 'Loading…' : 'View / Download'}
            </button>
            <label className="cursor-pointer rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">
              {uploading ? 'Uploading…' : 'Replace'}
              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <button onClick={() => setDeleteOpen(true)}
              className="rounded-lg border border-warm-gray px-4 py-2 text-sm font-medium text-rosewood/70 transition-colors hover:border-rosewood hover:text-rosewood">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-warm-gray bg-white/40 px-6 py-12">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mb-4 h-10 w-10 text-charcoal/25"><path d="M12 16V4m0 0l-4 4m4-4 4 4M4 20h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p className="mb-1 text-sm font-medium text-charcoal/70">Upload your resume</p>
          <p className="mb-4 text-xs text-charcoal/50">PDF only, max 5 MB</p>
          <label className="cursor-pointer rounded-lg bg-burgundy px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">
            {uploading ? 'Uploading…' : 'Choose file'}
            <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      )}

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete resume" message="Are you sure? This will remove your resume from your portfolio." />
    </motion.div>
  );
}
