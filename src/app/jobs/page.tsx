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
      return "bg-amber-100 text-amber-700";
    case "SCHEDULED":
      return "bg-sky-100 text-sky-700";
    case "IN_PROGRESS":
      return "bg-violet-100 text-violet-700";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
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

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  const quotedJobs = jobs.filter((job) => job.status === "QUOTED");
  const unscheduledJobs = jobs.filter((job) => !job.scheduledFor && job.status !== "COMPLETED" && job.status !== "CANCELLED");
  const upcomingJobs = jobs.filter((job) => job.scheduledFor && job.scheduledFor >= now && job.scheduledFor <= weekFromNow);
  const completedJobs = jobs.filter((job) => job.status === "COMPLETED");

  return (
    <DashboardShell email={email} role={role} currentPath="/jobs">
      <PageHeader
        eyebrow="Operations"
        title="Jobs"
        description="Track quoted work, unscheduled jobs, and everything already booked on the calendar."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">All jobs</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{jobs.length}</p>
        </div>
        <div className="rounded-[28px] bg-amber-600 p-5 text-white shadow-[0_16px_36px_rgba(217,119,6,0.20)]">
          <p className="text-sm text-white/80">Quoted</p>
          <p className="mt-3 text-3xl font-semibold">{quotedJobs.length}</p>
        </div>
        <div className="rounded-[28px] bg-sky-600 p-5 text-white shadow-[0_16px_36px_rgba(2,132,199,0.20)]">
          <p className="text-sm text-white/80">Unscheduled</p>
          <p className="mt-3 text-3xl font-semibold">{unscheduledJobs.length}</p>
        </div>
        <div className="rounded-[28px] bg-emerald-600 p-5 text-white shadow-[0_16px_36px_rgba(5,150,105,0.20)]">
          <p className="text-sm text-white/80">This week</p>
          <p className="mt-3 text-3xl font-semibold">{upcomingJobs.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Quoted & unscheduled" description="This is the conversion zone — work here to turn quotes into booked revenue." />
            <div className="mt-6 space-y-3">
              {[...quotedJobs, ...unscheduledJobs.filter((job) => !quotedJobs.some((item) => item.id === job.id))].length ? [...quotedJobs, ...unscheduledJobs.filter((job) => !quotedJobs.some((item) => item.id === job.id))].map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.lead?.fullName || "No linked customer"} • {job.serviceType}</p>
                    <p className="mt-1 text-xs text-slate-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled yet"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(job.status)}`}>{job.status}</span>
                    <span className="text-sm text-slate-700">{formatCurrency(job.finalCents ?? job.quotedCents)}</span>
                  </div>
                </Link>
              )) : <EmptyState title="No quoted or unscheduled jobs" description="As leads convert into jobs, the work that still needs scheduling will surface here." />}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle title="All jobs" description="Every quoted, scheduled, or completed job in one place." />
            <div className="mt-6 overflow-x-auto">
              {jobs.length ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 font-medium">Job</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Scheduled</th>
                      <th className="pb-3 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4">
                          <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:text-blue-700">{job.title}</Link>
                          <p className="text-slate-500">{job.serviceType}</p>
                        </td>
                        <td className="py-4 text-slate-700">{job.lead?.fullName || "—"}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(job.status)}`}>{job.status}</span>
                        </td>
                        <td className="py-4 text-slate-700">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "—"}</td>
                        <td className="py-4 text-slate-700">{formatCurrency(job.finalCents ?? job.quotedCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState title="No jobs yet" description="Convert a lead into a job from the Leads page and it will show up here." />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Upcoming this week" description="The next jobs already on the board." action={<Link href="/calendar" className="text-sm text-blue-700 hover:text-blue-800">Open calendar</Link>} />
            <div className="mt-6 space-y-3">
              {upcomingJobs.length ? upcomingJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-slate-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : <EmptyState title="No upcoming jobs" description="Scheduled work for the next 7 days will appear here." />}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle title="Completed" description="Recently finished work." />
            <div className="mt-6 space-y-3">
              {completedJobs.slice(0, 6).length ? completedJobs.slice(0, 6).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-slate-500">{job.completedAt ? formatDateTime(job.completedAt) : "Marked completed"}</p>
                </Link>
              )) : <EmptyState title="No completed jobs yet" description="Finished jobs will create a nice proof-of-work history here." />}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
