"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SeedDemoButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeed() {
    setMessage(null);
    const response = await fetch("/api/demo/seed", { method: "POST" });
    const data = await response.json() as { error?: string };

    startTransition(() => {
      if (response.ok) {
        setMessage("Demo CRM data loaded.");
        router.refresh();
      } else {
        setMessage(data.error ?? "Could not seed demo data.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        onClick={handleSeed}
        disabled={pending}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Loading demo data..." : "Load demo CRM data"}
      </button>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
