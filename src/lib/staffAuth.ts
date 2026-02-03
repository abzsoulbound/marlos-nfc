import { StaffRole } from "@prisma/client";

/**
 * Temporary auth passthrough.
 * Replace with real Staff model later.
 */
export async function requireStaff(
  _pin: string,
  _allowed: StaffRole[]
) {
  return {
    ok: true,
    role: StaffRole.FLOOR,
  };
}
