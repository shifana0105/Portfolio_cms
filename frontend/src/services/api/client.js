import axios from 'axios';

// Base Axios instance. All per-resource service files (auth, profile,
// projects, etc.) should import and use this instance rather than calling
// axios directly, so auth headers and error handling stay centralized.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Phase 1: AuthContext calls this on login/logout/token-refresh to attach
// (or remove) the bearer token on every subsequent request. Kept here
// rather than duplicated per-request so every service file benefits
// automatically.
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// Phase 1: a 401 from a request that was actually carrying a bearer token
// means that token is expired/invalid - that's a session ending, so
// AuthContext's logout handler should run. A 401 from a request with NO
// token (e.g. /auth/login with a wrong password, or /auth/register
// somehow getting one) is just that request failing on its own terms -
// there is no session to end, so it must be left alone and returned to
// the caller (Login/Register read it via parseApiError and show it inline).
// AuthContext registers the actual "log the user out" handler via this
// setter so client.js doesn't need to import AuthContext directly (would
// create a circular dependency).
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Reads the Authorization header off the *request* config that produced
// this error - not off apiClient's current defaults, which may already
// have changed by the time the response comes back. Axios 1.x stores
// request headers as an AxiosHeaders instance (has .get()) but this also
// tolerates a plain object, since interceptors/tests may construct one.
function requestHadBearerToken(config) {
  const headers = config?.headers;
  if (!headers) return false;
  const value = typeof headers.get === 'function' ? headers.get('Authorization') : headers.Authorization;
  return typeof value === 'string' && value.startsWith('Bearer ');
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && requestHadBearerToken(error.config) && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
