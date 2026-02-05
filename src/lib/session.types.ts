export interface Session {
  id: string;
  tableId: string;
  createdAt: string;
  closedAt?: string;
  active: boolean;
}
