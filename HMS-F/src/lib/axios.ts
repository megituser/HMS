import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Centralized Axios instance for HMS API.
 * NEVER prefix endpoints with /api inside api.get/post — baseURL already includes it.
 * e.g. api.get('/patients')  NOT  api.get('/api/patients')
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Contract for a request queued while a token refresh is in-flight */
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}

// ─── Refresh State ────────────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  for (const { resolve, reject } of failedQueue) {
    if (error) {
      reject(error);
    } else if (token !== null) {
      resolve(token);
    }
  }
  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = useAuthStore.getState().token;

    // Fallback: read directly from localStorage if Zustand state is briefly out of sync
    if (!token) {
      try {
        const storedAuth = localStorage.getItem('hms-auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          token = parsed.state?.token ?? null;
        }
      } catch {
        // Proceed without token — will likely result in 401
      }
    }

    if (token) {
      // Avoid 'any' cast — Axios accepts string index assignment on headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // ── 401 Unauthorized: attempt token refresh ──────────────────────────────
    if (status === 401 && !originalRequest._retry) {

      // Prevent infinite loop if the refresh endpoint itself returns 401
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        try {
          const token = await Promise.race([
            new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }),
            // Safety timeout: don't wait forever if refresh hangs
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Queue timeout waiting for token refresh')), 10000)
            ),
          ]);

          originalRequest._retry = true;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          isRefreshing = false; // FIX: reset here too in case of queue timeout
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use raw axios (not our intercepted instance) to avoid recursive interception
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        // Guard: verify the response contains the expected field
        if (!data.accessToken) {
          throw new Error(
            `Invalid refresh response — 'accessToken' field missing. ` +
            `Received keys: ${Object.keys(data).join(', ')}`
          );
        }

        // Persist new tokens
        useAuthStore.getState().setToken(data.accessToken, data.refreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        processQueue(null, data.accessToken);
        isRefreshing = false; // Reset BEFORE retrying to avoid locking future refreshes

        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(err);
      }
    }

    // ── 403 Forbidden: authenticated but not authorized ──────────────────────
    // This means the user's role doesn't have permission for this resource.
    // Dispatch an event so the app can show a toast or redirect to /unauthorized.
    if (status === 403) {
      if (import.meta.env.DEV) {
        console.warn(`[API] 403 Forbidden — ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
      }
      window.dispatchEvent(
        new CustomEvent('auth:forbidden', {
          detail: { url: originalRequest.url, method: originalRequest.method },
        })
      );
      // Do NOT logout on 403 — the user is still authenticated, just lacks permission
    }

    // ── Structured error extraction ──────────────────────────────────────────
    // Normalize backend validation errors into a single readable message
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      let errorMessage = error.message;

      if (data.errors && typeof data.errors === 'object') {
        errorMessage = Object.values(data.errors as Record<string, string>).join(', ');
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      }

      const customError = Object.assign(new Error(errorMessage), {
        isAxiosError: true,
        response: error.response,
        config: error.config,
        status: error.response?.status,
      });

      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * IMPORTANT — Add these listeners in your App.tsx or root layout:
 *
 * useEffect(() => {
 *   const onUnauthorized = () => {
 *     navigate('/login');
 *     toast.error('Session expired. Please log in again.');
 *   };
 *   const onForbidden = () => {
 *     navigate('/unauthorized');
 *     toast.error('You do not have permission to perform this action.');
 *   };
 *
 *   window.addEventListener('auth:unauthorized', onUnauthorized);
 *   window.addEventListener('auth:forbidden', onForbidden);
 *   return () => {
 *     window.removeEventListener('auth:unauthorized', onUnauthorized);
 *     window.removeEventListener('auth:forbidden', onForbidden);
 *   };
 * }, [navigate]);
 */