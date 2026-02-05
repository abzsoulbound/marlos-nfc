"use client";

export default function StaffPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Staff</h1>
      <ul>
        <li><a href="/staff/sessions">Sessions + table assignment + close tab</a></li>
        <li><a href="/staff/ops">Recovery ops (reassign/merge)</a></li>
        <li><a href="/kitchen">Kitchen screen</a></li>
        <li><a href="/bar">Bar screen</a></li>
      </ul>
    </main>
  );
}
