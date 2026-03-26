"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

function toLocalInputValue(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function InvoiceBuilder({
  jobId,
  quoteTotalCents,
  finalCents,
  invoiceStatus,
  invoiceDueAt,
  invoiceMemo,
}: {
  jobId: string;
  quoteTotalCents?: number | null;
  finalCents?: number | null;
  invoiceStatus: string;
  invoiceDueAt?: string | null;
  invoiceMemo?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [amountDollars, setAmountDollars] = useState(String(((finalCents ?? quoteTotalCents ?? 0) / 100) || 0));
  const [dueAt, setDueAt] = useState(toLocalInputValue(invoiceDueAt));
  const [memo, setMemo] = useState(invoiceMemo ?? "");

  async function saveInvoice(nextStatus?: string) {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalCents: Math.round((Number(amountDollars || "0") || 0) * 100),
        invoiceDueAt: dueAt ? new Date(dueAt).toISOString() : null,
        invoiceMemo: memo,
        ...(nextStatus ? { invoiceStatus: nextStatus } : {}),
      }),
    });

    const data = await response.json() as { error?: string };
    startTransition(() => {
      showToast(response.ok ? (nextStatus ? `Invoice marked ${nextStatus.toLowerCase()}.` : "Invoice saved.") : data.error ?? "Could not update invoice.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Invoice builder</h3>
          <p className="text-sm text-slate-700">Turn the finished quote into an invoice with a due date and payment state.</p>
        </div>
        <span className="rounded-full bg-[#e8f1ff] px-3 py-1 text-xs font-medium text-[#163f87]">{invoiceStatus}</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#f7fbff] p-4">
          <p className="text-sm text-slate-600">Invoice amount</p>
          <input type="number" min="0" step="0.01" value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
          <p className="mt-2 text-xs text-slate-600">Current total: {formatCurrency(Math.round((Number(amountDollars || "0") || 0) * 100))}</p>
        </div>
        <div className="rounded-2xl bg-[#f7fbff] p-4">
          <p className="text-sm text-slate-600">Due date</p>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f7fbff] p-4">
        <p className="text-sm text-slate-600">Invoice memo</p>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Payment instructions, service notes, thank-you message..." className="mt-3 min-h-24 w-full rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={pending} onClick={() => saveInvoice()} className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f] disabled:opacity-60">Save invoice</button>
        <button type="button" disabled={pending || invoiceStatus === "SENT"} onClick={() => saveInvoice("SENT")} className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] hover:bg-blue-50 disabled:opacity-60">Mark sent</button>
        <button type="button" disabled={pending || invoiceStatus === "PAID"} onClick={() => saveInvoice("PAID")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">Mark paid</button>
        <button type="button" disabled={pending || invoiceStatus === "OVERDUE"} onClick={() => saveInvoice("OVERDUE")} className="rounded-xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-60">Mark overdue</button>
      </div>
    </div>
  );
}
