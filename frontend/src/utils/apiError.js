// Matches the error shape from ErrorResponse (backend):
// { success: false, message, errors? }
// Returned in the same { message, fieldErrors } shape callers already use
// (Login.jsx, Register.jsx) so the backend's field name ("errors") doesn't
// leak into every page that reads a form error.
export function parseApiError(error) {
  const body = error?.response?.data;

  if (!body) {
    return { message: 'Something went wrong. Please check your connection and try again.', fieldErrors: {} };
  }

  return {
    message: body.message || 'Something went wrong. Please try again.',
    fieldErrors: body.errors || {},
  };
}
