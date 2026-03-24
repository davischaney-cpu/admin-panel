import { DashboardShell } from "@/components/dashboard-shell";
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
          <p className="mt-2 text-sm text-zinc-500">Track every inquiry, quote, callback, and booked customer from one place.</p>
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

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="pb-3 font-medium">Lead</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Next follow-up</th>
                <th className="pb-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.length ? leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 last:border-0">
                  <td className="py-4">
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-zinc-400">{lead.phone || lead.email || "No contact info"}</p>
                  </td>
                  <td className="py-4 text-zinc-300">{lead.serviceType}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(lead.status)}`}>{lead.status}</span>
                  </td>
                  <td className="py-4 text-zinc-300">{lead.source}</td>
                  <td className="py-4 text-zinc-300">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "—"}</td>
                  <td className="py-4 text-zinc-300">{formatCurrency(lead.estimatedCents)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">No leads yet. Next step is adding lead creation and import flows.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
