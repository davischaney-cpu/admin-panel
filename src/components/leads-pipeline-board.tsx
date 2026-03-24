import { CreateJobFromLeadButton } from "@/components/create-job-from-lead-button";
import { LeadFollowUpActions } from "@/components/lead-follow-up-actions";
import { LeadStatusActions } from "@/components/lead-status-actions";
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
          <p className="text-sm text-zinc-400">Move leads through the funnel and keep follow-ups visible.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-6">
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
                  <div key={lead.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-sm text-zinc-400">{lead.serviceType}</p>
                    <p className="mt-1 text-xs text-zinc-500">{lead.phone || lead.email || "No contact info"}</p>
                    <p className="mt-2 text-xs text-zinc-500">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatCurrency(lead.estimatedCents)}{lead.location ? ` • ${lead.location}` : ""}</p>
                    <div className="mt-3 space-y-2">
                      <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
                      <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
                      <CreateJobFromLeadButton leadId={lead.id} fullName={lead.fullName} serviceType={lead.serviceType} estimatedCents={lead.estimatedCents} location={lead.location} />
                    </div>
                  </div>
                )) : <p className="text-xs text-zinc-500">No leads here.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
