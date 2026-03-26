import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function UserPage() {
  return (
    <main className="min-h-screen bg-[#edf3f8] px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-[#163f87] hover:bg-blue-50">
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </Link>
        </div>
        <div className="rounded-[30px] border border-blue-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <UserProfile path="/user" routing="path" appearance={clerkAppearance} />
        </div>
      </div>
    </main>
  );
}
