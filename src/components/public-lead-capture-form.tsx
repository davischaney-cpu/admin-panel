"use client";

import { useState, useTransition } from "react";

export function PublicLeadCaptureForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", serviceType: "", location: "", notes: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const response = await fetch("/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json() as { error?: string };
    startTransition(() => {
      if (response.ok) {
        setMessage("Request sent. We’ll follow up soon.");
        setForm({ fullName: "", phone: "", email: "", serviceType: "", location: "", notes: "" });
      } else {
        setMessage(data.error ?? "Could not submit request.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-black/20 p-6">
      <h3 className="text-lg font-semibold">Request a demo / join waitlist</h3>
      <p className="mt-2 text-sm text-zinc-400">See if DavyG CRM fits your business.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Business / service type" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City / market" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none sm:col-span-2" />
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What are you using now? What’s messy?" className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none sm:col-span-2" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-200 disabled:opacity-60">
          {pending ? "Sending..." : "Submit"}
        </button>
        {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
      </div>
    </form>
  );
}
