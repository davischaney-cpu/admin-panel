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
    <div className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <p className="text-sm text-slate-500">Notifications</p>
      <h3 className="mt-1 text-xl font-semibold text-slate-900">Follow-up alerts</h3>
      <p className="mt-2 text-sm text-slate-500">Turn on reminders for overdue follow-ups and tomorrow’s jobs.</p>
      <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-800">
        Use this as your daily accountability layer for callbacks, booked jobs, and no-drop follow-up.
      </div>
      <div className="mt-5 space-y-3">
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800">
          <span>Email reminders</span>
          <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800">
          <span>SMS reminders</span>
          <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
        </label>
      </div>
      <button onClick={sendTest} disabled={pending} className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">
        Send test notification
      </button>
    </div>
  );
}
