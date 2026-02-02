type Handler = (payload: any) => void

const handlers: Record<string, Handler[]> = {}

export function on(event: string, fn: Handler) {
  handlers[event] ??= []
  handlers[event].push(fn)
}

export function emit(event: string, payload: any) {
  handlers[event]?.forEach(h => h(payload))
}
