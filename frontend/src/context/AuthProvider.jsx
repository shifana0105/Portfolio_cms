import { useCallback, useEffect, useMemo, useState } from 'react';
import { loginRequest, logoutRequest, registerRequest } from '../services/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../services/api/client';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // "checking" avoids a flash of "logged out" UI before the very first
  // render settles - there's nothing async to check yet in Phase 1 (no
  // token persistence), but this keeps the shape ready for when a
  // Phase-later refresh-token check is added here.
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
      setAuthToken(null);
    });
  }, []);

  const applySession = useCallback((authResponse) => {
    setUser(authResponse.user);
    setToken(authResponse.accessToken);
    setAuthToken(authResponse.accessToken);
  }, []);

  const register = useCallback(async ({ fullName, email, password }) => {
    setIsLoading(true);
    try {
      const data = await registerRequest({ fullName, email, password });
      applySession(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await loginRequest({ email, password });
      applySession(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [applySession]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      await logoutRequest();
    } catch {
      // Client-side logout already happened above; a failed best-effort
      // server call should never trap the user in a "still logged in" state.
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    register,
    login,
    logout,
  }), [user, token, isLoading, register, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
