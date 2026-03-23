import { DashboardShell } from "@/components/dashboard-shell";
import { ImportGradesForm } from "@/components/import-grades-form";
import { UnauthorizedState } from "@/components/unauthorized-state";
import { ImportCanvasFromBrowserButton } from "@/components/import-canvas-from-browser-button";
import { getAdminContext } from "@/lib/admin";

export default async function CanvasImportPage() {
  const { email, role, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <UnauthorizedState email={email} />;
  }

  return (
    <DashboardShell email={email} role={role} currentPath="/canvas">
      <header className="border-b border-white/10 pb-6">
        <p className="text-sm text-zinc-400">Canvas integration</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Import grades</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Save Better Canvas dashboard grades into your app.
        </p>
      </header>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Import directly from Canvas in Chrome</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Uses your local logged-in Chrome session to open each Canvas grades page and save the visible totals.
          </p>
          <ImportCanvasFromBrowserButton />
        </div>

        <ImportGradesForm />
      </div>
    </DashboardShell>
  );
}
