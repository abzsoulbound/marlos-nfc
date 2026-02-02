// staff.types.ts
// Minimal staff-facing shapes. No auth, no roles.

export interface StaffActionResult {
  ok: boolean;
  message?: string;
}
