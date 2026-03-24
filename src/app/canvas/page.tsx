import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { getAdminContext } from "@/lib/admin";

export default async function CanvasPage() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  return (
    <DashboardShell email={email} role={role} currentPath="/jobs">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm text-zinc-400">Product reset</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Canvas is gone</h2>
        <p className="mt-4 max-w-2xl text-sm text-zinc-500">
          This app is being rebuilt into DavyG CRM for home-service businesses. The old school-specific Canvas area has been retired.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/leads" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">Open leads</Link>
          <Link href="/jobs" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">Open jobs</Link>
        </div>
      </div>
    </DashboardShell>
  );
}
