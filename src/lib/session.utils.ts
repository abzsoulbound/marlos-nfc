// session.utils.ts
// Pure helpers for session rules.

import type { Session } from "./session.types";

export function canAddOrder(session: Session): boolean {
  return session.status === "open";
}

export function lockSession(session: Session): Session {
  return { ...session, status: "locked" };
}

export function closeSession(session: Session): Session {
  return {
    ...session,
    status: "closed",
    closedAt: new Date().toISOString(),
  };
}
