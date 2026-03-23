import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] px-4 text-zinc-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-cyan-950/20 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden border-r border-white/10 p-10 lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Wilson</p>
          <h1 className="mt-4 max-w-sm text-4xl font-semibold tracking-tight">Admin dashboard that actually looks legit.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Secure access, clean analytics, and a modern control panel foundation built with Next.js and Clerk.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["Protected routes", "Dashboard stays locked until you sign in."],
              ["Clerk auth", "Email, OAuth, sessions, and user management."],
              ["Fast UI", "Modern layout with room for charts and tables."],
              ["Ready to grow", "Add roles, billing, and data next."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h2 className="font-medium text-white">{title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative p-3 sm:p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-2">
            <SignIn
              path="/login"
              routing="path"
              signUpUrl="/sign-up"
              appearance={clerkAppearance}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
