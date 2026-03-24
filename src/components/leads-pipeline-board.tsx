import Link from "next/link";
import { formatDateTime } from "@/lib/format";

type LeadRecord = {
  id: string;
  fullName: string;
  serviceType: string;
  phone: string | null;
  email: string | null;
  status: string;
  source: string;
  nextFollowUpAt: Date | null;
  estimatedCents: number | null;
  location: string | null;
};

const columns = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "LOST"] as const;

function formatCurrency(cents?: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function LeadsPipelineBoard({ leads }: { leads: LeadRecord[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pipeline board</h3>
          <p className="text-sm text-zinc-400">A quick read on where every lead stands.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {columns.map((column) => {
          const items = leads.filter((lead) => lead.status === column);
          return (
            <div key={column} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-100">{column}</h4>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">{items.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {items.length ? items.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{lead.fullName}</p>
                        <p className="text-sm text-zinc-400">{lead.serviceType}</p>
                      </div>
                      <span className="text-xs text-zinc-500">{formatCurrency(lead.estimatedCents)}</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{lead.location || lead.source}</p>
                    <p className="mt-1 text-xs text-cyan-300">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                  </Link>
                )) : <p className="text-xs text-zinc-500">No leads here.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
