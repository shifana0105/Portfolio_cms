import { useState } from 'react';
import FormField from './FormField';
import { EyeIcon, EyeOffIcon } from './icons';

// Reusable password field with a show/hide toggle - composes on top of
// FormField (rather than duplicating its label/error/aria wiring) via the
// endAdornment slot, so Login and Register both get the same field
// component, same validation/error behavior, and same toggle behavior.
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  required = true,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      type={isVisible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={error}
      autoComplete={autoComplete}
      required={required}
      endAdornment={
        <button
          type="button"
          onClick={() => setIsVisible((v) => !v)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          // 44x44 touch target regardless of the (shorter) input's own
          // height - centered over the input via inset-y-0 + flex, so it
          // never affects the field's own height or triggers layout shift.
          className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center rounded-lg text-charcoal/45 transition-colors hover:text-burgundy focus-visible:text-burgundy"
        >
          {isVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      }
    />
  );
}
