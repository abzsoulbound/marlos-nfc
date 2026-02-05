import { sessionStore } from "./store.repo";

export function closeTableSession(sessionId: string) {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  if (!session.active) {
    return session;
  }
  const updated = {
    ...session,
    active: false,
    closedAt: new Date().toISOString(),
  };
  sessionStore.set(sessionId, updated);
  return updated;
}
