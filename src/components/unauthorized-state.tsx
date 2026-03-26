import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function UnauthorizedState({ email }: { email?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f8] px-4 text-slate-900">
      <div className="w-full max-w-lg rounded-[30px] border border-blue-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#163f87]">DavyG</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">You don&apos;t have access to this page</h1>
        <p className="mt-3 text-sm text-slate-700">
          Your current company role does not have permission to open this area.
        </p>
        <div className="mt-6 rounded-2xl bg-[#fff6df] p-4 text-sm text-amber-900">
          Signed in as: <span className="font-medium">{email ?? "unknown user"}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] hover:bg-blue-50">
            Back to dashboard
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
