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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">All jobs</p>
          <p className="mt-3 text-3xl font-semibold">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-5">
          <p className="text-sm text-amber-100/80">Quoted</p>
          <p className="mt-3 text-3xl font-semibold text-white">{quotedJobs.length}</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5">
          <p className="text-sm text-cyan-100/80">Unscheduled</p>
          <p className="mt-3 text-3xl font-semibold text-white">{unscheduledJobs.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-5">
          <p className="text-sm text-emerald-100/80">This week</p>
          <p className="mt-3 text-3xl font-semibold text-white">{upcomingJobs.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Quoted & unscheduled" description="This is the conversion zone — work here to turn quotes into booked revenue." />
            <div className="mt-6 space-y-3">
              {[...quotedJobs, ...unscheduledJobs.filter((job) => !quotedJobs.some((item) => item.id === job.id))].length ? [...quotedJobs, ...unscheduledJobs.filter((job) => !quotedJobs.some((item) => item.id === job.id))].map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{job.title}</p>
                    <p className="text-sm text-zinc-400">{job.lead?.fullName || "No linked customer"} • {job.serviceType}</p>
                    <p className="mt-1 text-xs text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled yet"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusClasses(job.status)}`}>{job.status}</span>
                    <span className="text-sm text-zinc-300">{formatCurrency(job.finalCents ?? job.quotedCents)}</span>
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
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Upcoming this week" description="The next jobs already on the board." action={<Link href="/calendar" className="text-sm text-cyan-300 hover:text-cyan-200">Open calendar</Link>} />
            <div className="mt-6 space-y-3">
              {upcomingJobs.length ? upcomingJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </Link>
              )) : <EmptyState title="No upcoming jobs" description="Scheduled work for the next 7 days will appear here." />}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle title="Completed" description="Recently finished work." />
            <div className="mt-6 space-y-3">
              {completedJobs.slice(0, 6).length ? completedJobs.slice(0, 6).map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{job.lead?.fullName || "No linked customer"}</p>
                  <p className="mt-2 text-sm text-zinc-500">{job.completedAt ? formatDateTime(job.completedAt) : "Marked completed"}</p>
                </Link>
              )) : <EmptyState title="No completed jobs yet" description="Finished jobs will create a nice proof-of-work history here." />}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
