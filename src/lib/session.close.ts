/**
 * Temporary stub to satisfy Next build.
 * Replace with real close-session logic later.
 */
import { sessionStore } from "./store.repo";

export function closeTableSession(sessionId: string): boolean {
  const existing = sessionStore.get(sessionId);
  if (!existing) return false;

  sessionStore.set(sessionId, {
    ...existing,
    status: "closed",
    closedAt: new Date().toISOString(),
  });

  return true;
}
