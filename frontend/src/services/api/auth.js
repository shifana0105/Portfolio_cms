import apiClient from './client';

export async function registerRequest({ fullName, email, password }) {
  const { data } = await apiClient.post('/auth/register', { fullName, email, password });
  return data;
}

export async function loginRequest({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function logoutRequest() {
  // Best-effort call for API symmetry - the backend does not (and cannot,
  // being stateless JWT) revoke the token server-side. The actual logout
  // effect is AuthContext discarding the in-memory token; this call is not
  // awaited-critical and its failure should never block client-side logout.
  const { data } = await apiClient.post('/auth/logout');
  return data;
}
