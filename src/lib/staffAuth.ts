// src/lib/staffAuth.ts

const STORAGE_KEY = "marlos_staff_auth";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// CHANGE THIS PASSWORD
const STAFF_PASSWORD = "marlos123";

type Session = {
  authenticated: boolean;
  expiresAt: number;
};

export function isStaffAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const session: Session = JSON.parse(raw);
    if (!session.authenticated) return false;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

export function loginStaff(password: string): boolean {
  if (password !== STAFF_PASSWORD) return false;

  const session: Session = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return true;
}

export function logoutStaff() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
