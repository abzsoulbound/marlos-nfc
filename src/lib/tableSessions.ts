type TableSession = {
  tableId: string;
  active: boolean;
  createdAt: number;
};

const sessions = new Map<string, TableSession>();

export async function getOrCreateSession(tableId: string) {
  const existing = sessions.get(tableId);
  if (existing && existing.active) return existing;

  const session: TableSession = {
    tableId,
    active: true,
    createdAt: Date.now(),
  };

  sessions.set(tableId, session);
  return session;
}

export async function closeSession(tableId: string) {
  const existing = sessions.get(tableId);
  if (!existing) return;

  sessions.set(tableId, {
    ...existing,
    active: false,
  });
}
