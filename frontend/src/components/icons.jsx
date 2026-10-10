// Shared icon set. Kept intentionally small and hand-drawn (currentColor
// stroke icons) rather than pulling in an icon library, since none is
// installed in this project and these four glyphs don't justify adding one.
// All icons are decorative by default (aria-hidden) - the accessible name
// belongs on the interactive element (button) that wraps them, via
// aria-label, not on the icon itself.

function IconBase({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function EyeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function EyeOffIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a3 3 0 0 0 4.24 4.24" />
      <path d="M6.53 6.6C4.14 8.12 2.25 12 2.25 12s3.75 7.5 9.75 7.5c1.97 0 3.66-.53 5.06-1.31" />
      <path d="M17.61 17.6C19.86 16.02 21.75 12 21.75 12S18 4.5 12 4.5c-.9 0-1.75.1-2.55.3" />
    </IconBase>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </IconBase>
  );
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  );
}
