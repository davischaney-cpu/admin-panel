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
      return "bg-sky-100 text-sky-800";
    case "CONTACTED":
      return "bg-violet-100 text-violet-800";
    case "QUOTED":
      return "bg-amber-100 text-amber-800";
    case "BOOKED":
      return "bg-emerald-100 text-emerald-800";
    case "LOST":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function urgencyClasses(urgency: string) {
  switch (urgency) {
    case "HIGH":
      return "bg-rose-100 text-rose-800";
    case "LOW":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-amber-100 text-amber-800";
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
      <header className="rounded-[30px] bg-[#0f3d91] px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,61,145,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-blue-100/85">Lead management</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h2>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/85">A sharper workspace for triaging inquiries, assigning follow-ups, and moving people from quote to booked work.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={showPipeline ? "/leads" : "/leads?pipeline=1"} className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#0f3d91] transition hover:bg-blue-50">
              {showPipeline ? "Hide pipeline" : "Show pipeline"}
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-[#163f87] p-5 text-white shadow-[0_16px_36px_rgba(22,63,135,0.18)]">
          <p className="text-sm text-blue-100/80">Total leads</p>
          <p className="mt-3 text-3xl font-semibold">{leads.length}</p>
        </div>
        <div className="rounded-[28px] bg-[#b42318] p-5 text-white shadow-[0_16px_36px_rgba(180,35,24,0.18)]">
          <p className="text-sm text-rose-50/80">Needs attention</p>
          <p className="mt-3 text-3xl font-semibold">{overdueLeads.length}</p>
        </div>
        <div className="rounded-[28px] bg-[#0b79d0] p-5 text-white shadow-[0_16px_36px_rgba(11,121,208,0.18)]">
          <p className="text-sm text-sky-50/80">Due today</p>
          <p className="mt-3 text-3xl font-semibold">{todayLeads.length}</p>
        </div>
        <div className="rounded-[28px] bg-[#0f9960] p-5 text-white shadow-[0_16px_36px_rgba(15,153,96,0.18)]">
          <p className="text-sm text-emerald-50/80">Ready to close</p>
          <p className="mt-3 text-3xl font-semibold">{readyToClose.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.42fr]">
        <div className="space-y-6">
          {hasPermission("createLeads") ? (
            <CreateLeadPanel />
          ) : (
            <div className="rounded-[28px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <p className="text-sm font-medium text-slate-600">Lead creation</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Read-only access</h3>
              <p className="mt-2 text-sm text-slate-700">Your role can view leads, but cannot create new ones.</p>
            </div>
          )}

          <div className="rounded-[28px] border border-blue-200 bg-[#e8f1ff] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold text-slate-900">Saved views</h3>
            <p className="mt-1 text-sm text-slate-700">Jump straight to the kind of work you need to handle.</p>
            <div className="mt-5 space-y-3">
              {savedViews.map((view) => {
                const active = queueFilter === view.queue;
                return (
                  <Link
                    key={view.queue}
                    href={view.queue === "ALL" ? "/leads" : `/leads?queue=${view.queue}`}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${active ? "bg-[#163f87] text-white" : "bg-white text-slate-900 hover:bg-blue-50"}`}
                  >
                    <span className="text-sm font-medium">{view.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-white/15 text-white" : "bg-blue-100 text-blue-800"}`}>{view.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Needs attention</h3>
                <p className="text-sm text-slate-700">Overdue and due-today follow-ups, surfaced first.</p>
              </div>
              <Link href="/leads?queue=OVERDUE" className="text-sm font-medium text-[#163f87] hover:text-[#0f2f69]">Open view</Link>
            </div>

            <div className="mt-5 space-y-3">
              {attentionLeads.length ? attentionLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-2xl border border-blue-200 bg-[#f4f8ff] p-4 transition hover:bg-[#eaf2ff]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{lead.fullName}</p>
                      <p className="text-sm text-slate-700">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(lead.status)}`}>{lead.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyClasses(lead.urgency)}`}>{lead.urgency}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{formatCurrency(lead.estimatedCents)}</span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#163f87]">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                </Link>
              )) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f4f8ff] p-4 text-sm text-slate-700">
                  Nothing urgent right now.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{queueLabel(queueFilter)}</h3>
                <p className="text-sm text-slate-700">A cleaner list view with the next action visible on every lead.</p>
              </div>
              <form className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by name, service, location, phone, or email"
                  className="min-w-[280px] rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                />
                {queueFilter !== "ALL" ? <input type="hidden" name="queue" value={queueFilter} /> : null}
                <button type="submit" className="rounded-xl bg-[#163f87] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#12346f]">Search</button>
              </form>
            </div>

            <div className="mt-6 space-y-4">
              {filteredLeads.length ? filteredLeads.map((lead) => {
                const needsAttention = Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt < now);
                const dueSoon = Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= threeDays);

                return (
                  <div key={lead.id} className="rounded-[26px] border border-blue-200 bg-[#f7fbff] p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/leads/${lead.id}`} className="text-lg font-semibold text-slate-900 hover:text-[#163f87]">{lead.fullName}</Link>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(lead.status)}`}>{lead.status}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyClasses(lead.urgency)}`}>{lead.urgency}</span>
                          {needsAttention ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">Needs attention</span> : null}
                          {!needsAttention && dueSoon ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">Due soon</span> : null}
                        </div>

                        <p className="mt-2 text-sm font-medium text-slate-800">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-700">
                          <span>{lead.phone || lead.email || "No contact info"}</span>
                          <span>{lead.source}</span>
                          <span>{formatCurrency(lead.estimatedCents)}</span>
                          <span>{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                        {hasPermission("editLeads") ? (
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Status</p>
                            <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
                          </div>
                        ) : null}
                        {hasPermission("editLeads") ? (
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Next follow-up</p>
                            <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f7fbff] p-4 text-sm text-slate-700">
                  No leads match this view yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recently added</h3>
                <p className="text-sm text-slate-700">A quick list of the latest inquiries hitting the system.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recentLeads.length ? recentLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-[#f7fbff] p-4 transition hover:bg-[#eef5ff]">
                  <div>
                    <p className="font-semibold text-slate-900">{lead.fullName}</p>
                    <p className="mt-1 text-sm text-slate-700">{lead.serviceType}</p>
                  </div>
                  <div className="text-right text-xs text-slate-700">
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
