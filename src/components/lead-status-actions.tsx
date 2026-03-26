"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const statuses = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "LOST"] as const;

export function LeadStatusActions({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  async function updateStatus(nextStatus: string) {
    setStatus(nextStatus);
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    startTransition(() => {
      if (!response.ok) {
        setStatus(currentStatus);
      }
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => updateStatus(e.target.value)}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none"
    >
      {statuses.map((value) => (
        <option key={value} value={value}>{value}</option>
      ))}
    </select>
  );
}
