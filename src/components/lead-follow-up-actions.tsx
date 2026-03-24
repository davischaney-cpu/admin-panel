"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function toLocalInputValue(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function LeadFollowUpActions({ leadId, currentValue }: { leadId: string; currentValue?: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialValue = useMemo(() => toLocalInputValue(currentValue), [currentValue]);
  const [value, setValue] = useState(initialValue);

  async function save(nextValue: string) {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextFollowUpAt: nextValue ? new Date(nextValue).toISOString() : null }),
    });

    startTransition(() => {
      if (!response.ok) {
        setValue(initialValue);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="datetime-local"
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => save(e.target.value)}
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setValue("");
          void save("");
        }}
        className="text-left text-[11px] text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
      >
        Clear follow-up
      </button>
    </div>
  );
}
