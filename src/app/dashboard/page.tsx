import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationsCard } from "@/components/notifications-card";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { EmptyState, PageHeader, PrimaryButton, SectionCard, SectionTitle, SecondaryButton, StatCard } from "@/components/ui";
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
      return "bg-sky-100 text-sky-700";
    case "CONTACTED":
      return "bg-violet-100 text-violet-700";
    case "QUOTED":
      return "bg-amber-100 text-amber-700";
    case "BOOKED":
      return "bg-emerald-100 text-emerald-700";
    case "LOST":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function DashboardPage() {
  const { email, role, hasPermission } = await getAdminContext();

  if (!hasPermission("viewDashboard")) {
    return <UnauthorizedState email={email} />;
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 1000 * 60 * 60 * 24);
  const weekFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

  const [users, leads, jobs] = await Promise.all([
    db.user.count(),
    db.lead.findMany({ orderBy: [{ updatedAt: "desc" }], take: 8 }),
    db.job.findMany({ orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }], take: 8, include: { lead: true } }),
  ]);

  const newLeads = leads.filter((lead) => lead.status === "NEW").length;
  const overdueFollowUps = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt < now).length;
  const jobsThisWeek = jobs.filter((job) => job.scheduledFor && job.scheduledFor >= now && job.scheduledFor <= weekFromNow).length;
  const pipelineValue = leads.reduce((sum, lead) => sum + (lead.estimatedCents ?? 0), 0);
  const followUpsToday = leads.filter((lead) => lead.nextFollowUpAt && lead.nextFollowUpAt >= now && lead.nextFollowUpAt <= tomorrow);
  const upcomingJobs = jobs.filter((job) => job.scheduledFor && job.scheduledFor >= now).slice(0, 5);
  const hasLeads = leads.length > 0;
  const hasJobs = jobs.length > 0;
  const hasFollowUps = leads.some((lead) => Boolean(lead.nextFollowUpAt));
  const closingSoon = leads.filter((lead) => lead.status === "QUOTED" || lead.status === "BOOKED").length;
  const openJobValue = upcomingJobs.reduce((sum, job) => sum + (job.finalCents ?? job.quotedCents ?? 0), 0);

  return (
    <DashboardShell email={email} role={role} currentPath="/dashboard">
      <PageHeader
        eyebrow="Overview"
        title="CRM dashboard"
        actions={
          <>
            <PrimaryButton href="/leads">Open leads</PrimaryButton>
            <SecondaryButton href="/jobs">View jobs</SecondaryButton>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={String(newLeads)} hint="this week" tone="purple" />
        <StatCard label="Follow-ups overdue" value={String(overdueFollowUps)} hint="needs action" tone="blue" />
        <StatCard label="Jobs this week" value={String(jobsThisWeek)} hint="scheduled" tone="cyan" />
        <StatCard label="Pipeline value" value={formatCurrency(pipelineValue)} hint="quoted" tone="green" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard>
          <SectionTitle title="Performance snapshot" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Closing soon</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{closingSoon}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">quoted or booked</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Open job value</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">{formatCurrency(openJobValue)}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">upcoming work</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Workspace status</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{hasLeads ? "Active pipeline" : "Needs first lead"}</p>
              <p className="mt-2 text-sm text-slate-500">{hasFollowUps ? "Follow-ups are being tracked." : "No follow-up schedule yet."}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle title="Quick actions" />
          <div className="mt-6 grid gap-3">
            <Link href="/leads" className="rounded-[22px] bg-slate-50 p-4 transition hover:bg-slate-100">
              <p className="font-medium text-slate-900">Review leads</p>
            </Link>
            <Link href="/jobs" className="rounded-[22px] bg-slate-50 p-4 transition hover:bg-slate-100">
              <p className="font-medium text-slate-900">Check jobs</p>
            </Link>
            {hasPermission("manageUsers") ? (
              <Link href="/users" className="rounded-[22px] bg-slate-50 p-4 transition hover:bg-slate-100">
                <p className="font-medium text-slate-900">Manage team</p>
              </Link>
            ) : null}
          </div>
        </SectionCard>
      </div>

      {!hasLeads ? (
        <div className="mt-8">
          <OnboardingChecklist hasLeads={hasLeads} hasJobs={hasJobs} hasFollowUps={hasFollowUps} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard>
          <SectionTitle title="Leads needing attention" action={<Link href="/leads" className="text-sm text-blue-700 hover:text-blue-800">View all</Link>} />
          <div className="mt-6 space-y-3">
            {leads.length ? leads.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 rounded-[22px] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{lead.fullName}</p>
                  <p className="text-sm text-slate-500">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                  <p className="mt-1 text-sm text-slate-400">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${leadStatusTone(lead.status)}`}>{lead.status}</span>
                  <span className="text-sm text-slate-700">{formatCurrency(lead.estimatedCents)}</span>
                </div>
              </div>
            )) : <EmptyState title="No leads yet" description="" />}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle title="Today’s follow-ups" />
          <div className="mt-6 space-y-4">
            {followUpsToday.length ? followUpsToday.map((lead) => (
              <div key={lead.id} className="rounded-[22px] bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{lead.fullName}</p>
                <p className="text-sm text-slate-500">{lead.phone || lead.email || "No contact info"}</p>
                <p className="mt-1 text-xs text-slate-400">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "No date"}</p>
              </div>
            )) : <EmptyState title="Nothing scheduled for today" description="" />}
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard>
          <SectionTitle title="Upcoming jobs" action={<Link href="/jobs" className="text-sm text-blue-700 hover:text-blue-800">View jobs</Link>} />
          <div className="mt-6 space-y-3">
            {upcomingJobs.length ? upcomingJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-[22px] bg-slate-50 p-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-500">{job.lead?.fullName || "No linked lead"} • {job.serviceType}</p>
                  <p className="mt-1 text-sm text-slate-400">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </div>
                <div className="text-sm text-slate-700">{formatCurrency(job.finalCents ?? job.quotedCents)}</div>
              </Link>
            )) : <EmptyState title="No jobs booked yet" description="" />}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Workspace stats" />
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Accounts in app</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{users}</p>
              </div>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Recommended next step</p>
              </div>
            </div>
          </SectionCard>
          {hasPermission("manageNotifications") ? <NotificationsCard /> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
