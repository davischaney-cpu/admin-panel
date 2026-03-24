import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState, PageHeader, SectionCard, SectionTitle } from "@/components/ui";
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
    case "QUOTED":
      return "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/20";
    case "SCHEDULED":
      return "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20";
    case "IN_PROGRESS":
      return "bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/20";
    case "COMPLETED":
      return "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/20";
    case "CANCELLED":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20";
    default:
      return "bg-white/10 text-zinc-300 ring-1 ring-white/10";
  }
}

export default async function JobsPage() {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewJobs")) {
    return <UnauthorizedState email={email} />;
  }

  const jobs = await db.job.findMany({
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
    include: { lead: true },
    take: 100,
  });

  return (
    <DashboardShell email={email} role={role} currentPath="/jobs">
      <PageHeader
        eyebrow="Operations"
        title="Jobs"
        description="Track scheduled work, customer context, and revenue tied to each job."
      />

      <SectionCard className="mt-8">
        <SectionTitle title="All jobs" description="Every quoted, scheduled, or completed job in one place." />
        <div className="mt-6 overflow-x-auto">
          {jobs.length ? (
            <table className="min-w-full text-left text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-medium">Job</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Scheduled</th>
                  <th className="pb-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 last:border-0">
                    <td className="py-4">
                      <Link href={`/jobs/${job.id}`} className="font-medium text-white hover:text-cyan-200">{job.title}</Link>
                      <p className="text-zinc-400">{job.serviceType}</p>
                    </td>
                    <td className="py-4 text-zinc-300">{job.lead?.fullName || "—"}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(job.status)}`}>{job.status}</span>
                    </td>
                    <td className="py-4 text-zinc-300">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "—"}</td>
                    <td className="py-4 text-zinc-300">{formatCurrency(job.finalCents ?? job.quotedCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No jobs yet" description="Convert a lead into a job from the Leads page and it will show up here." />
          )}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
