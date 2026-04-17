import { MessageChannel, MessageStatus } from "@prisma/client";

type MessageItem = {
  id: string;
  channel: MessageChannel;
  status: MessageStatus;
  to: string;
  subject: string | null;
  body: string;
  sentAt: Date | null;
  createdAt: Date;
};

export function MessageHistory({ items }: { items: MessageItem[] }) {
  return (
    <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">Message history</h3>
        <span className="text-sm text-slate-600">{items.length} total</span>
      </div>

      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[#163f87] px-2.5 py-1 font-medium text-white">{item.channel}</span>
              <span className={`rounded-full px-2.5 py-1 font-medium ${item.status === "SENT" ? "bg-emerald-100 text-emerald-800" : item.status === "FAILED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{item.status}</span>
              <span className="text-slate-500">to {item.to}</span>
            </div>
            {item.subject ? <p className="mt-3 font-medium text-slate-900">{item.subject}</p> : null}
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
            <p className="mt-3 text-xs text-slate-500">{(item.sentAt ?? item.createdAt).toLocaleString()}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f7fbff] p-4 text-sm text-slate-700">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
