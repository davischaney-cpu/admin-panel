import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateJobFromLeadButton } from "@/components/create-job-from-lead-button";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadFollowUpActions } from "@/components/lead-follow-up-actions";
import { LeadStatusActions } from "@/components/lead-status-actions";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type LeadDetailPageProps = {
  params: Promise<{ leadId: string }>;
};

function formatCurrency(cents?: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
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

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewLeads")) return <UnauthorizedState email={email} />;

  const { leadId } = await params;
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { jobs: { orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }] } },
  });

  if (!lead) notFound();

  const activeJob = lead.jobs[0] ?? null;

  return (
    <DashboardShell email={email} role={role} currentPath="/leads">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Lead detail</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{lead.fullName}</h2>
          <p className="mt-2 text-sm text-zinc-500">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
        </div>
        <Link href="/leads" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Back to leads</Link>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">{lead.status}</span>
              <span className={`rounded-full px-3 py-1 text-xs ${urgencyClasses(lead.urgency)}`}>{lead.urgency} priority</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">{lead.source}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Contact</p>
                <p className="mt-2 font-medium">{lead.phone || "No phone"}</p>
                <p className="mt-1 text-sm text-zinc-500">{lead.email || "No email"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Estimated value</p>
                <p className="mt-2 font-medium">{formatCurrency(lead.estimatedCents)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Created</p>
                <p className="mt-2 font-medium">{formatDateTime(lead.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Next follow-up</p>
                <p className="mt-2 font-medium">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "Not scheduled"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Notes</p>
              <p className="mt-2 text-sm text-zinc-200">{lead.notes || "No notes yet"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quote & booking progress</h3>
              <span className="text-sm text-zinc-500">{lead.jobs.length} linked job{lead.jobs.length === 1 ? "" : "s"}</span>
            </div>

            {activeJob ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-4">
                  <p className="text-sm text-amber-100/80">Quote</p>
                  <p className="mt-2 font-medium text-white">{activeJob.quoteStatus}</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                  <p className="text-sm text-cyan-100/80">Job</p>
                  <p className="mt-2 font-medium text-white">{activeJob.status}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                  <p className="text-sm text-emerald-100/80">Invoice</p>
                  <p className="mt-2 font-medium text-white">{activeJob.invoiceStatus}</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
                No quote or job yet. Create one from the actions panel when this lead is ready.
              </div>
            )}

            <div className="mt-5 space-y-3">
              {lead.jobs.length ? lead.jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10">
                  <p className="font-medium">{job.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{job.status} • {job.quoteStatus} quote • {job.invoiceStatus} invoice</p>
                  <p className="mt-1 text-xs text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : null}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Actions</h3>
            <div className="mt-4 space-y-4">
              {hasPermission("editLeads") ? (
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Status</p>
                  <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
                </div>
              ) : null}
              {hasPermission("editLeads") ? (
                <div>
                  <p className="mb-2 text-sm text-zinc-400">Next follow-up</p>
                  <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
                </div>
              ) : null}
              {hasPermission("convertLeads") ? (
                <CreateJobFromLeadButton leadId={lead.id} fullName={lead.fullName} serviceType={lead.serviceType} estimatedCents={lead.estimatedCents} location={lead.location} />
              ) : (
                <div className="text-sm text-zinc-500">Your role can view this lead but cannot convert it into a job.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
