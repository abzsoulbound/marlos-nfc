// sessions.ts
// Session lifecycle endpoints.

import { sessionStore } from "../lib/store.repo";
import { closeTableSession } from "../lib/session.close";
import type { Session } from "../lib/session.types";

export function getSession(sessionId: string): Session | null {
  return sessionStore.get(sessionId);
}

export function closeSessionApi(sessionId: string): boolean {
  return closeTableSession(sessionId);
}
