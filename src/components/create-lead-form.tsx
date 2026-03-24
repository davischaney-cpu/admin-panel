"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const sourceOptions = ["WEBSITE", "INSTAGRAM", "FACEBOOK", "GOOGLE", "REFERRAL", "PHONE"] as const;

export function CreateLeadForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "",
    source: "WEBSITE",
    location: "",
    estimatedDollars: "",
    notes: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        serviceType: form.serviceType,
        source: form.source,
        location: form.location,
        estimatedCents: form.estimatedDollars ? Math.round(Number(form.estimatedDollars) * 100) : null,
        notes: form.notes,
      }),
    });

    const data = await response.json() as { error?: string };

    startTransition(() => {
      if (response.ok) {
        setMessage("Lead created.");
        setForm({
          fullName: "",
          phone: "",
          email: "",
          serviceType: "",
          source: "WEBSITE",
          location: "",
          estimatedDollars: "",
          notes: "",
        });
        router.refresh();
      } else {
        setMessage(data.error ?? "Could not create lead.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "rounded-3xl border border-white/10 bg-black/20 p-4" : "rounded-3xl border border-white/10 bg-white/5 p-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Create lead</h3>
          <p className="text-sm text-zinc-400">Drop in a new inquiry fast.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Service type" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <input value={form.estimatedDollars} onChange={(e) => setForm({ ...form, estimatedDollars: e.target.value })} placeholder="Estimated value ($)" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500" />
        <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none sm:col-span-2">
          {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
        </select>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 sm:col-span-2" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Creating..." : "Create lead"}
        </button>
        {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
      </div>
    </form>
  );
}
