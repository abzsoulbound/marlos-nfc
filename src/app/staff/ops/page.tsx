"use client";

import { useEffect, useState } from "react";

function getKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("STAFF_KEY") || "";
}

export default function StaffOpsPage() {
  const [staffKey, setStaffKey] = useState("");
  const [oldTagId, setOldTagId] = useState("");
  const [newTagId, setNewTagId] = useState("");
  const [fromTagId, setFromTagId] = useState("");
  const [intoTagId, setIntoTagId] = useState("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => setStaffKey(getKey()), []);

  async function call(body: any) {
    setMsg("");
    const res = await fetch("/api/staff/ops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-staff-key": staffKey,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || ("HTTP " + res.status));
    setMsg("OK");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Staff — Recovery Ops</h1>

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
      </div>

      {msg && <p>{msg}</p>}

      <section style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <h2>Reassign tag</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={oldTagId} onChange={(e) => setOldTagId(e.target.value)} placeholder="Old tagId" style={{ padding: 8, width: 180 }} />
          <input value={newTagId} onChange={(e) => setNewTagId(e.target.value)} placeholder="New tagId" style={{ padding: 8, width: 180 }} />
          <button onClick={() => call({ action: "reassignTag", oldTagId, newTagId })} style={{ padding: "8px 10px" }}>
            Apply
          </button>
        </div>
      </section>

      <section style={{ border: "1px solid #ccc", padding: 12 }}>
        <h2>Merge sessions</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={fromTagId} onChange={(e) => setFromTagId(e.target.value)} placeholder="From tagId" style={{ padding: 8, width: 180 }} />
          <input value={intoTagId} onChange={(e) => setIntoTagId(e.target.value)} placeholder="Into tagId" style={{ padding: 8, width: 180 }} />
          <button onClick={() => call({ action: "mergeSessions", fromTagId, intoTagId })} style={{ padding: "8px 10px" }}>
            Merge
          </button>
        </div>
      </section>
    </main>
  );
}
