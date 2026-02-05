export function requireStaff(req: Request) {
  const key = req.headers.get("x-staff-key") || "";
  const expected = process.env.STAFF_KEY || "";
  if (!expected || expected === "change-me-now") {
    throw new Error("STAFF_KEY not set securely in .env");
  }
  if (key !== expected) {
    const err: any = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
}
