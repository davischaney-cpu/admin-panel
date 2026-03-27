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
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <p className="text-sm text-slate-600">Sales demo</p>
      <h3 className="mt-1 text-xl font-semibold text-slate-900">Demo workspace controls</h3>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => run("/api/demo/seed", "Demo data loaded.")} disabled={pending} className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12346f] disabled:opacity-60">
          Load demo data
        </button>
        <button onClick={() => run("/api/demo/reset", "Demo data cleared.")} disabled={pending} className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] hover:bg-blue-50 disabled:opacity-60">
          Clear workspace
        </button>
      </div>
    </div>
  );
}
