import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
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
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
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

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Address</p>
            <p className="mt-2 text-sm text-zinc-200">{job.address || "No address yet"}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-400">Notes</p>
            <p className="mt-2 text-sm text-zinc-200">{job.notes || "No notes yet"}</p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Next actions</h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Add job editing so scheduled date, notes, and status can be updated from this page.</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Add messaging automation so booked customers get reminders before the appointment.</div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
