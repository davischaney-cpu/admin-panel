import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function UnauthorizedState({ email }: { email?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 text-zinc-50">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Wilson</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">You&apos;re signed in, but not approved yet</h1>
        <p className="mt-3 text-sm text-zinc-400">
          This dashboard is currently restricted to approved admin users only.
        </p>
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Signed in as: <span className="font-medium">{email ?? "unknown user"}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            Refresh access
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
