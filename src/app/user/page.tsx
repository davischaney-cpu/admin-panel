import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function UserPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f8] px-4 py-10 text-slate-900">
      <div className="w-full max-w-5xl rounded-[30px] border border-blue-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <UserProfile path="/user" routing="path" appearance={clerkAppearance} />
      </div>
    </main>
  );
}
