import { createContext } from 'react';

// JWT storage decision for this MVP: kept in memory only (React state, held
// by AuthProvider), never in localStorage or a cookie. Trade-off,
// documented per the approved architecture: a hard page refresh logs the
// user out (there is no refresh-token/persistence flow in Phase 1), in
// exchange for avoiding both XSS-exposed storage (localStorage) and
// CSRF-prone cookies.
//
// This file holds only the context object itself - no component, no hook -
// so it exports a single constant. AuthProvider.jsx and useAuth.js both
// import it from here.
export const AuthContext = createContext(null);
