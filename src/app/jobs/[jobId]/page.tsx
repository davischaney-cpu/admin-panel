import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/activity-timeline";
import { DashboardShell } from "@/components/dashboard-shell";
import { JobEditForm } from "@/components/job-edit-form";
import { QuoteActions } from "@/components/quote-actions";
import { QuoteBuilder } from "@/components/quote-builder";
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
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      lead: true,
      quoteItems: { orderBy: { position: "asc" } },
      activityEvents: { orderBy: [{ createdAt: "desc" }], take: 20 },
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <DashboardShell email={email} role={role} currentPath="/jobs">
      <header className="rounded-[30px] bg-[#0f3d91] px-6 py-6 text-white shadow-[0_18px_50px_rgba(15,61,145,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-blue-100/85">Job detail</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{job.title}</h2>
            <p className="mt-2 text-sm text-blue-100/85">{job.serviceType}</p>
          </div>
          <Link href="/jobs" className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#0f3d91] transition hover:bg-blue-50">Back to jobs</Link>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-semibold text-slate-900">Job summary</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Customer</p>
                <p className="mt-2 font-semibold text-slate-900">{job.lead?.fullName || "No linked lead"}</p>
                <p className="mt-1 text-sm text-slate-700">{job.lead?.phone || job.lead?.email || "No contact info"}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Status</p>
                <p className="mt-2 font-semibold text-slate-900">{job.status}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Scheduled</p>
                <p className="mt-2 font-semibold text-slate-900">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
                <p className="text-sm text-slate-600">Quote total</p>
                <p className="mt-2 font-semibold text-slate-900">{formatCurrency(job.quoteTotalCents ?? job.quotedCents)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#fff6df] p-4">
                <p className="text-sm text-amber-800">Quote status</p>
                <p className="mt-2 font-semibold text-slate-900">{job.quoteStatus}</p>
                <p className="mt-1 text-xs text-amber-900/70">{job.quotedAt ? `Sent ${formatDateTime(job.quotedAt)}` : "Not sent yet"}</p>
              </div>
              <div className="rounded-2xl bg-[#eaf9f1] p-4">
                <p className="text-sm text-emerald-800">Invoice status</p>
                <p className="mt-2 font-semibold text-slate-900">{job.invoiceStatus}</p>
                <p className="mt-1 text-xs text-emerald-900/70">{job.invoicePaidAt ? `Paid ${formatDateTime(job.invoicePaidAt)}` : job.invoiceSentAt ? `Sent ${formatDateTime(job.invoiceSentAt)}` : "No invoice activity yet"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
              <p className="text-sm text-slate-600">Address</p>
              <p className="mt-2 text-sm text-slate-800">{job.address || "No address yet"}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-[#f7fbff] p-4">
              <p className="text-sm text-slate-600">Notes</p>
              <p className="mt-2 text-sm text-slate-800">{job.notes || "No notes yet"}</p>
            </div>
          </div>

          <div className="rounded-[30px] border border-blue-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Quote workflow</h3>
                <p className="text-sm text-slate-700">Once the quote looks right, move it through the real customer flow.</p>
              </div>
            </div>
            <div className="mt-5">
              <QuoteActions jobId={job.id} quoteStatus={job.quoteStatus} />
            </div>
          </div>

          <QuoteBuilder
            jobId={job.id}
            initialItems={job.quoteItems}
            initialTaxCents={job.quoteTaxCents}
            initialDiscountCents={job.quoteDiscountCents}
          />

          <ActivityTimeline title="Job activity" items={job.activityEvents} />
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
            <div className="rounded-[30px] border border-blue-200 bg-[#e8f1ff] p-6 text-sm text-slate-700">
              You can view this job, but your role cannot edit it.
            </div>
          )}
        </aside>
      </div>
    </DashboardShell>
  );
}
