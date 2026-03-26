import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { JobEditForm } from "@/components/job-edit-form";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

type JobDetailPageProps = {
  params: Promise<{ jobId: string }>;
};

function formatCurrency(cents?: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewJobs")) {
    return <UnauthorizedState email={email} />;
  }

  const { jobId } = await params;
  const job = await db.job.findUnique({ where: { id: jobId }, include: { lead: true } });

  if (!job) {
    notFound();
  }

  return (
    <DashboardShell email={email} role={role} currentPath="/jobs">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Job detail</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{job.title}</h2>
          <p className="mt-2 text-sm text-zinc-500">{job.serviceType}</p>
        </div>
        <Link href="/jobs" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Back to jobs</Link>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Job summary</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Customer</p>
                <p className="mt-2 font-medium">{job.lead?.fullName || "No linked lead"}</p>
                <p className="mt-1 text-sm text-zinc-500">{job.lead?.phone || job.lead?.email || "No contact info"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Status</p>
                <p className="mt-2 font-medium">{job.status}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Scheduled</p>
                <p className="mt-2 font-medium">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Value</p>
                <p className="mt-2 font-medium">{formatCurrency(job.finalCents ?? job.quotedCents)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-4">
                <p className="text-sm text-amber-100/80">Quote status</p>
                <p className="mt-2 font-medium text-white">{job.quoteStatus}</p>
                <p className="mt-1 text-xs text-amber-100/60">{job.quotedAt ? `Sent ${formatDateTime(job.quotedAt)}` : "Not sent yet"}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-100/80">Invoice status</p>
                <p className="mt-2 font-medium text-white">{job.invoiceStatus}</p>
                <p className="mt-1 text-xs text-emerald-100/60">{job.invoicePaidAt ? `Paid ${formatDateTime(job.invoicePaidAt)}` : job.invoiceSentAt ? `Sent ${formatDateTime(job.invoiceSentAt)}` : "No invoice activity yet"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Address</p>
              <p className="mt-2 text-sm text-zinc-200">{job.address || "No address yet"}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Notes</p>
              <p className="mt-2 text-sm text-zinc-200">{job.notes || "No notes yet"}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {hasPermission("editJobs") ? (
            <JobEditForm
              jobId={job.id}
              initial={{
                title: job.title,
                serviceType: job.serviceType,
                status: job.status,
                quoteStatus: job.quoteStatus,
                invoiceStatus: job.invoiceStatus,
                scheduledFor: job.scheduledFor?.toISOString() ?? null,
                quotedCents: job.quotedCents,
                finalCents: job.finalCents,
                address: job.address,
                notes: job.notes,
              }}
            />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-500">
              You can view this job, but your role cannot edit it.
            </div>
          )}
        </aside>
      </div>
    </DashboardShell>
  );
}
