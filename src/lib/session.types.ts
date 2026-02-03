/**
 * Temporary stub to satisfy Next build.
 * Replace with real session schema later.
 */
export type Session = {
  sessionId: string;
  table: string;
  status?: string;
  createdAt: string;
  closedAt?: string | null;
};
