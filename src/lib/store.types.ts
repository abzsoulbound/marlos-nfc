// store.types.ts
// Generic persistence contracts. Swappable later for DB.

export interface Store<T> {
  get(id: string): T | null;
  getAll(): T[];
  set(id: string, value: T): void;
  delete(id: string): void;
}
