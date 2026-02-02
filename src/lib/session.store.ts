// src/lib/sessions.store.ts

export interface TableSession {
  table: string;
  startedAt: number;
  closedAt?: number;
}

const sessions: TableSession[] = [];

export function openSession(table: string) {
  const existing = sessions.find(
    s => s.table === table && !s.closedAt
  );
  if (existing) return existing;

  const session: TableSession = {
    table,
    startedAt: Date.now(),
  };
  sessions.push(session);
  return session;
}

export function closeSession(table: string) {
  const session = sessions.find(
    s => s.table === table && !s.closedAt
  );
  if (!session) return;
  session.closedAt = Date.now();
}

export function getActiveSession(table: string) {
  return sessions.find(
    s => s.table === table && !s.closedAt
  );
}

export function listActiveSessions() {
  return sessions.filter(s => !s.closedAt);
}
