"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CreateJobFromLeadButton({
  leadId,
  fullName,
  serviceType,
  estimatedCents,
  location,
}: {
  leadId: string;
  fullName: string;
  serviceType: string;
  estimatedCents?: number | null;
  location?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate() {
    setMessage(null);
    const scheduledFor = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString();

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        title: `${fullName} ${serviceType}`,
        serviceType,
        scheduledFor,
        quotedCents: estimatedCents ?? null,
        address: location ?? null,
      }),
    });

    const data = await response.json() as { error?: string };

    startTransition(() => {
      setMessage(response.ok ? "Job created." : data.error ?? "Could not create job.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleCreate}
        disabled={pending}
        className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create job"}
      </button>
      {message ? <p className="text-[11px] text-zinc-500">{message}</p> : null}
    </div>
  );
}
