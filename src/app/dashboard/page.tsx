import Link from "next/link";
import { BillingCard } from "@/components/billing-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { DemoDataControls } from "@/components/demo-data-controls";
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
        eyebrow="Operations overview"
        title="Run the day without losing the thread"
        description="See the pipeline, today’s follow-ups, and upcoming jobs at a glance."
        actions={
          <>
            <PrimaryButton href="/leads">Open leads</PrimaryButton>
            <SecondaryButton href="/jobs">View jobs</SecondaryButton>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={String(newLeads)} hint="this week" />
        <StatCard label="Follow-ups overdue" value={String(overdueFollowUps)} hint="needs action" />
        <StatCard label="Jobs this week" value={String(jobsThisWeek)} hint="scheduled" />
        <StatCard label="Pipeline value" value={formatCurrency(pipelineValue)} hint="quoted" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard>
          <SectionTitle title="Business pulse" description="A fast read on pipeline health, scheduled revenue, and what needs attention next." />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100/80">Closing soon</p>
              <p className="mt-2 text-3xl font-semibold text-white">{closingSoon}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-emerald-200/70">quoted or booked</p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100/80">Open job value</p>
              <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(openJobValue)}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-cyan-200/70">upcoming work</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-300">System posture</p>
              <p className="mt-2 text-lg font-semibold text-white">{hasLeads ? "Active pipeline" : "Needs first lead"}</p>
              <p className="mt-2 text-sm text-zinc-400">{hasFollowUps ? "Follow-ups are being tracked." : "No follow-up schedule yet."}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle title="Quick actions" description="The moves that keep the day from slipping." />
          <div className="mt-6 grid gap-3">
            <Link href="/leads" className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
              <p className="font-medium text-white">Review leads pipeline</p>
              <p className="mt-1 text-sm text-zinc-400">Triage new leads, update statuses, and schedule follow-ups.</p>
            </Link>
            <Link href="/jobs" className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
              <p className="font-medium text-white">Check upcoming jobs</p>
              <p className="mt-1 text-sm text-zinc-400">Make sure scheduled work is staffed, priced, and ready.</p>
            </Link>
            {hasPermission("manageUsers") ? (
              <Link href="/users" className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10">
                <p className="font-medium text-white">Audit team access</p>
                <p className="mt-1 text-sm text-zinc-400">Keep roles clean across owner, admin, sales, ops, and viewers.</p>
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard>
          <SectionTitle title="Leads needing attention" description="Overdue follow-ups, fresh leads, and quotes still waiting" action={<Link href="/leads" className="text-sm text-cyan-300 hover:text-cyan-200">View all</Link>} />
          <div className="mt-6 space-y-3">
            {leads.length ? leads.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{lead.fullName}</p>
                  <p className="text-sm text-zinc-400">{lead.serviceType}{lead.location ? ` • ${lead.location}` : ""}</p>
                  <p className="mt-1 text-sm text-zinc-500">{lead.nextFollowUpAt ? `Follow up ${formatDateTime(lead.nextFollowUpAt)}` : "No follow-up scheduled"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${leadStatusTone(lead.status)}`}>{lead.status}</span>
                  <span className="text-sm text-zinc-300">{formatCurrency(lead.estimatedCents)}</span>
                </div>
              </div>
            )) : <EmptyState title="No leads yet" description="Create your first lead in the Leads tab to start building the pipeline." />}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionTitle title="Today’s follow-ups" description="Who needs a text or call right now" />
          <div className="mt-6 space-y-4">
            {followUpsToday.length ? followUpsToday.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">{lead.fullName}</p>
                <p className="text-sm text-zinc-400">{lead.phone || lead.email || "No contact info"}</p>
                <p className="mt-1 text-xs text-zinc-500">{lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "No date"}</p>
              </div>
            )) : <EmptyState title="Nothing scheduled for today" description="As follow-ups are assigned, they’ll appear here for quick action." />}
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2">
          <SectionTitle title="Upcoming jobs" description="What’s already booked and on the calendar" action={<Link href="/jobs" className="text-sm text-cyan-300 hover:text-cyan-200">View jobs</Link>} />
          <div className="mt-6 space-y-3">
            {upcomingJobs.length ? upcomingJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-sm text-zinc-400">{job.lead?.fullName || "No linked lead"} • {job.serviceType}</p>
                  <p className="mt-1 text-sm text-zinc-500">{job.scheduledFor ? formatDateTime(job.scheduledFor) : "Not scheduled"}</p>
                </div>
                <div className="text-sm text-zinc-300">{formatCurrency(job.finalCents ?? job.quotedCents)}</div>
              </Link>
            )) : <EmptyState title="No jobs booked yet" description="Convert a lead into a job from the Leads page and it’ll show up here automatically." />}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle title="Quick wins" />
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">Accounts in app</p>
                <p className="mt-2 text-3xl font-semibold text-white">{users}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-zinc-400">What to build next</p>
                <p className="mt-2 text-sm text-zinc-200">Wire live Stripe, plug in email/SMS providers, and use the demo workspace for sales calls.</p>
              </div>
            </div>
          </SectionCard>
          {hasPermission("manageBilling") ? <BillingCard /> : null}
          {hasPermission("manageNotifications") ? <NotificationsCard /> : null}
          {hasPermission("useDemoTools") ? <DemoDataControls /> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
