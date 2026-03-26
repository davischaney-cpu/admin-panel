"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

const sourceOptions = ["WEBSITE", "INSTAGRAM", "FACEBOOK", "GOOGLE", "REFERRAL", "PHONE"] as const;
const urgencyOptions = ["LOW", "MEDIUM", "HIGH"] as const;

export function CreateLeadForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "",
    source: "WEBSITE",
    urgency: "MEDIUM",
    location: "",
    estimatedDollars: "",
    notes: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        serviceType: form.serviceType,
        source: form.source,
        urgency: form.urgency,
        location: form.location,
        estimatedCents: form.estimatedDollars ? Math.round(Number(form.estimatedDollars) * 100) : null,
        notes: form.notes,
      }),
    });

    const data = (await response.json()) as { error?: string };

    startTransition(() => {
      if (response.ok) {
        showToast("Lead created.");
        setForm({
          fullName: "",
          phone: "",
          email: "",
          serviceType: "",
          source: "WEBSITE",
          urgency: "MEDIUM",
          location: "",
          estimatedDollars: "",
          notes: "",
        });
        router.refresh();
      } else {
        showToast(data.error ?? "Could not create lead.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "rounded-[24px] border border-slate-300 bg-slate-50 p-4" : "rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Create lead</h3>
          <p className="text-sm text-slate-600">Capture the basics fast, then enrich the lead later if needed.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Contact</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Service type" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Deal context</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <input value={form.estimatedDollars} onChange={(e) => setForm({ ...form, estimatedDollars: e.target.value })} placeholder="Estimated value ($)" className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
              {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
              {urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Notes</p>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What does the customer need? What matters? Any timing notes?" className="mt-3 min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Creating..." : "Create lead"}
        </button>
        <p className="text-xs text-slate-600">A follow-up is automatically scheduled for tomorrow so nothing falls through the cracks.</p>
      </div>
    </form>
  );
}
