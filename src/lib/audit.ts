export function logEvent(
  orderId: string,
  event: string,
  meta?: Record<string, unknown>
) {
  console.log("[AUDIT]", { orderId, event, meta });
}

export function ensureAuditTable() {
  return true;
}
