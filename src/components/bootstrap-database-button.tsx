"use client";

import { useState, useTransition } from "react";

export function BootstrapDatabaseButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    setMessage(null);
    const response = await fetch("/api/bootstrap", { method: "POST" });
    const data = (await response.json()) as { error?: string };

    startTransition(() => {
      setMessage(response.ok ? "Your Clerk user was synced into Postgres." : data.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Syncing..." : "Sync my user to database"}
      </button>
      {message ? <p className="mt-3 text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
