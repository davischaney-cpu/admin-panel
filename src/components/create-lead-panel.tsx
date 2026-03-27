"use client";

import { useState } from "react";
import { CreateLeadForm } from "@/components/create-lead-form";

export function CreateLeadPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">New lead</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Add a fresh inquiry fast</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          {open ? "Close form" : "New lead"}
        </button>
      </div>

      {open ? <div className="mt-6"><CreateLeadForm compact /></div> : null}
    </div>
  );
}
