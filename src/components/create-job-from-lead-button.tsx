"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

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
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function handleCreate() {
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
      showToast(response.ok ? "Job created." : data.error ?? "Could not create job.");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleCreate}
      disabled={pending}
      className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create job"}
    </button>
  );
}
