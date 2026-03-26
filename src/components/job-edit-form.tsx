"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";

const statusOptions = ["DRAFT", "QUOTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const quoteStatusOptions = ["DRAFT", "SENT", "APPROVED", "DECLINED"] as const;
const invoiceStatusOptions = ["NOT_SENT", "SENT", "PAID", "OVERDUE"] as const;

function toLocalInputValue(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function JobEditForm({
  jobId,
  initial,
}: {
  jobId: string;
  initial: {
    title: string;
    serviceType: string;
    status: string;
    quoteStatus: string;
    invoiceStatus: string;
    scheduledFor?: string | null;
    quotedCents?: number | null;
    finalCents?: number | null;
    address?: string | null;
    notes?: string | null;
  };
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const emptyState = {
    title: initial.title,
    serviceType: initial.serviceType,
    status: initial.status,
    quoteStatus: initial.quoteStatus,
    invoiceStatus: initial.invoiceStatus,
    scheduledFor: toLocalInputValue(initial.scheduledFor),
    quotedDollars: initial.quotedCents != null ? String(initial.quotedCents / 100) : "",
    finalDollars: initial.finalCents != null ? String(initial.finalCents / 100) : "",
    address: initial.address ?? "",
    notes: initial.notes ?? "",
  };
  const [form, setForm] = useState(() => loadDraft(`job-edit-draft:${jobId}`, emptyState));

  useEffect(() => {
    saveDraft(`job-edit-draft:${jobId}`, form);
  }, [form, jobId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        serviceType: form.serviceType,
        status: form.status,
        quoteStatus: form.quoteStatus,
        invoiceStatus: form.invoiceStatus,
        scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : null,
        quotedCents: form.quotedDollars ? Math.round(Number(form.quotedDollars) * 100) : null,
        finalCents: form.finalDollars ? Math.round(Number(form.finalDollars) * 100) : null,
        address: form.address,
        notes: form.notes,
      }),
    });

    const data = (await response.json()) as { error?: string };

    startTransition(() => {
      showToast(response.ok ? "Job updated." : data.error ?? "Could not update job.");
      if (response.ok) clearDraft(`job-edit-draft:${jobId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Edit job</h3>
          <p className="text-sm text-slate-700">Update scheduling, quote flow, invoice flow, value, and notes.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job title" className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="Service type" className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input type="datetime-local" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <select value={form.quoteStatus} onChange={(e) => setForm({ ...form, quoteStatus: e.target.value })} className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
          {quoteStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={form.invoiceStatus} onChange={(e) => setForm({ ...form, invoiceStatus: e.target.value })} className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
          {invoiceStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <input value={form.quotedDollars} onChange={(e) => setForm({ ...form, quotedDollars: e.target.value })} placeholder="Quoted value ($)" className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <input value={form.finalDollars} onChange={(e) => setForm({ ...form, finalDollars: e.target.value })} placeholder="Final value ($)" className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none sm:col-span-2" />
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="min-h-32 rounded-2xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none sm:col-span-2" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f] disabled:opacity-60">
          {pending ? "Saving..." : "Save job"}
        </button>
        <p className="text-xs text-slate-600">Draft autosaves locally while you edit.</p>
      </div>
    </form>
  );
}
