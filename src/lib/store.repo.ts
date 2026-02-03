/**
 * Temporary in-memory stores to satisfy Next build.
 * Replace with real persistence later.
 */

type AnyMapStore<T> = {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
  delete: (key: string) => void;
  values: () => T[];
  getAll: () => T[];
};

function createStore<T>(): AnyMapStore<T> {
  const m = new Map<string, T>();
  const values = () => Array.from(m.values());
  return {
    get: (key) => m.get(key) ?? null,
    set: (key, value) => void m.set(key, value),
    delete: (key) => void m.delete(key),
    values,
    getAll: values,
  };
}

export const billStore = createStore<any>();
export const orderStore = createStore<any>();
export const sessionStore = createStore<any>();
