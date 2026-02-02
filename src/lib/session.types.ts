// session.types.ts
// Table / NFC session lifecycle.

export type SessionStatus =
  | "open"
  | "locked"
  | "closed";

export interface Session {
  id: string;           // server id
  tableId: string;      // NFC table
  openedAt: string;     // ISO
  closedAt?: string;    // ISO
  status: SessionStatus;

  activeOrderIds: string[]; // staggered orders allowed
}
