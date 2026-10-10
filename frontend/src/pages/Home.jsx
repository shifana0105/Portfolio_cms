import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api/health';
import { fadeSlideUp, staggerContainer, staggerItem } from '../motion/variants';

const highlights = [
  {
    title: 'Showcase your work',
    description: 'Bring your projects, skills, and experience together in one polished, professional portfolio.',
  },
  {
    title: 'Built for developers',
    description: 'A CMS shaped around how developers actually think about their work, not a generic website template.',
  },
  {
    title: 'Share with confidence',
    description: 'A public portfolio page you can point recruiters and collaborators to, whenever you\u2019re ready.',
  },
];

// Landing page. Backend connectivity is checked quietly in the background
// (useful during development/demos) but deliberately kept out of the way -
// it's an implementation detail, not something a visitor should read as a
// product feature.
export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    checkHealth()
      .then(() => {
        if (!cancelled) setBackendStatus('up');
      })
      .catch(() => {
        if (!cancelled) setBackendStatus('down');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 sm:px-8">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeSlideUp}
        className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center sm:py-20"
      >
        <h1 className="font-display text-4xl leading-tight text-burgundy sm:text-5xl md:text-6xl">
          Your portfolio, built like a product.
        </h1>
        <p className="mt-5 max-w-xl text-base text-charcoal/70 sm:text-lg">
          Portfolio CMS helps developers build and manage a professional portfolio
          that actually represents their work, without wrestling with a website builder.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="rounded-lg bg-burgundy px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-burgundy/90"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-warm-gray px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:border-burgundy hover:text-burgundy"
          >
            Log in
          </Link>
        </div>
      </motion.section>

      {/* A thin rule + tighter, editorial (not boxed-card) treatment reads
          as an intentional three-point pitch rather than a generic
          feature-grid template. */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={staggerContainer}
        className="mx-auto max-w-5xl border-t border-warm-gray/70 pb-16 pt-14 sm:pb-20"
      >
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {highlights.map((item) => (
            <motion.div key={item.title} variants={staggerItem}>
              <h2 className="mb-2 text-base font-semibold text-charcoal">{item.title}</h2>
              <p className="text-sm leading-relaxed text-charcoal/60">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <p
        className="pb-8 text-center text-xs text-charcoal/40"
        role="status"
        aria-live="polite"
      >
        {backendStatus === 'checking' && 'Connecting\u2026'}
        {backendStatus === 'up' && 'All systems operational'}
        {backendStatus === 'down' && 'Having trouble reaching our servers right now'}
      </p>
    </div>
  );
}
