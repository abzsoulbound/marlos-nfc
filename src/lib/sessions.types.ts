export interface Session {
  id: string;
  tableId: string;
  active: boolean;
  startedAt: string;
  endedAt?: string;
}
