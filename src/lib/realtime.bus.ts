type Listener = (event: any) => void;

const listeners = new Set<Listener>();

export function publish(event: any) {
  for (const l of listeners) l(event);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
