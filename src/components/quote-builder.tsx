"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

type QuoteItem = {
  id?: string;
  label: string;
  description?: string | null;
  quantity: number;
  unitCents: number;
  position: number;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function QuoteBuilder({
  jobId,
  initialItems,
  initialTaxCents = 0,
  initialDiscountCents = 0,
}: {
  jobId: string;
  initialItems: QuoteItem[];
  initialTaxCents?: number | null;
  initialDiscountCents?: number | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<QuoteItem[]>(initialItems.length ? initialItems : [{ label: "Detail service", description: "", quantity: 1, unitCents: 0, position: 0 }]);
  const [taxDollars, setTaxDollars] = useState(String((initialTaxCents ?? 0) / 100));
  const [discountDollars, setDiscountDollars] = useState(String((initialDiscountCents ?? 0) / 100));

  const subtotalCents = items.reduce((sum, item) => sum + item.quantity * item.unitCents, 0);
  const taxCents = Math.round((Number(taxDollars || "0") || 0) * 100);
  const discountCents = Math.round((Number(discountDollars || "0") || 0) * 100);
  const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);

  function updateItem(index: number, patch: Partial<QuoteItem>) {
    setItems((current) => current.map((item, idx) => idx === index ? { ...item, ...patch } : item));
  }

  function addItem() {
    setItems((current) => [...current, { label: "", description: "", quantity: 1, unitCents: 0, position: current.length }]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, position: idx })));
  }

  async function saveQuote() {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteItems: items.map((item, index) => ({
          id: item.id,
          label: item.label,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          position: index,
        })),
        quoteTaxCents: taxCents,
        quoteDiscountCents: discountCents,
      }),
    });

    const data = await response.json() as { error?: string };
    startTransition(() => {
      showToast(response.ok ? "Quote saved." : data.error ?? "Could not save quote.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Quote builder</h3>
          <p className="text-sm text-slate-700">Build the quote with real line items instead of one flat number.</p>
        </div>
        <button type="button" onClick={addItem} className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] hover:bg-blue-50">
          Add line item
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={item.id ?? index} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={item.label} onChange={(e) => updateItem(index, { label: e.target.value })} placeholder="Line item label" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
              <input value={item.description ?? ""} onChange={(e) => updateItem(index, { description: e.target.value })} placeholder="Description" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
              <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })} placeholder="Qty" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
              <input type="number" min="0" step="0.01" value={item.unitCents / 100} onChange={(e) => updateItem(index, { unitCents: Math.max(0, Math.round((Number(e.target.value) || 0) * 100)) })} placeholder="Unit price" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">Line total: {formatCurrency(item.quantity * item.unitCents)}</p>
              <button type="button" onClick={() => removeItem(index)} className="text-sm text-rose-700 hover:text-rose-800">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="number" min="0" step="0.01" value={taxDollars} onChange={(e) => setTaxDollars(e.target.value)} placeholder="Tax ($)" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
        <input type="number" min="0" step="0.01" value={discountDollars} onChange={(e) => setDiscountDollars(e.target.value)} placeholder="Discount ($)" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none" />
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl bg-[#e8f1ff] p-4 text-sm text-slate-900 sm:grid-cols-3">
        <div>
          <p className="text-slate-600">Subtotal</p>
          <p className="mt-1 font-semibold">{formatCurrency(subtotalCents)}</p>
        </div>
        <div>
          <p className="text-slate-600">Tax / Discount</p>
          <p className="mt-1 font-semibold">{formatCurrency(taxCents)} / {formatCurrency(discountCents)}</p>
        </div>
        <div>
          <p className="text-slate-600">Quote total</p>
          <p className="mt-1 text-lg font-semibold text-[#163f87]">{formatCurrency(totalCents)}</p>
        </div>
      </div>

      <div className="mt-6">
        <button type="button" disabled={pending} onClick={saveQuote} className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f] disabled:opacity-60">
          {pending ? "Saving quote..." : "Save quote"}
        </button>
      </div>
    </div>
  );
}
