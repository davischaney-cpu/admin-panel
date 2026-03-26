import Link from "next/link";
import { CreateLeadPanel } from "@/components/create-lead-panel";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadFollowUpActions } from "@/components/lead-follow-up-actions";
import { LeadStatusActions } from "@/components/lead-status-actions";
import { LeadsPipelineBoard } from "@/components/leads-pipeline-board";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type LeadsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

function urgencyClasses(urgency: string) {
  switch (urgency) {
    case "HIGH":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20";
    case "LOW":
      return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20";
    default:
      return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20";
  }
}

function queueLabel(queue: string) {
  switch (queue) {
    case "OVERDUE":
      return "Needs attention";
    case "TODAY":
      return "Due today";
    case "NO_FOLLOW_UP":
      return "No follow-up";
    case "READY_TO_CLOSE":
      return "Ready to close";
    default:
      return "All leads";
  }
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewLeads")) {
    return <UnauthorizedState email={email} />;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getSearchParam(resolvedSearchParams.q)?.trim().toLowerCase() ?? "";
  const queueFilter = getSearchParam(resolvedSearchParams.queue) ?? "ALL";
  const showPipeline = getSearchParam(resolvedSearchParams.pipeline) === "1";

  const leads = await db.lead.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  const threeDays = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const overdueLeads = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt < now);
  const todayLeads = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= tomorrow);
  const noFollowUpLeads = leads.filter((lead) => !lead.nextFollowUpAt && lead.status !== "COMPLETED" && lead.status !== "LOST");
  const readyToClose = leads.filter((lead) => lead.status === "QUOTED" || lead.status === "BOOKED");
  const recentLeads = leads.slice(0, 8);

  const filteredLeads = leads.filter((lead) => {
    const matchesQuery = !query || [lead.fullName, lead.company, lead.serviceType, lead.location, lead.phone, lead.email]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));

    const matchesQueue =
      queueFilter === "ALL"
        ? true
        : queueFilter === "OVERDUE"
          ? Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt < now)
          : queueFilter === "TODAY"
            ? Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= tomorrow)
            : queueFilter === "NO_FOLLOW_UP"
              ? !lead.nextFollowUpAt
              : queueFilter === "READY_TO_CLOSE"
                ? lead.status === "QUOTED" || lead.status === "BOOKED"
                : true;

    return matchesQuery && matchesQueue;
  });

  const savedViews = [
    { label: "All leads", queue: "ALL", count: leads.length },
    { label: "Needs attention", queue: "OVERDUE", count: overdueLeads.length },
    { label: "Due today", queue: "TODAY", count: todayLeads.length },
    { label: "No follow-up", queue: "NO_FOLLOW_UP", count: noFollowUpLeads.length },
    { label: "Ready to close", queue: "READY_TO_CLOSE", count: readyToClose.length },
  ];

  const attentionLeads = [...overdueLeads, ...todayLeads.filter((lead) => !overdueLeads.some((item) => item.id === lead.id))].slice(0, 6);

  return (
    <DashboardShell email={email} role={role} currentPath="/leads">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Lead management</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">A clearer workspace for triaging new inquiries, following up on time, and moving people from quote to booked work.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={showPipeline ? "/leads" : "/leads?pipeline=1"} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">
            {showPipeline ? "Hide pipeline" : "Show pipeline"}
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Total leads</p>
          <p className="mt-3 text-3xl font-semibold">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 p-5">
          <p className="text-sm text-rose-100/80">Needs attention</p>
          <p className="mt-3 text-3xl font-semibold text-white">{overdueLeads.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5">
          <p className="text-sm text-cyan-100/80">Due today</p>
          <p className="mt-3 text-3xl font-semibold text-white">{todayLeads.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-5">
          <p className="text-sm text-emerald-100/80">Ready to close</p>
          <p className="mt-3 text-3xl font-semibold text-white">{readyToClose.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.45fr]">
        <div className="space-y-6">
          {hasPermission("createLeads") ? (
            <CreateLeadPanel />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-zinc-400">Lead creation</p>
              <h3 className="mt-1 text-xl font-semibold">Read-only access</h3>
              <p className="mt-2 text-sm text-zinc-500">Your role can view leads, but cannot create new ones.</p>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Saved views</h3>
            <p className="mt-1 text-sm text-zinc-400">Jump straight to the kind of work you need to handle.</p>
            <div className="mt-5 space-y-3">
              {savedViews.map((view) => {
                const active = queueFilter === view.queue;
                return (
                  <Link
                    key={view.queue}
                    href={view.queue === "ALL" ? "/leads" : `/leads?queue=${view.queue}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${active ? "border-cyan-300 bg-cyan-400/10" : "border-white/10 bg-black/20 hover:bg-white/10"}`}
                  >
                    <span className="text-sm text-white">{view.label}</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{view.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Needs attention</h3>
                <p className="text-sm text-zinc-400">Overdue and due-today follow-ups, surfaced first.</p>
              </div>
              <Link href="/leads?queue=OVERDUE" className="text-sm text-cyan-300 hover:text-cyan-200">Open view</Link>
            </div>

            <div className="mt-5 space-y-3">
              {attentionLeads.length ? attentionLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{lead.fullName}</p>
                      <p className="text-sm text-zinc-400">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(lead.status)}`}>{lead.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs ${urgencyClasses(lead.urgency)}`}>{lead.urgency}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">{formatCurrency(lead.estimatedCents)}</span>
                  </div>
                  <p className="mt-3 text-xs text-cyan-300">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  Nothing urgent right now.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{queueLabel(queueFilter)}</h3>
                <p className="text-sm text-zinc-400">A simpler list view with the next action visible on every lead.</p>
              </div>
              <form className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by name, service, location, phone, or email"
                  className="min-w-[280px] rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none"
                />
                {queueFilter !== "ALL" ? <input type="hidden" name="queue" value={queueFilter} /> : null}
                <button type="submit" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">Search</button>
              </form>
            </div>

            <div className="mt-6 space-y-4">
              {filteredLeads.length ? filteredLeads.map((lead) => {
                const needsAttention = Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt < now);
                const dueSoon = Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= threeDays);

                return (
                  <div key={lead.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/leads/${lead.id}`} className="text-lg font-semibold text-white hover:text-cyan-200">{lead.fullName}</Link>
                          <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(lead.status)}`}>{lead.status}</span>
                          <span className={`rounded-full px-3 py-1 text-xs ${urgencyClasses(lead.urgency)}`}>{lead.urgency}</span>
                          {needsAttention ? <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs text-rose-300">Needs attention</span> : null}
                          {!needsAttention && dueSoon ? <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">Due soon</span> : null}
                        </div>

                        <p className="mt-2 text-sm text-zinc-300">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                          <span>{lead.phone || lead.email || "No contact info"}</span>
                          <span>{lead.source}</span>
                          <span>{formatCurrency(lead.estimatedCents)}</span>
                          <span>{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                        {hasPermission("editLeads") ? (
                          <div>
                            <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Status</p>
                            <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
                          </div>
                        ) : null}
                        {hasPermission("editLeads") ? (
                          <div>
                            <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Next follow-up</p>
                            <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                  No leads match this view yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recently added</h3>
                <p className="text-sm text-zinc-400">A quick list of the latest inquiries hitting the system.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recentLeads.length ? recentLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                  <div>
                    <p className="font-medium text-white">{lead.fullName}</p>
                    <p className="mt-1 text-sm text-zinc-400">{lead.serviceType}</p>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <p>{formatDateTime(lead.createdAt)}</p>
                    <p className="mt-1">{lead.location || lead.source}</p>
                  </div>
                </Link>
              )) : null}
            </div>
          </div>

          {showPipeline ? <LeadsPipelineBoard leads={filteredLeads} /> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
