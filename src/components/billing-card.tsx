"use client";

import { useTransition } from "react";
import { useToast } from "@/components/toast-provider";

export function BillingCard() {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function startCheckout(plan: string) {
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json() as { message?: string; error?: string };
    startTransition(() => {
      showToast(data.message ?? data.error ?? "Billing action finished.");
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-zinc-400">Billing</p>
      <h3 className="mt-1 text-xl font-semibold">Stripe-ready pricing actions</h3>
      <p className="mt-2 text-sm text-zinc-500">The UI is here; live checkout just needs Stripe keys and product price IDs.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["STARTER", "Starter"],
          ["PRO", "Pro"],
          ["TEAM", "Team"],
        ].map(([value, label]) => (
          <button key={value} onClick={() => startCheckout(value)} disabled={pending} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left hover:bg-white/10 disabled:opacity-60">
            <p className="font-medium">{label}</p>
            <p className="mt-1 text-sm text-zinc-500">Start checkout</p>
          </button>
        ))}
      </div>
    </div>
  );
}
