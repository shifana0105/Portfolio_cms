import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { fadeSlideUp } from '../motion/variants';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { parseApiError } from '../utils/apiError';

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    try {
      await login(form);
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
        Welcome back
      </h1>
      <p className="mt-1.5 mb-8 text-sm text-charcoal/60">
        Log in to your Portfolio CMS account.
      </p>

      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

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
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-charcoal/60">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-burgundy underline underline-offset-4 hover:text-burgundy/80">
          Register
        </Link>
      </p>
    </motion.div>
  );
}
