// store.memory.ts
// In-memory implementation. Deterministic. No side effects.

import type { Store } from "./store.types";

export class MemoryStore<T> implements Store<T> {
  private data = new Map<string, T>();

  get(id: string): T | null {
    return this.data.get(id) ?? null;
  }

  getAll(): T[] {
    return Array.from(this.data.values());
  }

  set(id: string, value: T): void {
    this.data.set(id, value);
  }

  delete(id: string): void {
    this.data.delete(id);
  }
}
