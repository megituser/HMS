import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { queryClient } from '@/providers/QueryProvider';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  userId: number | null;
  user: { username: string } | null;
  isAuthenticated: boolean;
  login: (data: { accessToken: string; refreshToken: string; username: string }) => void;
  logout: () => void;
  setToken: (token: string, refreshToken?: string) => void;
}

/**
 * Decodes a JWT and extracts the user's role.
 * Handles multiple Spring Security JWT formats:
 * - { "authorities": [{ "authority": "ROLE_ADMIN" }] }  ← most common
 * - { "authorities": ["ROLE_ADMIN"] }                   ← simple array
 * - { "role": "ROLE_ADMIN" }                            ← single string
 * - { "roles": ["ROLE_ADMIN"] }                         ← roles array
 */
const decodeRole = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Spring Security default: authorities as array of objects
    if (Array.isArray(payload.authorities) && payload.authorities.length > 0) {
      const first = payload.authorities[0];
      // Object format: { authority: "ROLE_ADMIN" }
      if (typeof first === 'object' && first !== null && 'authority' in first) {
        return first.authority ?? null;
      }
      // String format: "ROLE_ADMIN"
      if (typeof first === 'string') {
        return first;
      }
    }

    // Simple role string
    if (typeof payload.role === 'string') return payload.role;

    // Roles array
    if (Array.isArray(payload.roles) && payload.roles.length > 0) {
      return typeof payload.roles[0] === 'string' ? payload.roles[0] : null;
    }

    return null;
  } catch (e) {
    console.error('[AuthStore] Error decoding token:', e);
    return null;
  }
};

/**
 * Extracts the user/subject ID from the JWT payload.
 * Checks common claim names: userId, user_id, id, sub (numeric).
 */
const decodeUserId = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Try common claim names for user ID
    const rawId = payload.userId ?? payload.user_id ?? payload.id ?? null;
    if (typeof rawId === 'number') return rawId;
    if (typeof rawId === 'string' && /^\d+$/.test(rawId)) return parseInt(rawId, 10);
    // If sub is numeric, use it as user ID
    if (typeof payload.sub === 'number') return payload.sub;
    if (typeof payload.sub === 'string' && /^\d+$/.test(payload.sub)) return parseInt(payload.sub, 10);
    return null;
  } catch {
    return null;
  }
};

/**
 * Returns true if the JWT is expired or cannot be parsed.
 * Use this before making sensitive API calls.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // No expiry claim — treat as valid
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Malformed token — treat as expired
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      role: null,
      userId: null,
      user: null,
      isAuthenticated: false,

      login: (data) => {
        queryClient.clear();  // Wipe previous user's cached data
        const role = decodeRole(data.accessToken);
        const userId = decodeUserId(data.accessToken);
        set({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          role,
          userId,
          // role is NOT duplicated in user — use state.role as single source of truth
          user: { username: data.username },
          isAuthenticated: true,
        });
      },

      logout: () => {
        queryClient.clear();  // Wipe cached data from this session
        set({
          token: null,
          refreshToken: null,
          role: null,
          userId: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setToken: (token, refreshToken) => {
        const role = decodeRole(token);
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          role: role ?? state.role,
          // Keep username, just update token — role comes from state.role
          user: state.user ?? null,
        }));
      },
    }),
    {
      name: 'hms-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Convenience selector hooks ──────────────────────────────────────────────
export const useIsAdmin = () => useAuthStore((s) => s.role === 'ROLE_ADMIN');
export const useIsDoctor = () => useAuthStore((s) => s.role === 'ROLE_DOCTOR');
export const useIsReceptionist = () => useAuthStore((s) => s.role === 'ROLE_RECEPTIONIST');
export const useIsAccountant = () => useAuthStore((s) => s.role === 'ROLE_ACCOUNTANT');
export const useUserRole = () => useAuthStore((s) => s.role);
export const useUserId = () => useAuthStore((s) => s.userId);
export const useUsername = () => useAuthStore((s) => s.user?.username ?? null);