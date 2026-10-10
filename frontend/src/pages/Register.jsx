import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { fadeSlideUp } from '../motion/variants';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { parseApiError } from '../utils/apiError';

// Mirrors backend RegisterRequest validation for fast client-side feedback.
// The backend remains the source of truth - these are a UX shortcut, not
// a security boundary, per "never rely on frontend authorization".
function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  else if (form.fullName.length > 100) errors.fullName = 'Full name must be at most 100 characters';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email must be a valid address';

  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';

  return errors;
}

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});

    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const { message, fieldErrors: apiFieldErrors } = parseApiError(error);
      setFormError(message);
      setFieldErrors(apiFieldErrors);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeSlideUp}>
      <h1 className="text-[1.7rem] font-semibold leading-tight text-charcoal sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-1.5 mb-8 text-sm text-charcoal/60">
        Start building your professional developer portfolio.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={handleChange}
          error={fieldErrors.fullName}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />
        <p className="-mt-3.5 mb-5 text-xs text-charcoal/50">At least 8 characters.</p>

        {formError && (
          <p role="alert" className="mb-5 text-sm text-rosewood">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full rounded-lg bg-burgundy py-3 text-sm font-medium text-cream transition-all duration-150 hover:bg-burgundy/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-charcoal/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-burgundy underline underline-offset-4 hover:text-burgundy/80">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
