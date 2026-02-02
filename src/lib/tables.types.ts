// sessions.types.ts
// A session represents one active sitting at a table.
// One table → max one active session at a time.

export interface Session {
  id: string;        // session UUID
  tableId: string;   // references Table.id
  active: boolean;

  startedAt: number;
  endedAt?: number;
}
