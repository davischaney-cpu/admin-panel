"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

export function QuoteActions({ jobId, quoteStatus }: { jobId: string; quoteStatus: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function updateQuoteStatus(nextStatus: "SENT" | "APPROVED" | "DECLINED") {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteStatus: nextStatus }),
    });

    const data = await response.json() as { error?: string };

    startTransition(() => {
      showToast(response.ok ? `Quote marked ${nextStatus.toLowerCase()}.` : data.error ?? "Could not update quote status.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={pending || quoteStatus === "SENT"}
        onClick={() => updateQuoteStatus("SENT")}
        className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f] disabled:opacity-60"
      >
        Mark sent
      </button>
      <button
        type="button"
        disabled={pending || quoteStatus === "APPROVED"}
        onClick={() => updateQuoteStatus("APPROVED")}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        Approve quote
      </button>
      <button
        type="button"
        disabled={pending || quoteStatus === "DECLINED"}
        onClick={() => updateQuoteStatus("DECLINED")}
        className="rounded-xl border-2 border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
      >
        Decline quote
      </button>
    </div>
  );
}
