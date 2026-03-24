"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

export function DemoDataControls() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  async function run(path: string, successMessage: string) {
    const response = await fetch(path, { method: "POST" });
    const data = await response.json() as { error?: string; message?: string };
    startTransition(() => {
      showToast(response.ok ? successMessage : data.error ?? data.message ?? "Action failed.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-zinc-400">Sales demo</p>
      <h3 className="mt-1 text-xl font-semibold">Demo workspace controls</h3>
      <p className="mt-2 text-sm text-zinc-500">Load a clean sample pipeline for demos or wipe it back to empty.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => run("/api/demo/seed", "Demo data loaded.")} disabled={pending} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60">
          Load demo data
        </button>
        <button onClick={() => run("/api/demo/reset", "Demo data cleared.")} disabled={pending} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-60">
          Clear workspace
        </button>
      </div>
    </div>
  );
}
