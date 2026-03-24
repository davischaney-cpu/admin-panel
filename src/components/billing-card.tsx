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

    const data = await response.json() as { message?: string; error?: string; url?: string };
    startTransition(() => {
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      showToast(data.message ?? data.error ?? "Billing action finished.");
    });
  }

  async function openPortal() {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = await response.json() as { message?: string; error?: string; url?: string };
    startTransition(() => {
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      showToast(data.message ?? data.error ?? "Could not open billing portal.");
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Billing</p>
          <h3 className="mt-1 text-xl font-semibold">Stripe checkout</h3>
          <p className="mt-2 text-sm text-zinc-500">Upgrade to a paid plan or open the billing portal if Stripe is already connected.</p>
        </div>
        <button onClick={openPortal} disabled={pending} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-60">
          Billing portal
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["STARTER", "Starter", "$29/mo"],
          ["PRO", "Pro", "$79/mo"],
          ["TEAM", "Team", "$149/mo"],
        ].map(([value, label, price]) => (
          <button key={value} onClick={() => startCheckout(value)} disabled={pending} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left hover:bg-white/10 disabled:opacity-60">
            <p className="font-medium">{label}</p>
            <p className="mt-1 text-sm text-zinc-500">{price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
