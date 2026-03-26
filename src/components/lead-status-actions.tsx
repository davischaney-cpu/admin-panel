"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

const statuses = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "LOST"] as const;

export function LeadStatusActions({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  async function updateStatus(nextStatus: string) {
    const previous = status;
    setStatus(nextStatus);
    showToast(`Status set to ${nextStatus}.`);

    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    startTransition(() => {
      if (!response.ok) {
        setStatus(previous);
        showToast("Could not update status.");
      }
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => updateStatus(e.target.value)}
      className="w-full rounded-xl border-2 border-blue-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none"
    >
      {statuses.map((value) => (
        <option key={value} value={value}>{value}</option>
      ))}
    </select>
  );
}
