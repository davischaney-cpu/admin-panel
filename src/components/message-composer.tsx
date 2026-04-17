"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";

type MessageComposerProps = {
  leadId?: string | null;
  jobId?: string | null;
  email?: string | null;
  phone?: string | null;
  label: string;
};

export function MessageComposer({ leadId, jobId, email, phone, label }: MessageComposerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  const defaultChannel = hasEmail ? "EMAIL" : "SMS";
  const [channel, setChannel] = useState<"EMAIL" | "SMS">(defaultChannel);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const destination = useMemo(() => (channel === "EMAIL" ? email : phone) ?? "", [channel, email, phone]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        jobId,
        channel,
        to: destination,
        subject: channel === "EMAIL" ? subject : undefined,
        body,
      }),
    });

    const data = await response.json() as { error?: string };

    startTransition(() => {
      if (response.ok) {
        showToast(`${channel === "EMAIL" ? "Email" : "SMS"} sent.`);
        setBody("");
        setSubject("");
        router.refresh();
      } else {
        showToast(data.error ?? "Could not send message.");
      }
    });
  }

  return (
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Message {label}</h3>
          <p className="mt-1 text-sm text-slate-600">Send email or SMS from inside the app.</p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="flex gap-2 rounded-2xl bg-[#f7fbff] p-1">
          <button type="button" onClick={() => setChannel("EMAIL")} disabled={!hasEmail} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${channel === "EMAIL" ? "bg-[#163f87] text-white" : "text-slate-700"} disabled:cursor-not-allowed disabled:opacity-50`}>Email</button>
          <button type="button" onClick={() => setChannel("SMS")} disabled={!hasPhone} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${channel === "SMS" ? "bg-[#163f87] text-white" : "text-slate-700"} disabled:cursor-not-allowed disabled:opacity-50`}>SMS</button>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
          <p className="text-sm text-slate-600">To</p>
          <p className="mt-1 font-medium text-slate-900">{destination || `No ${channel === "EMAIL" ? "email" : "phone"} on file`}</p>
        </div>

        {channel === "EMAIL" ? (
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Subject</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-2xl border border-blue-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#163f87]" placeholder="Appointment update" />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">Message</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} className="w-full rounded-2xl border border-blue-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#163f87]" placeholder={channel === "EMAIL" ? "Write your email..." : "Write your text message..."} />
        </label>

        <button type="submit" disabled={pending || !destination || !body || (channel === "EMAIL" && !subject)} className="rounded-2xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {pending ? "Sending..." : `Send ${channel === "EMAIL" ? "email" : "SMS"}`}
        </button>
      </form>
    </div>
  );
}
