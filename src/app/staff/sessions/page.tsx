"use client";

import { useEffect, useState } from "react";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function StaffSessionsPage() {
  const [staffKey, setStaffKey] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setStaffKey(getKey()), []);

  async function load() {
    setErr(null);
    const res = await fetch("/api/sessions", {
      headers: { "x-staff-key": staffKey },
    });
    if (!res.ok) {
      setErr("HTTP " + res.status);
      return;
    }
    const data = await res.json();
    setSessions(data.sessions ?? []);
  }

  useEffect(() => {
    if (staffKey) load();
  }, [staffKey]);

  async function assign(tagId: string, tableNumber: string) {
    const res = await fetch("/api/staff/ops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ action: "assignTable", tagId, tableNumber, confirmed: true }),
    });
    if (!res.ok) throw new Error("assign failed " + res.status);
    await load();
  }

  async function closeTab(tagId: string) {
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify({ tagId }),
    });
    if (!res.ok) throw new Error("close failed " + res.status);
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Staff — Sessions</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Staff key</span>
          <input
            value={staffKey}
            onChange={(e) => {
              setStaffKey(e.target.value);
              localStorage.setItem("STAFF_KEY", e.target.value);
            }}
            placeholder="STAFF_KEY"
            style={{ padding: 8, width: 280 }}
          />
        </label>
        <button onClick={() => load()} style={{ padding: "8px 12px" }}>Refresh</button>
      </div>

      {err && <p style={{ color: "red" }}>Error: {err}</p>}
      {sessions.length === 0 && !err && <p>No open sessions.</p>}

      {sessions.map((s) => (
        <div key={s.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <strong>{s.tableNumber ? `Table ${s.tableNumber}` : `Tag ${s.tagId}`}</strong>
            <span style={{ opacity: 0.8 }}>Opened {new Date(s.openedAt).toLocaleTimeString()}</span>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <AssignForm onAssign={(table) => assign(s.tagId, table)} />
            <button onClick={() => closeTab(s.tagId)} style={{ padding: "8px 10px" }}>
              Close tab
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}

function AssignForm({ onAssign }: { onAssign: (table: string) => void }) {
  const [table, setTable] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = table.trim();
        if (!t) return;
        onAssign(t);
        setTable("");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input
        value={table}
        onChange={(e) => setTable(e.target.value)}
        placeholder="Table #"
        style={{ padding: 8, width: 120 }}
      />
      <button type="submit" style={{ padding: "8px 10px" }}>
        Assign
      </button>
    </form>
  );
}
