"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const starter = JSON.stringify([
  { courseId: "5212", grade: "85.38%" },
  { courseId: "5153", grade: "94.32%" }
], null, 2);

export function ImportGradesForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(starter);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImport() {
    setMessage(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setMessage("That JSON is invalid.");
      return;
    }

    const response = await fetch("/api/canvas/import-grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });

    const data = (await response.json()) as { error?: string; imported?: number };

    startTransition(() => {
      if (response.ok) {
        setMessage(`Imported ${data.imported ?? 0} grade rows.`);
        router.refresh();
      } else {
        setMessage(data.error ?? "Import failed.");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold">Import Better Canvas grades</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Paste the Better Canvas grade JSON here and save it into Postgres.
      </p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-4 min-h-56 w-full rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-white outline-none"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleImport}
          disabled={pending}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60"
        >
          {pending ? "Importing..." : "Import grades"}
        </button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </div>
    </div>
  );
}
