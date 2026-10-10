import { Outlet } from 'react-router-dom';

// Passthrough for most public routes (home, the future /p/{username}
// portfolio). AuthLayout routes (login/register) additionally redirect an
// already-authenticated user away - see AuthLayout.
export default function PublicRoute() {
  return <Outlet />;
}
