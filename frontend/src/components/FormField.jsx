// Shared accessible field: label wired to input via htmlFor/id,
// aria-invalid + aria-describedby on error, error text linked by id.
// Used by Login/Register (and PasswordInput, which composes on top of
// this rather than reimplementing the label/error wiring) - any future
// form reuses this too rather than each page reinventing it.
export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  required = true,
  // Optional element rendered inside the input's own box, right-aligned
  // (e.g. the password show/hide button). Absent for ordinary fields, so
  // their markup/behavior is unchanged from before this prop existed.
  endAdornment,
}) {
  const errorId = `${id}-error`;

  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[0.95rem] text-charcoal outline-none transition-colors placeholder:text-charcoal/35
            ${endAdornment ? 'pr-11' : ''}
            ${error ? 'border-rosewood focus:border-rosewood' : 'border-warm-gray focus:border-burgundy'}`}
        />
        {endAdornment}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-rosewood">
          {error}
        </p>
      )}
    </div>
  );
}
