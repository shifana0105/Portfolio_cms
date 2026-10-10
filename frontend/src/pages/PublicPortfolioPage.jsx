import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPublicPortfolio, sendContactMessage, getPublicResumeUrl } from '../services/api/publicPortfolio';
import LoadingSpinner from '../components/LoadingSpinner';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);

  // Contact form
  const [contactForm, setContactForm] = useState({ senderName: '', senderEmail: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPublicPortfolio(username)
      .then((d) => { if (!cancelled) setPortfolio(d); })
      .catch((e) => { if (!cancelled) setError(e?.response?.status === 404 ? 'Portfolio not found' : 'Failed to load portfolio'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [username]);

  async function handleContact(e) {
    e.preventDefault();
    setContactError(''); setContactSuccess('');
    setContactSending(true);
    try {
      await sendContactMessage(username, contactForm);
      setContactSuccess('Message sent successfully!');
      setContactForm({ senderName: '', senderEmail: '', message: '' });
      setTimeout(() => setContactSuccess(''), 5000);
    } catch (err) {
      setContactError(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setContactSending(false);
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (error) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-charcoal">{error}</h1>
        <p className="mt-2 text-sm text-charcoal/60">The portfolio you&apos;re looking for doesn&apos;t exist or isn&apos;t public.</p>
      </div>
    </div>
  );

  const p = portfolio;

  // Theme styling definitions
  const themeStyles = {
    default: {
      wrapper: 'bg-cream text-charcoal',
      card: 'bg-white/60 border-warm-gray',
      heading: 'text-charcoal',
      accentBtn: 'bg-burgundy text-cream hover:bg-burgundy/90',
      tag: 'bg-muted-gold/20 text-muted-gold',
    },
    minimal: {
      wrapper: 'bg-slate-50 text-slate-900',
      card: 'bg-white border-slate-200 shadow-xs',
      heading: 'text-slate-900',
      accentBtn: 'bg-slate-900 text-white hover:bg-slate-800',
      tag: 'bg-slate-100 text-slate-700',
    },
    bold: {
      wrapper: 'bg-slate-950 text-slate-100',
      card: 'bg-slate-900/80 border-slate-800 shadow-md',
      heading: 'text-slate-50',
      accentBtn: 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400',
      tag: 'bg-cyan-950 text-cyan-400 border border-cyan-800/40',
    },
  };

  const currentTheme = themeStyles[p.portfolioTheme] || themeStyles.default;

  // Group skills by category
  const skillGroups = (p.skills || []).reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen transition-colors duration-300 ${currentTheme.wrapper}`}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Recruiter Mode Toggle Bar */}
        <div className="mb-8 flex items-center justify-between rounded-xl border border-warm-gray/40 bg-white/40 p-3 backdrop-blur-xs">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {isRecruiterMode ? '👔 Recruiter Executive View' : '✨ Public Portfolio View'}
          </span>
          <button
            type="button"
            onClick={() => setIsRecruiterMode(!isRecruiterMode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isRecruiterMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-warm-gray bg-white/80 text-charcoal hover:border-burgundy hover:text-burgundy'
            }`}
          >
            {isRecruiterMode ? 'Exit Recruiter Mode' : 'Enable Recruiter Mode'}
          </button>
        </div>

        {/* Recruiter Executive Mode View */}
        {isRecruiterMode ? (
          <motion.div initial="hidden" animate="visible" variants={fadeSlideUp} className="space-y-6">
            <div className={`rounded-2xl border p-6 ${currentTheme.card}`}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                    CANDIDATE BRIEF
                  </span>
                  <h1 className={`mt-2 text-2xl font-bold ${currentTheme.heading}`}>{p.fullName || p.username}</h1>
                  {p.professionalHeadline && <p className="text-base opacity-80">{p.professionalHeadline}</p>}
                  {p.location && <p className="text-xs opacity-60 mt-1">📍 {p.location}</p>}
                </div>
                {p.hasResume && (
                  <a href={getPublicResumeUrl(username)} target="_blank" rel="noopener noreferrer"
                    className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold shadow-xs ${currentTheme.accentBtn}`}>
                    📄 Download Resume (PDF)
                  </a>
                )}
              </div>
            </div>

            {/* Quick Candidate Snapshot */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className={`rounded-xl border p-4 text-center ${currentTheme.card}`}>
                <p className="text-xs uppercase opacity-60 font-medium">Projects</p>
                <p className="text-xl font-bold">{p.projects?.length || 0}</p>
              </div>
              <div className={`rounded-xl border p-4 text-center ${currentTheme.card}`}>
                <p className="text-xs uppercase opacity-60 font-medium">Skills</p>
                <p className="text-xl font-bold">{p.skills?.length || 0}</p>
              </div>
              <div className={`rounded-xl border p-4 text-center ${currentTheme.card}`}>
                <p className="text-xs uppercase opacity-60 font-medium">Experience</p>
                <p className="text-xl font-bold">{p.experiences?.length || 0}</p>
              </div>
              <div className={`rounded-xl border p-4 text-center ${currentTheme.card}`}>
                <p className="text-xs uppercase opacity-60 font-medium">Education</p>
                <p className="text-xl font-bold">{p.education?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      {/* Hero Section */}
      <section className="mb-12 flex flex-col items-center text-center sm:mb-16">
        {p.avatarUrl && (
          <div className="mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <img src={p.avatarUrl.startsWith('http') ? p.avatarUrl : `http://localhost:8080${p.avatarUrl}`} alt={p.fullName} className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-semibold text-charcoal sm:text-4xl">{p.fullName || p.username}</h1>
        {p.professionalHeadline && <p className="mt-2 text-lg text-charcoal/70">{p.professionalHeadline}</p>}
        {p.location && <p className="mt-1 text-sm text-charcoal/50">{p.location}</p>}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {p.githubUrl && <SocialLink href={p.githubUrl} label="GitHub" />}
          {p.linkedinUrl && <SocialLink href={p.linkedinUrl} label="LinkedIn" />}
          {p.websiteUrl && <SocialLink href={p.websiteUrl} label="Website" />}
          {p.twitterUrl && <SocialLink href={p.twitterUrl} label="Twitter" />}
          {p.hasResume && (
            <a href={getPublicResumeUrl(username)} target="_blank" rel="noopener noreferrer"
              className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90">
              Download Resume
            </a>
          )}
        </div>
      </section>

      {/* About */}
      {p.bio && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>About</SectionTitle>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal/70 sm:text-base">{p.bio}</p>
        </section>
      )}

      {/* Projects */}
      {p.projects?.length > 0 && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>Projects</SectionTitle>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {p.projects.map((proj) => (
              <motion.div key={proj.id} variants={staggerItem}
                className="group rounded-2xl border border-warm-gray bg-white/60 p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-charcoal">{proj.title}</h3>
                  {proj.featured && <span className="rounded-full bg-muted-gold/20 px-2 py-0.5 text-[0.6rem] font-medium text-muted-gold">Featured</span>}
                </div>
                {proj.description && <p className="mt-2 text-sm text-charcoal/60 line-clamp-3">{proj.description}</p>}
                {proj.techStack && <p className="mt-2 text-xs text-charcoal/40">{proj.techStack}</p>}
                <div className="mt-3 flex gap-2">
                  {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">Live ↗</a>}
                  {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-warm-gray px-3 py-1.5 text-xs font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">Code ↗</a>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Skills */}
      {p.skills?.length > 0 && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>Skills</SectionTitle>
          <div className="space-y-5">
            {Object.entries(skillGroups).map(([category, skills]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/40">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s.id} className="rounded-xl border border-warm-gray bg-white/60 px-3 py-1.5 text-sm font-medium text-charcoal">
                      {s.name}
                      {s.proficiency && <span className="ml-1.5 text-[0.6rem] text-charcoal/40">({s.proficiency})</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {p.experiences?.length > 0 && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>Experience</SectionTitle>
          <div className="relative space-y-0">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-warm-gray" aria-hidden="true" />
            {p.experiences.map((exp) => (
              <div key={exp.id} className="relative pl-10 pb-5">
                <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-burgundy bg-cream" />
                <h4 className="text-sm font-semibold text-charcoal">{exp.jobTitle}</h4>
                <p className="text-sm text-charcoal/70">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                <p className="text-xs text-charcoal/40">{exp.startDate} — {exp.currentlyWorking ? 'Present' : exp.endDate}</p>
                {exp.description && <p className="mt-1.5 text-sm text-charcoal/60">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {p.education?.length > 0 && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-4">
            {p.education.map((edu) => (
              <div key={edu.id} className="rounded-2xl border border-warm-gray bg-white/60 p-5">
                <h4 className="text-sm font-semibold text-charcoal">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</h4>
                <p className="text-sm text-charcoal/70">{edu.institution}</p>
                <p className="text-xs text-charcoal/40">{edu.startDate} — {edu.endDate || 'Present'}{edu.grade ? ` · GPA: ${edu.grade}` : ''}</p>
                {edu.description && <p className="mt-1.5 text-sm text-charcoal/60">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Form */}
      {p.contactEmail && (
        <section className="mb-12 sm:mb-16">
          <SectionTitle>Get in Touch</SectionTitle>
          <form onSubmit={handleContact} noValidate className="max-w-lg rounded-2xl border border-warm-gray bg-white/60 p-6">
            <div className="mb-4">
              <label htmlFor="senderName" className="mb-1.5 block text-sm font-medium text-charcoal">Your Name</label>
              <input id="senderName" name="senderName" value={contactForm.senderName} onChange={(e) => setContactForm(f => ({ ...f, senderName: e.target.value }))}
                className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm outline-none focus:border-burgundy" required />
            </div>
            <div className="mb-4">
              <label htmlFor="senderEmail" className="mb-1.5 block text-sm font-medium text-charcoal">Your Email</label>
              <input id="senderEmail" name="senderEmail" type="email" value={contactForm.senderEmail} onChange={(e) => setContactForm(f => ({ ...f, senderEmail: e.target.value }))}
                className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm outline-none focus:border-burgundy" required />
            </div>
            <div className="mb-4">
              <label htmlFor="contactMessage" className="mb-1.5 block text-sm font-medium text-charcoal">Message</label>
              <textarea id="contactMessage" name="message" rows={4} value={contactForm.message} onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-warm-gray bg-white px-3.5 py-2.5 text-sm outline-none focus:border-burgundy" required />
            </div>
            {contactError && <p role="alert" className="mb-4 text-sm text-rosewood">{contactError}</p>}
            {contactSuccess && <p role="status" className="mb-4 text-sm font-medium text-sage">{contactSuccess}</p>}
            <button type="submit" disabled={contactSending}
              className="rounded-lg bg-burgundy px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90 disabled:opacity-60">
              {contactSending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-warm-gray pt-6 text-center">
        <p className="text-xs text-charcoal/40">Built with Portfolio CMS</p>
      </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-5 text-lg font-semibold text-charcoal">{children}</h2>;
}

function SocialLink({ href, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="rounded-lg border border-warm-gray px-3.5 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-burgundy hover:text-burgundy">
      {label}
    </a>
  );
}
