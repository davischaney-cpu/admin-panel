import Link from "next/link";
import { CreateLeadPanel } from "@/components/create-lead-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadsPipelineBoard } from "@/components/leads-pipeline-board";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

function formatCurrency(cents?: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function statusClasses(status: string) {
  switch (status) {
    case "NEW":
      return "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20";
    case "CONTACTED":
      return "bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/20";
    case "QUOTED":
      return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20";
    case "BOOKED":
      return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20";
    case "LOST":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20";
    default:
      return "bg-white/10 text-zinc-300 ring-1 ring-white/10";
  }
}

export default async function LeadsPage() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const leads = await db.lead.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <DashboardShell email={email} role={role} currentPath="/leads">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Pipeline</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h2>
          <p className="mt-2 text-sm text-zinc-500">Track inquiries, follow-ups, and booked customers without the clutter.</p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Total leads</p>
          <p className="mt-3 text-3xl font-semibold">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">New</p>
          <p className="mt-3 text-3xl font-semibold">{leads.filter((lead) => lead.status === "NEW").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Quoted</p>
          <p className="mt-3 text-3xl font-semibold">{leads.filter((lead) => lead.status === "QUOTED").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Booked</p>
          <p className="mt-3 text-3xl font-semibold">{leads.filter((lead) => lead.status === "BOOKED").length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
        <CreateLeadPanel />

        <div className="space-y-6">
          <LeadsPipelineBoard leads={leads} />

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent leads</h3>
                <p className="text-sm text-zinc-400">Compact list view — click into a lead to edit details.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {leads.length ? leads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-sm text-zinc-400">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                    <p className="mt-1 text-xs text-zinc-500">{lead.phone || lead.email || "No contact info"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(lead.status)}`}>{lead.status}</span>
                    <span className="text-zinc-400">{lead.source}</span>
                    <span className="text-zinc-500">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "No follow-up"}</span>
                    <span className="text-zinc-200">{formatCurrency(lead.estimatedCents)}</span>
                  </div>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  No leads yet. Create your first lead to start building the pipeline.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
