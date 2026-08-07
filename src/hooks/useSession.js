import { useMemo } from 'react';

const AUTH_STORAGE_KEY = 'srm_admin_session';
const COORDINATOR_AUTH_STORAGE_KEY = 'srm_coordinator_session';

export function useSession() {
  return useMemo(() => {
    const raw =
      sessionStorage.getItem(COORDINATOR_AUTH_STORAGE_KEY) ||
      sessionStorage.getItem(AUTH_STORAGE_KEY) ||
      localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);
}

export function isCoordinator(session) {
  return session?.role === 'coordinator';
}
