import type { Session } from "@/lib/sessions.types";

export function createSession(id: string, tableId: string): Session {
  return {
    id,
    tableId,
    active: true,
    startedAt: new Date().toISOString(),
  };
}

export function endSession(session: Session): Session {
  return {
    ...session,
    active: false,
    endedAt: new Date().toISOString(),
  };
}
