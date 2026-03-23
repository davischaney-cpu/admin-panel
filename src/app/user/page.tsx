import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function UserPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-10 text-zinc-50">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <UserProfile path="/user" routing="path" appearance={clerkAppearance} />
      </div>
    </main>
  );
}
