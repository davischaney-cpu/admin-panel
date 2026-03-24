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

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) return <UnauthorizedState email={email} />;

  const { leadId } = await params;
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { jobs: { orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }] } },
  });

  if (!lead) notFound();

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

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Lead summary</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Contact</p>
                <p className="mt-2 font-medium">{lead.phone || "No phone"}</p>
                <p className="mt-1 text-sm text-zinc-500">{lead.email || "No email"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Value</p>
                <p className="mt-2 font-medium">{formatCurrency(lead.estimatedCents)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Created</p>
                <p className="mt-2 font-medium">{formatDateTime(lead.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Source</p>
                <p className="mt-2 font-medium">{lead.source}</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Notes</p>
              <p className="mt-2 text-sm text-zinc-200">{lead.notes || "No notes yet"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Related jobs</h3>
              <span className="text-sm text-zinc-500">{lead.jobs.length}</span>
            </div>
            <div className="mt-5 space-y-3">
              {lead.jobs.length ? lead.jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10">
                  <p className="font-medium">{job.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{job.status} • {job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-zinc-500">No jobs yet for this lead.</div>}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Actions</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm text-zinc-400">Status</p>
                <LeadStatusActions leadId={lead.id} currentStatus={lead.status} />
              </div>
              <div>
                <p className="mb-2 text-sm text-zinc-400">Next follow-up</p>
                <LeadFollowUpActions leadId={lead.id} currentValue={lead.nextFollowUpAt?.toISOString() ?? null} />
              </div>
              <CreateJobFromLeadButton leadId={lead.id} fullName={lead.fullName} serviceType={lead.serviceType} estimatedCents={lead.estimatedCents} location={lead.location} />
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
