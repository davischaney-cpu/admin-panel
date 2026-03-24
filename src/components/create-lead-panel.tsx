"use client";

import { useState } from "react";
import { CreateLeadForm } from "@/components/create-lead-form";

export function CreateLeadPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">New lead</p>
          <h3 className="mt-1 text-xl font-semibold">Add a fresh inquiry fast</h3>
          <p className="mt-2 text-sm text-zinc-500">Keep the main leads screen cleaner and open the form only when you need it.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
        >
          {open ? "Close form" : "New lead"}
        </button>
      </div>

      {open ? <div className="mt-6"><CreateLeadForm compact /></div> : null}
    </div>
  );
}
