"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/toast-provider";

export function NotificationsCard() {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  async function sendTest() {
    const response = await fetch("/api/notifications/test", { method: "POST" });
    const data = await response.json() as { message?: string; error?: string };
    startTransition(() => {
      showToast(data.message ?? data.error ?? "Notification action finished.");
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-zinc-400">Notifications</p>
      <h3 className="mt-1 text-xl font-semibold">Follow-up alerts</h3>
      <p className="mt-2 text-sm text-zinc-500">Turn on reminders for overdue follow-ups and tomorrow’s jobs.</p>
      <div className="mt-5 space-y-3">
        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
          <span>Email reminders</span>
          <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
          <span>SMS reminders</span>
          <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
        </label>
      </div>
      <button onClick={sendTest} disabled={pending} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-60">
        Send test notification
      </button>
    </div>
  );
}
