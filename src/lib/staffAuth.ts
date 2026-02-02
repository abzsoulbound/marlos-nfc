// src/lib/staffAuth.ts

export function isStaff(req: Request): boolean {
  return req.headers.get("x-staff-key") === process.env.STAFF_KEY;
}
