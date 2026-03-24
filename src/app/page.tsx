import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

function formatCurrency(cents?: number | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function leadStatusTone(status: string) {
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

export default async function Home() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  const weekFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  const [users, leads, jobs] = await Promise.all([
    db.user.count(),
    db.lead.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 8,
    }),
    db.job.findMany({
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
      take: 8,
      include: { lead: true },
    }),
  ]);

  const newLeads = leads.filter((lead) => lead.status === "NEW").length;
  const overdueFollowUps = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt < now).length;
  const jobsThisWeek = jobs.filter((job) => job.scheduledFor && job.scheduledFor >= now && job.scheduledFor <= weekFromNow).length;
  const pipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedCents ?? 0), 0);
  const followUpsToday = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= tomorrow);
  const upcomingJobs = jobs.filter((job) => job.scheduledFor && job.scheduledFor >= now).slice(0, 5);

  const stats = [
    { label: "New leads", value: String(newLeads), change: "this week" },
    { label: "Follow-ups overdue", value: String(overdueFollowUps), change: "needs action" },
    { label: "Jobs this week", value: String(jobsThisWeek), change: "scheduled" },
    { label: "Pipeline value", value: formatCurrency(pipelineValue), change: "quoted" },
  ];

  return (
    <DashboardShell email={email} role={role} currentPath="/">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Home service CRM</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Don’t let hot leads go cold</h2>
          <p className="mt-2 text-sm text-zinc-500">Track leads, follow-ups, quotes, and booked jobs without the chaos.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/leads" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">
            Open leads
          </Link>
          <Link href="/jobs" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            View jobs
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Leads needing attention</h3>
              <p className="text-sm text-zinc-400">Overdue follow-ups, fresh leads, and quotes still waiting</p>
            </div>
            <Link href="/leads" className="text-sm text-cyan-300 hover:text-cyan-200">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {leads.length ? (
              leads.map((lead) => (
                <div key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{lead.fullName}</p>
                    <p className="text-sm text-zinc-400">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${leadStatusTone(lead.status)}`}>{lead.status}</span>
                    <span className="text-sm text-zinc-300">{formatCurrency(lead.estimatedCents)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No leads yet. Next up is adding lead capture and create flow.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Today’s follow-ups</h3>
              <p className="mt-1 text-sm text-zinc-400">Who needs a text or call right now</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {followUpsToday.length ? (
              followUpsToday.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium">{lead.fullName}</p>
                  <p className="text-sm text-zinc-400">{lead.phone || lead.email || "No contact info"}</p>
                  <p className="mt-1 text-xs text-zinc-500">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "No date"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">Nothing scheduled for today.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upcoming jobs</h3>
              <p className="text-sm text-zinc-400">What’s already booked and on the calendar</p>
            </div>
            <Link href="/jobs" className="text-sm text-cyan-300 hover:text-cyan-200">View jobs</Link>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingJobs.length ? (
              upcomingJobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-zinc-400">{job.lead?.fullName || "No linked lead"} • {job.serviceType}</p>
                    <p className="mt-1 text-sm text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                  </div>
                  <div className="text-sm text-zinc-300">{formatCurrency(job.finalCents ?? job.quotedCents)}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No jobs booked yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Quick wins</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Accounts in app</p>
              <p className="mt-2 text-3xl font-semibold">{users}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">Next product step</p>
              <p className="mt-2 text-sm text-zinc-200">Add create/edit flows for leads and jobs, then SMS/email follow-up automation.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
