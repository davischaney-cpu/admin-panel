"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ImportResponse = {
  error?: string;
  imported?: number;
  results?: Array<{ name: string; grade: number | null }>;
};

export function ImportCanvasFromBrowserButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport() {
    setMessage(null);
    const response = await fetch("/api/canvas/import-from-browser", { method: "POST" });
    const data = (await response.json()) as ImportResponse;

    startTransition(() => {
      if (response.ok) {
        setMessage(`Imported ${data.imported ?? 0} course grades from the Canvas grades pages.`);
        router.refresh();
      } else {
        setMessage(data.error ?? "Browser import failed.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        onClick={handleImport}
        disabled={pending}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Importing from browser..." : "Import from Canvas pages"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
