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
      return "bg-rose-100 text-rose-800";
    case "LOW":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-amber-100 text-amber-800";
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
      <header className="rounded-[30px] bg-[#0f3d91] px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,61,145,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-blue-100/85">Lead detail</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{lead.fullName}</h2>
            <p className="mt-2 text-sm text-blue-100/85">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
          </div>
          <Link href="/leads" className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#0f3d91] transition hover:bg-blue-50">Back to leads</Link>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#163f87] px-3 py-1 text-xs font-medium text-white">{lead.status}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyClasses(lead.urgency)}`}>{lead.urgency} priority</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">{lead.source}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Contact</p>
                <p className="mt-2 font-semibold text-slate-900">{lead.phone || "No phone"}</p>
                <p className="mt-1 text-sm text-slate-700">{lead.email || "No email"}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Estimated value</p>
                <p className="mt-2 font-semibold text-slate-900">{formatCurrency(lead.estimatedCents)}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Created</p>
                <p className="mt-2 font-semibold text-slate-900">{formatDateTime(lead.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Next follow-up</p>
                <p className="mt-2 font-semibold text-slate-900">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "Not scheduled"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
              <p className="text-sm text-slate-600">Notes</p>
              <p className="mt-2 text-sm text-slate-800">{lead.notes || "No notes yet"}</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Quote & booking progress</h3>
              <span className="text-sm text-slate-700">{lead.jobs.length} linked job{lead.jobs.length === 1 ? "" : "s"}</span>
            </div>

            {activeJob ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#fff6df] p-4">
                  <p className="text-sm text-amber-800">Quote</p>
                  <p className="mt-2 font-semibold text-slate-900">{activeJob.quoteStatus}</p>
                </div>
                <div className="rounded-2xl bg-[#e9f4ff] p-4">
                  <p className="text-sm text-sky-800">Job</p>
                  <p className="mt-2 font-semibold text-slate-900">{activeJob.status}</p>
                </div>
                <div className="rounded-2xl bg-[#eaf9f1] p-4">
                  <p className="text-sm text-emerald-800">Invoice</p>
                  <p className="mt-2 font-semibold text-slate-900">{activeJob.invoiceStatus}</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-[#f7fbff] p-4 text-sm text-slate-700">
                No quote or job yet. Create one from the actions panel when this lead is ready.
              </div>
            )}

            <div className="mt-5 space-y-3">
              {lead.jobs.length ? lead.jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-blue-200 bg-[#f7fbff] p-4 hover:bg-[#eef5ff]">
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{job.status} • {job.quoteStatus} quote • {job.invoiceStatus} invoice</p>
                  <p className="mt-1 text-xs text-[#163f87]">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : null}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[30px] border border-blue-200 bg-[#e8f1ff] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
            <div className="mt-4 space-y-4">
              {hasPermission("editLeads") ? (
                <div>
                  <p className="mb-2 text-sm text-slate-600">Status</p>
                  <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
                </div>
              ) : null}
              {hasPermission("editLeads") ? (
                <div>
                  <p className="mb-2 text-sm text-slate-600">Next follow-up</p>
                  <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
                </div>
              ) : null}
              {hasPermission("convertLeads") ? (
                <CreateJobFromLeadButton leadId={lead.id} fullName={lead.fullName} serviceType={lead.serviceType} estimatedCents={lead.estimatedCents} location={lead.location} />
              ) : (
                <div className="text-sm text-slate-700">Your role can view this lead but cannot convert it into a job.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
