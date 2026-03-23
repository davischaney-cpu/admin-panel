"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CanvasSyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setMessage(null);
    const response = await fetch("/api/canvas/sync", { method: "POST" });
    const data = (await response.json()) as { error?: string; courseCount?: number; assignmentCount?: number };

    startTransition(() => {
      if (response.ok) {
        setMessage(`Synced ${data.courseCount ?? 0} courses and ${data.assignmentCount ?? 0} assignments.`);
        router.refresh();
      } else {
        setMessage(data.error ?? "Canvas sync failed.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        onClick={handleSync}
        disabled={pending}
        className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Syncing Canvas..." : "Sync Canvas now"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
